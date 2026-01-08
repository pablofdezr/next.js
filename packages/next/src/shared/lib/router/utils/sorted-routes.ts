import { PARAMETER_PATTERN } from './get-dynamic-param'
import { INTERCEPTION_ROUTE_MARKERS } from './interception-routes'

class UrlNode {
  placeholder: boolean = true
  children: Map<string, UrlNode> = new Map()
  slugName: string | null = null
  hybridSlugNames: Map<string, string> = new Map()
  restSlugName: string | null = null
  optionalRestSlugName: string | null = null
  restSlugPrefix: string | null = null
  optionalRestSlugPrefix: string | null = null
  restSlugSuffix: string | null = null
  optionalRestSlugSuffix: string | null = null

  insert(urlPath: string): void {
    this._insert(urlPath.split('/').filter(Boolean), [], false)
  }

  smoosh(): string[] {
    return this._smoosh()
  }

  private _smoosh(prefix: string = '/'): string[] {
    const childrenPaths = [...this.children.keys()].sort()
    if (this.slugName !== null) {
      childrenPaths.splice(childrenPaths.indexOf('[]'), 1)
    }
    const hybridKeys = [...this.hybridSlugNames.keys()].sort()
    for (const key of hybridKeys) {
      const index = childrenPaths.indexOf(key)
      if (index >= 0) {
        childrenPaths.splice(index, 1)
      }
    }
    if (this.restSlugName !== null) {
      childrenPaths.splice(childrenPaths.indexOf('[...]'), 1)
    }
    if (this.optionalRestSlugName !== null) {
      childrenPaths.splice(childrenPaths.indexOf('[[...]]'), 1)
    }

    const routes = childrenPaths
      .map((c) => this.children.get(c)!._smoosh(`${prefix}${c}/`))
      .reduce((prev, curr) => [...prev, ...curr], [])

    for (const key of hybridKeys) {
      const slugName = this.hybridSlugNames.get(key)
      if (!slugName) continue

      const segment = key.replace('[]', `[${slugName}]`)
      routes.push(...this.children.get(key)!._smoosh(`${prefix}${segment}/`))
    }

    if (this.slugName !== null) {
      routes.push(
        ...this.children.get('[]')!._smoosh(`${prefix}[${this.slugName}]/`)
      )
    }

    if (!this.placeholder) {
      const r = prefix === '/' ? '/' : prefix.slice(0, -1)
      if (this.optionalRestSlugName != null) {
        throw new Error(
          `You cannot define a route with the same specificity as a optional catch-all route ("${r}" and "${r}[[...${this.optionalRestSlugName}]]").`
        )
      }

      routes.unshift(r)
    }

    if (this.restSlugName !== null) {
      const segmentPrefix = this.restSlugPrefix ?? ''
      const segmentSuffix = this.restSlugSuffix ?? ''
      routes.push(
        ...this.children
          .get('[...]')!
          ._smoosh(
            `${prefix}${segmentPrefix}[...${this.restSlugName}]${segmentSuffix}/`
          )
      )
    }

    if (this.optionalRestSlugName !== null) {
      const segmentPrefix = this.optionalRestSlugPrefix ?? ''
      const segmentSuffix = this.optionalRestSlugSuffix ?? ''
      routes.push(
        ...this.children
          .get('[[...]]')!
          ._smoosh(
            `${prefix}${segmentPrefix}[[...${this.optionalRestSlugName}]]${segmentSuffix}/`
          )
      )
    }

    return routes
  }

  private _insert(
    urlPaths: string[],
    slugNames: string[],
    isCatchAll: boolean
  ): void {
    if (urlPaths.length === 0) {
      this.placeholder = false
      return
    }

    if (isCatchAll) {
      throw new Error(`Catch-all must be the last part of the URL.`)
    }

    // The next segment in the urlPaths list
    let nextSegment = urlPaths[0]

    // Use PARAMETER_PATTERN so we handle both fully dynamic and hybrid segments.
    const paramMatches = nextSegment.match(PARAMETER_PATTERN)
    if (paramMatches) {
      let segmentName = paramMatches[2]
      const prefix = paramMatches[1]
      const suffix = paramMatches[3]
      const marker = INTERCEPTION_ROUTE_MARKERS.find((m) =>
        prefix.startsWith(m)
      )
      // Interception markers are part of the prefix but shouldn't count as a hybrid affix.
      const prefixWithoutMarker = marker ? prefix.slice(marker.length) : prefix

      let optional = false
      if (segmentName.startsWith('[') && segmentName.endsWith(']')) {
        // Strip optional `[` and `]`, leaving only `something`
        segmentName = segmentName.slice(1, -1)
        optional = true
      }

      if (segmentName.startsWith('…')) {
        throw new Error(
          `Detected a three-dot character ('…') at ('${segmentName}'). Did you mean ('...')?`
        )
      }

      let repeat = false
      if (segmentName.startsWith('...')) {
        // Strip `...`, leaving only `something`
        segmentName = segmentName.substring(3)
        repeat = true
      }

      const hasHybridAffix = prefixWithoutMarker.length > 0 || suffix.length > 0
      const hasAnyAffix = prefix.length > 0 || suffix.length > 0
      // hasHybridAffix is used to block catch-all with static affixes.
      // Examples (segment-level):
      // - OK: "[id]", "post-[id]", "(.)[id]"
      // - Error: "post-[...slug]", "[...slug]-tail"
      // - Error: "[type]-in-[location]" (multiple params in one segment)

      if (
        segmentName.startsWith('[') ||
        segmentName.endsWith(']') ||
        suffix.includes(']')
      ) {
        const badName = `${segmentName}${suffix.includes(']') ? ']' : ''}`
        throw new Error(
          `Segment names may not start or end with extra brackets ('${badName}').`
        )
      }

      if (segmentName.startsWith('.')) {
        throw new Error(
          `Segment names may not start with erroneous periods ('${segmentName}').`
        )
      }

      function handleSlug(previousSlug: string | null, nextSlug: string) {
        if (previousSlug !== null) {
          // If the specific segment already has a slug but the slug is not `something`
          // This prevents collisions like:
          // pages/[post]/index.js
          // pages/[id]/index.js
          // Because currently multiple dynamic params on the same segment level are not supported
          if (previousSlug !== nextSlug) {
            // TODO: This error seems to be confusing for users, needs an error link, the description can be based on above comment.
            throw new Error(
              `You cannot use different slug names for the same dynamic path ('${previousSlug}' !== '${nextSlug}').`
            )
          }
        }

        slugNames.forEach((slug) => {
          if (slug === nextSlug) {
            throw new Error(
              `You cannot have the same slug name "${nextSlug}" repeat within a single dynamic path`
            )
          }

          if (slug.replace(/\W/g, '') === nextSlug.replace(/\W/g, '')) {
            throw new Error(
              `You cannot have the slug names "${slug}" and "${nextSlug}" differ only by non-word symbols within a single dynamic path`
            )
          }
        })

        slugNames.push(nextSlug)
      }

      if (repeat) {
        // Catch-all segments cannot have static affixes in the same segment.
        // Examples:
        // - OK: "/docs/[...slug]", "/(.)[...slug]"
        // - Error: "/docs-[...slug]", "/[...slug]-tail"
        if (hasHybridAffix) {
          throw new Error(
            `Catch-all segments cannot include prefixes or suffixes ("${urlPaths[0]}").`
          )
        }

        isCatchAll = true
        if (optional) {
          if (this.restSlugName != null) {
            throw new Error(
              `You cannot use both an required and optional catch-all route at the same level ("[...${this.restSlugName}]" and "${urlPaths[0]}" ).`
            )
          }
          if (
            this.optionalRestSlugName != null &&
            ((this.optionalRestSlugPrefix ?? '') !== prefix ||
              (this.optionalRestSlugSuffix ?? '') !== suffix)
          ) {
            throw new Error(
              `You cannot use different optional catch-all route patterns at the same level ("${urlPaths[0]}").`
            )
          }

          handleSlug(this.optionalRestSlugName, segmentName)
          // slugName is kept as it can only be one particular slugName
          this.optionalRestSlugName = segmentName
          this.optionalRestSlugPrefix = prefix
          this.optionalRestSlugSuffix = suffix
          // nextSegment is overwritten to [[...]] so that it can later be sorted specifically
          nextSegment = '[[...]]'
        } else {
          if (this.optionalRestSlugName != null) {
            throw new Error(
              `You cannot use both an optional and required catch-all route at the same level ("[[...${this.optionalRestSlugName}]]" and "${urlPaths[0]}").`
            )
          }
          if (
            this.restSlugName != null &&
            ((this.restSlugPrefix ?? '') !== prefix ||
              (this.restSlugSuffix ?? '') !== suffix)
          ) {
            throw new Error(
              `You cannot use different catch-all route patterns at the same level ("${urlPaths[0]}").`
            )
          }

          handleSlug(this.restSlugName, segmentName)
          // slugName is kept as it can only be one particular slugName
          this.restSlugName = segmentName
          this.restSlugPrefix = prefix
          this.restSlugSuffix = suffix
          // nextSegment is overwritten to [...] so that it can later be sorted specifically
          nextSegment = '[...]'
        }
      } else {
        if (optional) {
          throw new Error(
            `Optional route parameters are not yet supported ("${urlPaths[0]}").`
          )
        }

        if (hasAnyAffix) {
          // Group by static affixes so /post-[id] and /post-[slug] collide.
          // Examples:
          // - "/post-[id]" + "/post-[slug]" -> conflict at this level.
          // - "/post-[id]" + "/item-[id]" -> no conflict (different prefix).
          // - "/house-in-[location]" -> hybrid segment allowed.
          const hybridKey = `${prefix}[]${suffix}`
          handleSlug(this.hybridSlugNames.get(hybridKey) ?? null, segmentName)
          this.hybridSlugNames.set(hybridKey, segmentName)
          nextSegment = hybridKey
        } else {
          handleSlug(this.slugName, segmentName)
          // slugName is kept as it can only be one particular slugName
          this.slugName = segmentName
          // nextSegment is overwritten to [] so that it can later be sorted specifically
          nextSegment = '[]'
        }
      }
    }

    // If this UrlNode doesn't have the nextSegment yet we create a new child UrlNode
    if (!this.children.has(nextSegment)) {
      this.children.set(nextSegment, new UrlNode())
    }

    this.children
      .get(nextSegment)!
      ._insert(urlPaths.slice(1), slugNames, isCatchAll)
  }
}

/**
 * @deprecated Use `sortSortableRoutes` or `sortPages` instead.
 */
export function getSortedRoutes(
  normalizedPages: ReadonlyArray<string>
): string[] {
  // First the UrlNode is created, and every UrlNode can have only 1 dynamic segment
  // Eg you can't have pages/[post]/abc.js and pages/[hello]/something-else.js
  // Only 1 dynamic segment per nesting level

  // So in the case that is test/integration/dynamic-routing it'll be this:
  // pages/[post]/comments.js
  // pages/blog/[post]/comment/[id].js
  // Both are fine because `pages/[post]` and `pages/blog` are on the same level
  // So in this case `UrlNode` created here has `this.slugName === 'post'`
  // And since your PR passed through `slugName` as an array basically it'd including it in too many possibilities
  // Instead what has to be passed through is the upwards path's dynamic names
  const root = new UrlNode()

  // Here the `root` gets injected multiple paths, and insert will break them up into sublevels
  normalizedPages.forEach((pagePath) => root.insert(pagePath))
  // Smoosh will then sort those sublevels up to the point where you get the correct route definition priority
  return root.smoosh()
}

/**
 * @deprecated Use `sortSortableRouteObjects` or `sortPageObjects` instead.
 */
export function getSortedRouteObjects<T>(
  objects: T[],
  getter: (obj: T) => string
): T[] {
  // We're assuming here that all the pathnames are unique, that way we can
  // sort the list and use the index as the key.
  const indexes: Record<string, number> = {}
  const pathnames: string[] = []
  for (let i = 0; i < objects.length; i++) {
    const pathname = getter(objects[i])
    indexes[pathname] = i
    pathnames[i] = pathname
  }

  // Sort the pathnames.
  const sorted = getSortedRoutes(pathnames)

  // Map the sorted pathnames back to the original objects using the new sorted
  // index.
  return sorted.map((pathname) => objects[indexes[pathname]])
}

import type { BaseNextRequest, BaseNextResponse } from './base-http'
import type { NextUrlWithParsedQuery } from './request-meta'
import { addRequestMeta } from './request-meta'
import type {
  AIContentFormat,
  AIContentManifest,
  AIContentManifestEntry,
} from '../build/manifests/ai-content-manifest'
import {
  extensionToFormat,
  normalizeSupportedFormats,
} from '../build/manifests/ai-content-manifest'
import { promises as fs } from 'fs'
import { getRouteMatcher } from '../shared/lib/router/utils/route-matcher'
import { getRouteRegex } from '../shared/lib/router/utils/route-regex'
import { removeTrailingSlash } from '../shared/lib/router/utils/remove-trailing-slash'
import { AIContentNegotiator } from './ai-content-negotiator'
import { AIContentFormatError, AIContentRenderer } from './ai-content-renderer'
import {
  DEFAULT_CDN_CACHE_CONTROL_HEADER,
  getCacheControlHeader,
} from './lib/cache-control'
import type { Params } from './request/params'
import type { I18NProvider } from './lib/i18n-provider'
import type {
  MatchOptions,
  RouteMatcherManager,
} from './route-matcher-managers/route-matcher-manager'
import type { RouteDefinition } from './route-definitions/route-definition'
import { isAppPageRouteDefinition } from './route-definitions/app-page-route-definition'
import { RouteKind } from './route-kind'
import { requirePage } from './require'
import { getPageModule } from './lib/app-dir-module'

type RouteMatch = {
  entry: AIContentManifestEntry
  matcher: ReturnType<typeof getRouteMatcher>
}

type EntryMatch = {
  entry: AIContentManifestEntry
  params: Params
  definition?: RouteDefinition
  appPaths?: ReadonlyArray<string> | null
}

type EnsurePage = (opts: {
  page: string
  clientOnly: boolean
  appPaths?: ReadonlyArray<string> | null
  definition?: RouteDefinition
  url?: string
}) => Promise<void>

type DevRoutingOptions = {
  matchers: RouteMatcherManager
  i18nProvider?: I18NProvider
  ensurePage?: EnsurePage
}

const DEFAULT_AI_FORMATS: AIContentFormat[] = [
  'markdown',
  'json',
  'llm',
  'text',
]

export class AIContentRouter {
  private manifest: AIContentManifest | null = null
  private staticRoutes = new Map<string, AIContentManifestEntry>()
  private dynamicRoutes: RouteMatch[] = []
  private devRouting: DevRoutingOptions | null = null

  constructor(
    private readonly options: {
      distDir: string
      cdnCacheControlHeader?: string
    }
  ) {}

  setDevRouting(options?: DevRoutingOptions | null) {
    this.devRouting = options ?? null
  }

  async loadManifest(manifestPath: string): Promise<void> {
    try {
      const data = await fs.readFile(manifestPath, 'utf8')
      const parsed = JSON.parse(data) as AIContentManifest
      this.setManifest(parsed)
    } catch {
      this.setManifest(null)
    }
  }

  async handle(
    pathname: string,
    req: BaseNextRequest,
    res: BaseNextResponse,
    parsedUrl?: NextUrlWithParsedQuery
  ): Promise<boolean> {
    if (!this.manifest && !this.devRouting) {
      return false
    }

    if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
      return false
    }

    const normalizedPath = removeTrailingSlash(pathname)
    const { basePath, formatFromExtension, hasExtension } =
      this.resolvePathAndFormat(normalizedPath)

    if (!basePath) {
      return false
    }

    const match = await this.getEntryForPath(basePath, req.url)

    if (!match) {
      return false
    }

    const { entry, params } = match

    const acceptHeader = Array.isArray(req.headers?.accept)
      ? req.headers?.accept.join(',')
      : req.headers?.accept

    const negotiatedFormat = hasExtension
      ? formatFromExtension
      : AIContentNegotiator.negotiate({
          pathname: normalizedPath,
          acceptHeader,
          supportedFormats: entry.supportedFormats,
          defaultFormat: entry.defaultFormat ?? 'html',
        })

    if (!negotiatedFormat || negotiatedFormat === 'html') {
      return false
    }

    if (!entry.supportedFormats.includes(negotiatedFormat)) {
      res.statusCode = 404
      res.body('Not Found').send()
      return true
    }

    // Add match to request meta to enable logging in dev server
    addRequestMeta(req, 'match', {
      definition: {
        kind: RouteKind.APP_PAGE,
        page: entry.page,
        pathname: entry.route,
        filename: entry.sourceFile,
        bundlePath: '',
      },
      params: params,
    } as any)

    try {
      const searchParams = this.parseSearchParams(parsedUrl)

      // Capture start of rendering phase for timing logs
      const internalsStart = process.hrtime.bigint()
      addRequestMeta(req, 'devRequestTimingInternalsEnd', internalsStart)

      const { body, revalidate } = await AIContentRenderer.render({
        entry,
        distDir: this.options.distDir,
        context: {
          params,
          searchParams,
        },
        format: negotiatedFormat,
      })

      if (!hasExtension) {
        res.appendHeader('vary', 'Accept')
      }

      const cacheHeaders = getCacheControlHeader({
        revalidate: typeof revalidate === 'undefined' ? 3600 : revalidate,
        expire: undefined,
      })
      res.setHeader('Cache-Control', cacheHeaders['Cache-Control'])
      if (cacheHeaders.cdnCacheControl) {
        res.setHeader(
          this.options.cdnCacheControlHeader ??
            DEFAULT_CDN_CACHE_CONTROL_HEADER,
          cacheHeaders.cdnCacheControl
        )
      }

      res.statusCode = 200
      res.setHeader(
        'Content-Type',
        AIContentNegotiator.getContentType(negotiatedFormat)
      )

      if (req.method === 'HEAD') {
        res.body('').send()
        return true
      }

      const payload = typeof body === 'string' ? body : JSON.stringify(body)
      res.body(payload).send()
      return true
    } catch (error) {
      if (error instanceof AIContentFormatError) {
        res.statusCode = 406
        res.body('Not Acceptable').send()
        return true
      }

      console.error('[AI Content] Error handling request:', error)
      res.statusCode = 500
      res.body('Internal Server Error').send()
      return true
    }
  }

  private setManifest(manifest: AIContentManifest | null) {
    this.manifest = manifest
    this.staticRoutes.clear()
    this.dynamicRoutes = []

    if (!manifest) return

    for (const [route, entry] of Object.entries(manifest.routes)) {
      this.staticRoutes.set(route, entry)
      if (entry.isDynamic) {
        this.dynamicRoutes.push({
          entry,
          matcher: getRouteMatcher(getRouteRegex(route)),
        })
      }
    }
  }

  private async getEntryForPath(
    pathname: string,
    reqUrl?: string
  ): Promise<EntryMatch | null> {
    if (this.manifest) {
      const staticEntry = this.staticRoutes.get(pathname)
      if (staticEntry) {
        return { entry: staticEntry, params: {} }
      }

      for (const route of this.dynamicRoutes) {
        const params = route.matcher(pathname)
        if (params) {
          return {
            entry: route.entry,
            params,
          }
        }
      }

      return null
    }

    return this.getDevEntry(pathname, reqUrl)
  }

  private async getDevEntry(
    pathname: string,
    reqUrl?: string
  ): Promise<EntryMatch | null> {
    if (!this.devRouting) {
      return null
    }

    const matchOptions: MatchOptions = {
      i18n: this.devRouting.i18nProvider?.analyze(pathname),
    }
    const match = await this.devRouting.matchers.match(pathname, matchOptions)

    if (!match) {
      return null
    }

    const { definition } = match
    if (
      definition.kind !== RouteKind.APP_PAGE &&
      definition.kind !== RouteKind.PAGES
    ) {
      return null
    }

    const isAppPath = definition.kind === RouteKind.APP_PAGE
    const appPaths =
      isAppPath && isAppPageRouteDefinition(definition)
        ? definition.appPaths
        : null

    if (this.devRouting.ensurePage) {
      await this.devRouting.ensurePage({
        page: definition.page,
        clientOnly: false,
        appPaths,
        definition,
        url: reqUrl,
      })
    }

    const mod = await this.loadUserlandModule(definition.page, isAppPath)

    if (typeof mod.experimentalGenerateAI !== 'function') {
      return null
    }

    const exportedFormats = Array.isArray(mod.experimentalAIFormats)
      ? mod.experimentalAIFormats
      : DEFAULT_AI_FORMATS
    const filteredFormats = exportedFormats.filter(
      (format: string): format is AIContentFormat =>
        format === 'markdown' ||
        format === 'json' ||
        format === 'llm' ||
        format === 'text'
    )
    const supportedFormats = normalizeSupportedFormats(
      filteredFormats.length ? filteredFormats : DEFAULT_AI_FORMATS
    )

    const entry: AIContentManifestEntry = {
      route: definition.pathname,
      page: definition.page,
      sourceFile: definition.filename,
      isAppPath,
      isDynamic: definition.pathname.includes('['),
      hasGenerateStaticParams: typeof mod.generateStaticParams === 'function',
      supportedFormats,
      revalidate:
        typeof mod.revalidate === 'number' || mod.revalidate === false
          ? mod.revalidate
          : undefined,
      defaultFormat: 'html',
    }

    return {
      entry,
      params: match.params ?? {},
      definition,
      appPaths,
    }
  }

  private async loadUserlandModule(page: string, isAppPath: boolean) {
    const mod = await requirePage(page, this.options.distDir, isAppPath)
    if (!isAppPath) {
      return mod
    }

    const routeModule = mod?.routeModule
    const loaderTree = routeModule?.userland?.loaderTree
    if (!loaderTree) {
      return mod
    }

    const { mod: userland } = await getPageModule(loaderTree)
    return userland ?? mod
  }

  private resolvePathAndFormat(pathname: string): {
    basePath: string
    formatFromExtension: AIContentFormat | null
    hasExtension: boolean
  } {
    const match = pathname.match(/\.(md|json|llm|txt)$/i)
    if (!match) {
      return {
        basePath: pathname,
        formatFromExtension: null,
        hasExtension: false,
      }
    }

    const ext = match[0]
    return {
      basePath: pathname.slice(0, -ext.length) || '/',
      formatFromExtension: extensionToFormat(ext),
      hasExtension: true,
    }
  }

  private parseSearchParams(
    parsedUrl?: NextUrlWithParsedQuery
  ): Record<string, string | string[]> {
    const query = parsedUrl?.query
    const result: Record<string, string | string[]> = {}

    if (!query || typeof query === 'string') {
      return result
    }

    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'undefined') continue
      if (Array.isArray(value)) {
        result[key] = value.map((item) => item.toString())
      } else {
        result[key] = value.toString()
      }
    }

    return result
  }
}

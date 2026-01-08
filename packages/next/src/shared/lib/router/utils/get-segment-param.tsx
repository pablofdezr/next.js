import { INTERCEPTION_ROUTE_MARKERS } from './interception-routes'
import type { DynamicParamTypes } from '../../app-router-types'

export type SegmentParam = {
  paramName: string
  paramType: DynamicParamTypes
}

const PARAMETER_PATTERN = /^([^[]*)\[((?:\[[^\]]*\])|[^\]]*)\](.*)$/

/**
 * Parse dynamic route segment to type of parameter
 */
export function getSegmentParam(segment: string): SegmentParam | null {
  const interceptionMarker = INTERCEPTION_ROUTE_MARKERS.find((marker) =>
    segment.startsWith(marker)
  )

  // if an interception marker is part of the path segment, we need to jump ahead
  // to the relevant portion for param parsing
  if (interceptionMarker) {
    segment = segment.slice(interceptionMarker.length)
  }

  const segmentMatch = segment.match(PARAMETER_PATTERN)
  if (segmentMatch) {
    // Optional catch-all still inherits the existing limitation with parallel
    // routes, but parsing is now generic and does not special-case interception.
    let paramName = segmentMatch[2]
    let optional = false

    if (paramName.startsWith('[') && paramName.endsWith(']')) {
      paramName = paramName.slice(1, -1)
      optional = true
    }

    let repeat = false
    if (paramName.startsWith('...')) {
      paramName = paramName.slice(3)
      repeat = true
    }

    if (optional && !repeat) {
      // Preserve old behavior for unsupported optional params.
      paramName = `[${paramName}]`
    }

    return {
      paramType: repeat
        ? optional
          ? 'optional-catchall'
          : interceptionMarker
            ? `catchall-intercepted-${interceptionMarker}`
            : 'catchall'
        : interceptionMarker
          ? `dynamic-intercepted-${interceptionMarker}`
          : 'dynamic',
      paramName,
    }
  }

  return null
}

export function isCatchAll(
  type: DynamicParamTypes
): type is
  | 'catchall'
  | 'catchall-intercepted-(..)(..)'
  | 'catchall-intercepted-(.)'
  | 'catchall-intercepted-(..)'
  | 'catchall-intercepted-(...)'
  | 'optional-catchall' {
  return (
    type === 'catchall' ||
    type === 'catchall-intercepted-(..)(..)' ||
    type === 'catchall-intercepted-(.)' ||
    type === 'catchall-intercepted-(..)' ||
    type === 'catchall-intercepted-(...)' ||
    type === 'optional-catchall'
  )
}

export function getParamProperties(paramType: DynamicParamTypes): {
  repeat: boolean
  optional: boolean
} {
  let repeat = false
  let optional = false

  switch (paramType) {
    case 'catchall':
    case 'catchall-intercepted-(..)(..)':
    case 'catchall-intercepted-(.)':
    case 'catchall-intercepted-(..)':
    case 'catchall-intercepted-(...)':
      repeat = true
      break
    case 'optional-catchall':
      repeat = true
      optional = true
      break
    case 'dynamic':
    case 'dynamic-intercepted-(..)(..)':
    case 'dynamic-intercepted-(.)':
    case 'dynamic-intercepted-(..)':
    case 'dynamic-intercepted-(...)':
      break
    default:
      paramType satisfies never
  }

  return { repeat, optional }
}

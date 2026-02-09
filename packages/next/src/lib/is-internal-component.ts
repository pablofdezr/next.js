export function isInternalComponent(pathname: string): boolean {
  switch (pathname) {
    case 'next-hybrid/dist/pages/_app':
    case 'next-hybrid/dist/pages/_document':
      return true
    default:
      return false
  }
}

export function isNonRoutePagesPage(pathname: string): boolean {
  return pathname === '/_app' || pathname === '/_document'
}

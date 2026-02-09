export type AIContentFormat = 'html' | 'markdown' | 'json' | 'llm' | 'text'

export interface AIContentManifestEntry {
  route: string
  page: string
  sourceFile: string
  isAppPath: boolean
  isDynamic: boolean
  hasGenerateStaticParams: boolean
  dynamicParams?: string[]
  supportedFormats: AIContentFormat[]
  revalidate?: number | false
  defaultFormat?: AIContentFormat
}

export interface AIContentManifest {
  version: 1
  routes: Record<string, AIContentManifestEntry>
  extensionRoutes: Record<string, string>
}

export function formatToExtension(format: AIContentFormat): string {
  switch (format) {
    case 'markdown':
      return '.md'
    case 'json':
      return '.json'
    case 'llm':
      return '.llm'
    case 'text':
      return '.txt'
    default:
      return ''
  }
}

export function extensionToFormat(ext: string): AIContentFormat | null {
  switch (ext.toLowerCase()) {
    case '.md':
      return 'markdown'
    case '.json':
      return 'json'
    case '.llm':
      return 'llm'
    case '.txt':
      return 'text'
    default:
      return null
  }
}

export function normalizeSupportedFormats(
  formats: AIContentFormat[] | undefined
): AIContentFormat[] {
  const normalized = new Set<AIContentFormat>()
  normalized.add('html')
  if (formats) {
    for (const format of formats) {
      normalized.add(format)
    }
  }
  return Array.from(normalized)
}

export function buildAIContentManifest(
  entries: AIContentManifestEntry[]
): AIContentManifest {
  const manifest: AIContentManifest = {
    version: 1,
    routes: {},
    extensionRoutes: {},
  }

  for (const entry of entries) {
    manifest.routes[entry.route] = entry

    for (const format of entry.supportedFormats) {
      if (format === 'html') continue
      const ext = formatToExtension(format)
      if (!ext) continue
      manifest.extensionRoutes[`${entry.route}${ext}`] = entry.route
    }
  }

  return manifest
}

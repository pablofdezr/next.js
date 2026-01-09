import type { AIContentFormat } from '../build/manifests/ai-content-manifest'
import { extensionToFormat } from '../build/manifests/ai-content-manifest'

export interface ContentNegotiationContext {
  pathname: string
  acceptHeader?: string
  supportedFormats: AIContentFormat[]
  defaultFormat: AIContentFormat
}

export class AIContentNegotiator {
  static negotiate(context: ContentNegotiationContext): AIContentFormat {
    const ext = this.extractExtension(context.pathname)
    if (ext) {
      const format = extensionToFormat(ext)
      if (format && context.supportedFormats.includes(format)) {
        return format
      }
    }

    if (context.acceptHeader) {
      const format = this.negotiateByAccept(
        context.acceptHeader,
        context.supportedFormats,
        context.defaultFormat
      )
      if (format) {
        return format
      }
    }

    return context.defaultFormat
  }

  static getContentType(format: AIContentFormat): string {
    switch (format) {
      case 'markdown':
        return 'text/markdown; charset=utf-8'
      case 'json':
        return 'application/json; charset=utf-8'
      case 'llm':
        return 'application/llm+json; charset=utf-8'
      case 'html':
        return 'text/html; charset=utf-8'
      default:
        return 'application/octet-stream'
    }
  }

  private static extractExtension(pathname: string): string | null {
    const match = pathname.match(/\.(md|json|llm)$/i)
    return match ? match[0] : null
  }

  private static negotiateByAccept(
    acceptHeader: string,
    supportedFormats: AIContentFormat[],
    defaultFormat: AIContentFormat
  ): AIContentFormat | null {
    const types = acceptHeader
      .split(',')
      .map((value) => {
        const [mediaType, ...params] = value.trim().split(';')
        const qValue = params.find((param) => param.trim().startsWith('q='))
        const quality = qValue ? Number(qValue.split('=')[1]) : 1
        return {
          mediaType: mediaType.trim().toLowerCase(),
          quality: Number.isNaN(quality) ? 0 : quality,
        }
      })
      .sort((a, b) => b.quality - a.quality)

    for (const { mediaType } of types) {
      const format = this.mediaTypeToFormat(mediaType)
      if (format && supportedFormats.includes(format)) {
        return format
      }

      if (mediaType === '*/*') {
        return defaultFormat
      }
    }

    return null
  }

  private static mediaTypeToFormat(mediaType: string): AIContentFormat | null {
    if (mediaType === 'text/markdown' || mediaType === 'application/markdown') {
      return 'markdown'
    }
    if (
      mediaType === 'application/json' ||
      mediaType === 'application/vnd.api+json'
    ) {
      return 'json'
    }
    if (
      mediaType === 'application/llm+json' ||
      mediaType === 'application/x.llm+json'
    ) {
      return 'llm'
    }
    if (mediaType === 'text/html' || mediaType === 'application/xhtml+xml') {
      return 'html'
    }

    return null
  }
}

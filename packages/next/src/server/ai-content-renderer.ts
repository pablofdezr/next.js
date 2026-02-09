import type {
  AIContentFormat,
  AIContentManifestEntry,
} from '../build/manifests/ai-content-manifest'
import { format as formatErrorMessage } from 'util'
import { requirePage } from './require'
import type { Params } from './request/params'
import { getPageModule } from './lib/app-dir-module'

export interface AIContent {
  markdown?: string
  json?: Record<string, any>
  llm?: {
    system: string
    user: string
  }
  text?: string
}

export interface RenderAIContentContext {
  params: Params
  searchParams: Record<string, string | string[]>
}

export class AIContentFormatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AIContentFormatError'
  }
}

export class AIContentRenderer {
  static async render({
    entry,
    distDir,
    context,
    format,
  }: {
    entry: AIContentManifestEntry
    distDir: string
    context: RenderAIContentContext
    format: AIContentFormat
  }): Promise<{
    body: string | object
    revalidate?: number | false
  }> {
    const mod = await this.loadModule(entry, distDir)

    if (typeof mod.experimentalGenerateAI !== 'function') {
      throw new Error(
        formatErrorMessage(
          'Module %s does not export experimentalGenerateAI',
          entry.page
        )
      )
    }

    const aiContent: AIContent = await mod.experimentalGenerateAI({
      params: context.params,
      searchParams: context.searchParams,
    })

    const body = this.selectFormat(aiContent, format)

    return {
      body,
      revalidate: entry.revalidate,
    }
  }

  private static async loadModule(
    entry: AIContentManifestEntry,
    distDir: string
  ): Promise<Record<string, any>> {
    const mod = await requirePage(entry.page, distDir, entry.isAppPath)

    if (!entry.isAppPath) {
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

  private static selectFormat(
    content: AIContent,
    format: AIContentFormat
  ): string | object {
    switch (format) {
      case 'markdown':
        if (!content.markdown) {
          throw new AIContentFormatError(
            'Markdown format requested but not provided'
          )
        }
        return content.markdown
      case 'json':
        if (!content.json) {
          throw new AIContentFormatError(
            'JSON format requested but not provided'
          )
        }
        return content.json
      case 'llm':
        if (!content.llm) {
          throw new AIContentFormatError(
            'LLM format requested but not provided'
          )
        }
        return content.llm
      case 'text':
        if (!content.text) {
          throw new AIContentFormatError(
            'Text format requested but not provided'
          )
        }
        return content.text
      case 'html':
        throw new AIContentFormatError(
          'HTML format should not be rendered here'
        )
      default:
        throw new AIContentFormatError(
          formatErrorMessage('Unknown format: %s', format)
        )
    }
  }
}

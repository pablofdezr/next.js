declare module 'next' {
  export interface ExperimentalAIContentContext {
    params: Record<string, string | string[] | undefined>
    searchParams: Record<string, string | string[]>
  }

  export interface ExperimentalAIContent {
    markdown?: string
    json?: Record<string, any>
    llm?: {
      system: string
      user: string
    }
  }
}

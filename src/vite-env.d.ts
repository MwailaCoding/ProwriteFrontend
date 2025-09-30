/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_LINKEDIN_API_KEY: string
  readonly VITE_INDEED_API_KEY: string
  readonly VITE_GLASSDOOR_API_KEY: string
  readonly VITE_BLS_API_KEY: string
  readonly VITE_COMPANY_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import { registerAs } from '@nestjs/config'

export type BrowserConfig = {
  headless: boolean
  windowPosition: string
  hola: boolean
  holaPath: string
}

export default registerAs('browser', () => ({
  headless: Number(process.env.BROWSER_HEADLESS) === 1,
  windowPosition: process.env.BROWSER_WINDOW_POSITION || '0,0',
  hola: Number(process.env.BROWSER_HOLA) === 1,
  holaPath: process.env.BROWSER_HOLA_BIN_PATH || '',
}))

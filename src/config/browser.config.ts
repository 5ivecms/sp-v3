import { registerAs } from '@nestjs/config'

export type BrowserConfig = {
  headless: boolean
  windowPosition: string
}

export default registerAs('browser', () => ({
  headless: Number(process.env.BROWSER_HEADLESS) === 1,
  windowPosition: process.env.BROWSER_WINDOW_POSITION || '0,0',
}))

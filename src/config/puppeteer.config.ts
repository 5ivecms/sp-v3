import { registerAs } from '@nestjs/config'

export type PuppeteerConfig = {
  headless: boolean | 'new'
}

export default registerAs('puppeteer', () => {
  const headlessEnv = process.env.PUPPETEER_HEADLESS
  let headless: boolean | string = false
  if (headlessEnv === 'new') {
    headless = 'new'
  } else {
    if (headlessEnv === '1') {
      headless = true
    } else {
      console.log('nen')
      headless = false
    }
  }
  return {
    headless,
  }
})

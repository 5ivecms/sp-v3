import { registerAs } from '@nestjs/config'

export type CaptchaConfig = {
  captchaService: string
  captchaRemoteServiceUrl: string
}

export default registerAs('captchaConfig', () => ({
  captchaService: process.env.CAPTCHA_SERVICE,
  captchaRemoteServiceUrl: process.env.CAPTCHA_REMOTE_SERVICE_URL,
}))

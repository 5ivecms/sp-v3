import { registerAs } from '@nestjs/config'

export type CaptchaGuruConfig = {
  apiKey: string
}

export default registerAs('captchaGuru', () => ({
  apiKey: String(process.env.CAPTCHA_GURU_API_KEY),
}))

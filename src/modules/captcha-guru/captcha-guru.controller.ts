import { Controller, Get } from '@nestjs/common'
import { path } from 'app-root-path'

import { CaptchaGuruService } from './captcha-guru.service'

@Controller('api/captcha-guru')
export class CaptchaGuruController {
  constructor(private readonly captchaGuruService: CaptchaGuruService) {}

  @Get('yandex-smart-captcha')
  public yandexSmartCaptcha() {
    return this.captchaGuruService.yandexSmartCaptcha(`${path}/captcha/0e57a2c6-622e-40db-aee3-a3fcb9deb315.png`)
  }

  @Get('yandex-text-captcha')
  public yandexTextCaptcha() {
    return this.captchaGuruService.yandexTextCaptcha(`${path}/captcha/cb495d15-06fd-4b51-99e6-c88956996085.png`)
  }
}

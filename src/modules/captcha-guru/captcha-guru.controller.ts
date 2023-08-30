import { Controller, Get } from '@nestjs/common'
import { CaptchaGuruService } from './captcha-guru.service'
import { path } from 'app-root-path'

@Controller('api/captcha-guru')
export class CaptchaGuruController {
  constructor(private readonly captchaGuruService: CaptchaGuruService) {}

  @Get('yandex-smart-captcha')
  public yandexSmartCaptcha() {
    return this.captchaGuruService.yandexSmartCaptcha(`${path}/captcha/1eeaeb9e-3ae4-41a3-a62e-75ec89fd05a5.png`)
  }
}

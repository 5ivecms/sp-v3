import { Module } from '@nestjs/common'

import { CaptchaGuruModule } from '../captcha-guru/captcha-guru.module'
import { LoggerModule } from '../logger/logger.module'
import { Parser2Controller } from './parser2.controller'
import { Parser2Service } from './parser2.service'
import { YandexCaptchaService } from './yandex-captcha.service'
import { YandexSearchService } from './yandex-search.service'

@Module({
  imports: [LoggerModule, CaptchaGuruModule],
  controllers: [Parser2Controller],
  exports: [Parser2Service],
  providers: [Parser2Service, YandexSearchService, YandexCaptchaService],
})
export class Parser2Module {}

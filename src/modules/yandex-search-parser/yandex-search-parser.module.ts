import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { XEvilModule } from '../xevil/xevil.module'
import { YandexSearchParserController } from './yandex-search-parser.controller'
import { YandexSearchParserService } from './yandex-search-parser.service'
import { LoggerModule } from '../logger/logger.module'
import { CaptchaGuruModule } from '../captcha-guru/captcha-guru.module'

@Module({
  imports: [ConfigModule, XEvilModule, LoggerModule, CaptchaGuruModule],
  controllers: [YandexSearchParserController],
  providers: [YandexSearchParserService],
  exports: [YandexSearchParserService],
})
export class YandexSearchParserModule {}

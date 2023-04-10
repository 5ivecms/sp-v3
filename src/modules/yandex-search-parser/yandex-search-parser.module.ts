import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { XEvilModule } from '../xevil/xevil.module'
import { YandexSearchParserController } from './yandex-search-parser.controller'
import { YandexSearchParserService } from './yandex-search-parser.service'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [ConfigModule, XEvilModule, LoggerModule],
  controllers: [YandexSearchParserController],
  providers: [YandexSearchParserService],
  exports: [YandexSearchParserService],
})
export class YandexSearchParserModule {}

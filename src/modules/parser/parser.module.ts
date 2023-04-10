import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ParserController } from './parser.controller'
import { ParserService } from './parser.service'
import { WordpressModule } from '../wordpress/wordpress.module'
import { BrowserModule } from '../browser/browser.module'
import { YandexSearchParserModule } from '../yandex-search-parser/yandex-search-parser.module'
import { LinksFilterModule } from '../links-filter/links-filter.module'
import { ArticleGeneratorModule } from '../article-generator/article-generator.module'
import { ParserCommand } from './parser.command'
import { MailSearchParserModule } from '../mail-search-parser/mail-search-parser.module'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [
    WordpressModule,
    BrowserModule,
    YandexSearchParserModule,
    MailSearchParserModule,
    LinksFilterModule,
    ArticleGeneratorModule,
    ConfigModule,
    LoggerModule,
  ],
  controllers: [ParserController],
  providers: [ParserService, ParserCommand],
  exports: [ParserService, ParserCommand],
})
export class ParserModule {}

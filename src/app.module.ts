import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CommandModule } from 'nestjs-command'
import { LoggerModule } from 'nestjs-pino'
import * as Joi from 'joi'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import {
  articleGeneratorConfig,
  browserConfig,
  captchaConfig,
  captchaGuruConfig,
  mailSearchConfig,
  parserConfig,
  readabilityConfig,
  searchEngineConfig,
  serverConfig,
  wordpressConfig,
} from './config'
import { ArticleGeneratorModule } from './modules/article-generator/article-generator.module'
import { BrowserModule } from './modules/browser/browser.module'
import { LinksFilterModule } from './modules/links-filter/links-filter.module'
import { MailSearchParserModule } from './modules/mail-search-parser/mail-search-parser.module'
import { ReadabilityModule } from './modules/readability/readability.module'
import { WordpressModule } from './modules/wordpress/wordpress.module'
import { XEvilModule } from './modules/xevil/xevil.module'
import { YandexSearchParserModule } from './modules/yandex-search-parser/yandex-search-parser.module'
import { ParserModule } from './modules/parser/parser.module'
import { CaptchaGuruModule } from './modules/captcha-guru/captcha-guru.module'

const ENV = process.env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env.dev' : `.env.${ENV}`,
      load: [
        serverConfig,
        wordpressConfig,
        articleGeneratorConfig,
        browserConfig,
        mailSearchConfig,
        searchEngineConfig,
        captchaConfig,
        parserConfig,
        readabilityConfig,
        captchaGuruConfig,
      ],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').default('dev'),
        PORT: Joi.number().default(5000),
        WORDPRESS_DOMAIN: Joi.string().required(),
        WORDPRESS_THREADS: Joi.number().required(),
        KEYWORDS_PER_THREAD: Joi.number().required(),
        BROWSER_HEADLESS: Joi.number().required(),
        SEARCH_ENGINE: Joi.string().default('mail').required(),
        MAIL_SEARCH_START_PAGE: Joi.number().min(1).required(),
        MAIL_SEARCH_LAST_PAGE: Joi.number().required(),
        CAPTCHA_SERVICE: Joi.string().default('local').required(),
        CAPTCHA_REMOTE_SERVICE_URL: Joi.string().default('').allow(''),
        ARTICLE_GENERATOR_MIN_ARTICLE_LENGTH: Joi.string().required(),
        ARTICLE_GENERATOR_MIN_ARTICLE_COUNT: Joi.number().required(),
        ARTICLE_GENERATOR_MAX_ARTICLE_COUNT: Joi.number().required(),
        READABILITY_AXIOS_TIMEOUT: Joi.number().required(),
        PARSER_BROWSER_TIMEOUT: Joi.number().required(),
        CAPTCHA_GURU_API_KEY: Joi.string().allow(''),
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true,
          },
        },
      },
    }),
    CommandModule,
    ReadabilityModule,
    LinksFilterModule,
    XEvilModule,
    BrowserModule,
    MailSearchParserModule,
    WordpressModule,
    ArticleGeneratorModule,
    YandexSearchParserModule,
    ParserModule,
    CaptchaGuruModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

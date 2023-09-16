import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { CommandModule } from 'nestjs-command'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import {
  articleGeneratorConfig,
  browserConfig,
  captchaGuruConfig,
  dbServer,
  keywordsConfig,
  parserConfig,
  puppeteerConfig,
  readabilityConfig,
  searchEngineConfig,
  serverConfig,
} from './config'
import siteConfig from './config/site.config'
import { ArticleGeneratorModule } from './modules/article-generator/article-generator.module'
import { CaptchaGuruModule } from './modules/captcha-guru/captcha-guru.module'
import { KeywordsModule } from './modules/keywords/keywords.module'
import { LinksFilterModule } from './modules/links-filter/links-filter.module'
import { Parser2Module } from './modules/parser2/parser2.module'
import { ReadabilityModule } from './modules/readability/readability.module'
import { SiteModule } from './modules/site/site.module'
import { SiteFillerModule } from './modules/site-filler/site-filler.module'
import { WordpressModule } from './modules/wordpress/wordpress.module'

const ENV = process.env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env.development' : `.env.${ENV}`,
      load: [
        serverConfig,
        articleGeneratorConfig,
        browserConfig,
        searchEngineConfig,
        parserConfig,
        readabilityConfig,
        captchaGuruConfig,
        puppeteerConfig,
        dbServer,
        siteConfig,
        keywordsConfig,
      ],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
        PORT: Joi.number().default(5000),
        KEYWORDS_PER_THREAD: Joi.number().required(),
        BROWSER_HEADLESS: Joi.number().required(),
        SEARCH_ENGINE: Joi.string().default('mail').required(),
        ARTICLE_GENERATOR_MIN_ARTICLE_LENGTH: Joi.string().required(),
        ARTICLE_GENERATOR_MIN_ARTICLE_COUNT: Joi.number().required(),
        ARTICLE_GENERATOR_MAX_ARTICLE_COUNT: Joi.number().required(),
        READABILITY_AXIOS_TIMEOUT: Joi.number().required(),
        PARSER_BROWSER_TIMEOUT: Joi.number().required(),
        CAPTCHA_GURU_API_KEY: Joi.string().allow(''),
        PUPPETEER_HEADLESS: Joi.string().required(),
        DB_SERVER: Joi.string().required(),
        SITE_ID: Joi.number().required(),
      }),
    }),
    /*     LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true,
          },
        },
      },
    }), */
    CommandModule,
    ReadabilityModule,
    LinksFilterModule,
    WordpressModule,
    ArticleGeneratorModule,
    CaptchaGuruModule,
    Parser2Module,
    SiteFillerModule,
    SiteModule,
    KeywordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { path } from 'app-root-path'
import { remove } from 'fs-extra'
import { Browser } from 'puppeteer'

import { KeywordsConfig } from '../../config/keywords.config'
import { ParserConfig } from '../../config/parser.config'
import { PuppeteerConfig } from '../../config/puppeteer.config'
import { millisToMinutesAndSeconds, promiseWithTimeout, sleep } from '../../utils'
import { KeywordsService } from '../keywords/keywords.service'
import { Keyword } from '../keywords/types'
import { YandexSearchPage } from '../parser2/pages/yandex-search.page'
import { Parser2Service } from '../parser2/parser2.service'
import { ParseResult } from '../parser2/types'
import { SiteService } from '../site/site.service'
import { FillService } from './fill.service'

@Injectable()
export class SiteFillerService {
  private browser: Browser
  private page: YandexSearchPage
  private parsingEnable: boolean = true
  private parserConfig: ParserConfig
  private puppeteerConfig: PuppeteerConfig
  private keywordsConfig: KeywordsConfig
  private keywords: Keyword[] = []
  private parseResult: ParseResult[] = []

  private readonly logger = new Logger(SiteFillerService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly parser2Service: Parser2Service,
    private readonly fillService: FillService,
    private readonly siteService: SiteService,
    private readonly keywordsService: KeywordsService
  ) {
    this.parserConfig = this.configService.get<ParserConfig>('parser')
    this.puppeteerConfig = this.configService.get<PuppeteerConfig>('puppeteer')
    this.keywordsConfig = this.configService.get<KeywordsConfig>('keywords')
  }

  public async runFilling() {
    const site = await this.siteService.getSite()
    await this.init()

    while (this.parsingEnable) {
      const iterationStart = new Date().getTime()

      try {
        this.keywords = await this.keywordsService.getKeywords(this.keywordsConfig.keywordsPerTread)
      } catch (e) {
        this.logger.error('Ошибка при получении ключевых фраз')
        this.parsingEnable = false
        continue
      }

      if (!this.keywords.length) {
        this.logger.error('Ключевые фразы закончились')
        await sleep(30000)
        this.parsingEnable = false
        continue
      }

      try {
        await promiseWithTimeout(this.parserConfig.browserTimeout * 2, this.parse())
      } catch (e) {
        await this.reInit()
      }

      const preparedData = await this.fillService.prepareData(this.parseResult)
      await this.fillService.fill(preparedData, site)

      const iterationEnd = new Date().getTime()
      this.logger.log(`Время выполнения: ${millisToMinutesAndSeconds(iterationEnd - iterationStart)}`)
      this.logger.log('')
    }
  }

  private async parse() {
    this.logger.log('Сбор ссылок начался')
    const parsingStart = new Date().getTime()

    const result: ParseResult[] = []
    for (const keyword of this.keywords) {
      const data = await this.parser2Service.parseKeyword(this.page, keyword)
      if (data !== null) {
        result.push(data)
        continue
      }
      await this.reInit()
    }

    this.parseResult = result

    const parsingEnd = new Date().getTime()
    const parsingEndTime = parsingEnd - parsingStart
    this.logger.log(`Сбор ссылок завершен: ${millisToMinutesAndSeconds(parsingEndTime)}`)
  }

  private async init() {
    this.logger.log('Старт')
    this.browser = await this.parser2Service.initBrowser(this.puppeteerConfig.headless)
    const page = await this.browser.newPage()
    this.page = new YandexSearchPage(page)
    await this.page.openHomePage()
  }

  private async reInit() {
    this.logger.warn('Перезапуск')
    await this.browser.close()
    await remove(`${path}/chromeProfiles`)
    await this.init()
    await sleep(5000)
  }
}

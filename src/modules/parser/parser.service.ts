import { Injectable } from '@nestjs/common'
import { chunk } from 'lodash'
import { ConfigService } from '@nestjs/config'

import { SearchParserResult } from '../../types/search-parser'
import { WordpressService } from '../wordpress/wordpress.service'
import { BrowserService } from '../browser/browser.service'
import { YandexSearchParserService } from '../yandex-search-parser/yandex-search-parser.service'
import { LinksFilterService } from '../links-filter/links-filter.service'
import { GenerateArticleDto } from '../article-generator/dto'
import { ArticleGeneratorService } from '../article-generator/article-generator.service'
import { ParseArticle, WordpressKeyword } from '../wordpress/wordpress.types'
import { millisToMinutesAndSeconds, promiseWithTimeout } from '../../utils'
import { SearchConfig } from '../../config/search-engine.config'
import { ParserConfig } from '../../config/parser.config'
import { MailSearchParserService } from '../mail-search-parser/mail-search-parser.service'
import { Logger } from '../logger/logger.service'

@Injectable()
export class ParserService {
  private parserConfig: ParserConfig
  private searchConfig: SearchConfig
  private articlesData: GenerateArticleDto[] = []
  private keywords: WordpressKeyword[] = []

  private iterationStart: number = 0
  private iterationEnd: number = 0

  constructor(
    private readonly wordpressService: WordpressService,
    private readonly browserService: BrowserService,
    private readonly yandexSearchParserService: YandexSearchParserService,
    private readonly mailSearchParserService: MailSearchParserService,
    private readonly linksFilterService: LinksFilterService,
    private readonly articleGeneratorService: ArticleGeneratorService,
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {
    this.searchConfig = this.configService.get<SearchConfig>('searchEngine')
    this.parserConfig = this.configService.get<ParserConfig>('parser')
    this.logger.setContext('ParserService')
  }

  public async run() {
    this.logger.log('Начали парсинг')

    let isParsing = true
    const browser = await this.browserService.initBrowser()

    while (isParsing) {
      try {
        this.keywords = await this.wordpressService.getKeywords()
      } catch (e) {
        this.logger.error('Ошибка при получении ключевых слов', e)
        isParsing = false
        continue
      }

      if (this.keywords.length === 0) {
        this.logger.error('Ключевые фразы закончились')
        isParsing = false
        continue
      }

      try {
        await promiseWithTimeout(
          this.parserConfig.browserTimeout * 2,
          this.parse(
            browser,
            this.keywords.map(({ keyword }) => keyword),
            async (data) => {
              await this.addArticlesData(data)
              await this.generateAndSaveArticles()
            }
          )
        )
      } catch (e) {
        this.logger.error('Парсинг ключевых фраз выполнялся слишком долго', e)
        await browser.reloadSession()
        continue
      }
    }

    await browser.deleteSession()
  }

  public async runMultiple() {
    this.logger.log('Парсинг запущен')
    let isParsing = true
    const browser = await this.browserService.initBrowser()

    while (isParsing) {
      this.iterationStart = new Date().getTime()
      try {
        this.keywords = await this.wordpressService.getKeywords()
      } catch (e) {
        this.logger.error('Ошибка при получении ключевых фраз')
        continue
      }

      if (!this.keywords.length) {
        this.logger.error('Ключевые фразы закончились')
        isParsing = false
        continue
      }

      try {
        this.logger.log('Начат сбор ссылок')
        const parsingStart = new Date().getTime()

        await promiseWithTimeout(
          this.parserConfig.browserTimeout * 2,
          this.parse(
            browser,
            this.keywords.map(({ keyword }) => keyword),
            async (data) => {
              await this.addArticlesData(data)
            }
          )
        )

        const parsingEnd = new Date().getTime()
        const parsingEndTime = parsingEnd - parsingStart
        this.logger.log(`Сбор ссылок завершен: ${millisToMinutesAndSeconds(parsingEndTime)}`)

        await this.generateAndSaveArticles()
      } catch (e) {
        this.logger.error('Парсинг ключевых фраз выполнялся слишком долго', e)
        await browser.reloadSession()
        continue
      }
    }

    await browser.deleteSession()
  }

  private async parse(
    browser: WebdriverIO.Browser,
    keywords: string[],
    afterParseKeywordCb?: (data: SearchParserResult) => Promise<void>
  ) {
    if (this.searchConfig.searchEngine === 'yandex') {
      await this.yandexSearchParserService.parse(browser, keywords, afterParseKeywordCb)
      return
    }

    if (this.searchConfig.searchEngine === 'mail') {
      await this.mailSearchParserService.parse(browser, keywords, afterParseKeywordCb)
    }
  }

  private async generateAndSaveArticles() {
    const generateStart = new Date().getTime()
    this.logger.log('Начата генерация статей')

    const generatedResult = await Promise.all(
      this.articlesData.map((articleData) => this.articleGeneratorService.generate(articleData))
    )

    const generateEnd = new Date().getTime()
    const generateEndTime = generateEnd - generateStart
    this.logger.log(`Генерация статей завершена: ${millisToMinutesAndSeconds(generateEndTime)}`)

    const articles: ParseArticle[] = generatedResult
      .filter((article) => article !== null)
      .map(({ keyword, article, excerpt }) => ({
        keyword: this.wordpressService.findKeywordByText(this.keywords, keyword),
        article: { content: article, shortContent: excerpt, tableContent: '', thumb: '' },
      }))

    this.logger.log(`Ожидание статей: ${generatedResult.length}`)
    this.logger.log(`На выходе статей: ${articles.length}`)

    if (articles.length) {
      const postingStart = new Date().getTime()
      this.logger.log('Постинг начат')
      await this.wordpressService.saveArticles(articles)
      const postingEnd = new Date().getTime()
      const postingEndTime = postingEnd - postingStart
      this.logger.log(`Постинг завершен ${millisToMinutesAndSeconds(postingEndTime)}`)
    }
    this.iterationEnd = new Date().getTime()
    this.logger.log(`Время выполнения: ${millisToMinutesAndSeconds(this.iterationEnd - this.iterationStart)}`)
    this.logger.log('')

    this.clearData()
  }

  private async addArticlesData(data: SearchParserResult) {
    if (!data?.keyword) {
      return
    }

    const { keyword, urls } = data
    const filteredUrls = await this.linksFilterService.filter({ urls })

    if (filteredUrls.length > 10) {
      const urlChunk = chunk(filteredUrls, 10)[0]
      if (urlChunk) {
        this.articlesData.push({ keyword, urls: urlChunk, addSource: true })
      }
    } else {
      this.articlesData.push({ keyword, urls: filteredUrls, addSource: true })
    }
  }

  private clearData() {
    this.articlesData = []
  }
}

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Page } from 'puppeteer'

import { ParserConfig } from '../../config/parser.config'
import { SearchConfig } from '../../config/search-engine.config'
import { sleep } from '../../utils'
import { Keyword } from '../keywords/types'
import { YandexSearchPage } from './pages/yandex-search.page'
import { ParseResult } from './types'
import { YandexCaptchaService } from './yandex-captcha.service'

@Injectable()
export class YandexSearchService {
  private readonly logger = new Logger(YandexSearchService.name)
  private yandexPage: YandexSearchPage
  private readonly config: SearchConfig
  private readonly parserConfig: ParserConfig

  constructor(
    private readonly yandexCaptchaService: YandexCaptchaService,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.get<SearchConfig>('searchEngine')
    this.parserConfig = this.configService.get<ParserConfig>('parser')
  }

  public async parse(page: Page, keywords: Keyword[]): Promise<ParseResult[]> {
    const results: ParseResult[] = []

    this.yandexPage = new YandexSearchPage(page)

    await this.yandexPage.openHomePage()

    for (const keyword of keywords) {
      await this.parseKeyword(this.yandexPage, keyword)
    }

    return results
  }

  public async parseKeyword(page: YandexSearchPage, keyword: Keyword): Promise<ParseResult | null> {
    const urls: string[] = []
    const timeout = 100

    const solved = await this.yandexCaptchaService.solve(page.getPage())
    if (!solved) {
      this.logger.error('Капча не пройдена')
      return null
    }

    await page.focusMainPageSearchInput()
    await sleep(timeout)

    await page.getPage().keyboard.type(keyword.keyword)
    await sleep(timeout)

    await page.submitSearch()
    await page.getPage().waitForNavigation()
    await sleep(timeout)

    await page.clearSearch()
    await sleep(timeout)

    const results = await page.getSiteUrls()
    results.forEach((url) => urls.push(url))

    return { keyword, urls }
  }

  public async forceCaptcha(page: YandexSearchPage) {
    const keywords = [
      'лечение депрессии',
      'лечение наркомании',
      'лечение депрессии',
      'лечение наркомании',
      'лечение депрессии',
      'лечение наркомании',
      'лечение депрессии',
      'лечение наркомании',
      'лечение депрессии',
      'лечение наркомании',
      'лечение депрессии',
      'лечение наркомании',
      'лечение депрессии',
      'лечение наркомании',
    ]
    for (const keyword of keywords) {
      try {
        for (let pageNum = this.config.startPage; pageNum <= this.config.lastPage; pageNum++) {
          const url = this.getUrl(keyword, pageNum)
          await page.getPage().goto(url)
          const solved = await this.yandexCaptchaService.solve(page.getPage())

          if (!solved) {
            this.logger.error('Капча не пройдена')
          }
        }
      } catch (e) {
        this.logger.error('Парсинг ссылок занял слишком много времени', e)
        throw new Error(e)
      }
    }
  }

  private getUrl(keyword: string, page: number): string {
    return `https://yandex.ru/search/?text=${keyword}&search_source=dzen_desktop_safe&p=${page - 1}`
  }
}

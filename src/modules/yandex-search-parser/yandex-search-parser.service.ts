import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { path } from 'app-root-path'
import { SearchParserResult } from 'search-parser'
import { v4 as uuidv4 } from 'uuid'
import { readFile, remove } from 'fs-extra'
import axios from 'axios'

import { promiseWithTimeout, sleep } from '../../utils'
import YandexSearchPage from './pages/yandex-search.page'
import { XEvilService } from '../xevil/xevil.service'
import { YANDEX_CHECKBOX_CAPTCHA, YANDEX_IMAGE_CAPTCHA, YANDEX_INITIAL_PAGE, YANDEX_SEARCH_RESULT } from './constants'
import { SearchConfig } from '../../config/search-engine.config'
import { CaptchaConfig } from '../../config/captcha.config'
import { Logger } from '../logger/logger.service'
import { ParserConfig } from '../../config/parser.config'

@Injectable()
export class YandexSearchParserService {
  private readonly config: SearchConfig
  private readonly captchaConfig: CaptchaConfig
  private readonly parserConfig: ParserConfig
  private page: YandexSearchPage

  constructor(
    private readonly configService: ConfigService,
    private readonly xEvilService: XEvilService,
    private readonly logger: Logger
  ) {
    this.config = this.configService.get<SearchConfig>('searchEngine')
    this.captchaConfig = this.configService.get<CaptchaConfig>('captchaConfig')
    this.parserConfig = this.configService.get<ParserConfig>('parser')
    this.logger.setContext('YandexSearchParserService')
  }

  public async parse(
    browser: WebdriverIO.Browser,
    keywords: string[],
    afterParseKeywordCb?: (data: SearchParserResult) => Promise<void>
  ) {
    this.page = new YandexSearchPage(browser, this.logger)
    await this.parseKeywords(keywords, afterParseKeywordCb)
  }

  private async parseKeywords(keywords: string[], afterParseKeywordCb?: (data: SearchParserResult) => Promise<void>) {
    for (const keyword of keywords) {
      try {
        let result: null | SearchParserResult = null
        result = await promiseWithTimeout(Math.ceil(this.parserConfig.browserTimeout / 4), this.parseKeyword(keyword))
        if (result !== null && afterParseKeywordCb) {
          await afterParseKeywordCb(result)
        }
      } catch (e) {
        this.logger.error('Парсинг ссылок занял слишком много времени', e)
        throw new Error(e)
        //await this.page.reloadSession()
        //this.logger.log('Перезагрузили браузер')
        //continue
      }
    }

    return true
  }

  private async parseKeyword(keyword: string): Promise<SearchParserResult | null> {
    const urls: string[] = []

    for (let i = this.config.startPage; i <= this.config.lastPage; i++) {
      await this.page.openUrl(this.getUrl(keyword, i))
      await this.recognizeCaptcha()

      const result = await this.page.getSearchResultUrls(keyword)
      if (result && result.urls.length > 0) {
        result.urls.forEach((url) => urls.push(url))
        //this.logger.log(`Ссылки получены: ${urls.length}`)
      } else {
        this.logger.error(`Ошибка при получении`)
      }

      if (this.config.lastPage > 1) {
        await this.page.toNextPage()
        await sleep(200)
      }
    }

    if (urls.length > 0) {
      return { keyword, urls }
    }

    return null
  }

  private getUrl(keyword: string, page: number): string {
    return `https://yandex.ru/search/?text=${keyword}&search_source=dzen_desktop_safe&p=${page - 1}`
  }

  private async recognizeCaptcha() {
    let pageType: string | boolean = YANDEX_INITIAL_PAGE

    while (pageType !== YANDEX_SEARCH_RESULT) {
      let hasSearchResults = await this.page.hasSearchResults()
      if (hasSearchResults) {
        pageType = YANDEX_SEARCH_RESULT
        break
      }

      pageType = await this.page.checkPage()

      if (pageType === YANDEX_SEARCH_RESULT) {
        break
      }

      if (pageType === YANDEX_CHECKBOX_CAPTCHA) {
        this.logger.log('Обнаружена чекбокс капча')
        await this.page.clickToCheckboxCaptcha()
        await sleep(3000)
        continue
      }

      if (pageType === YANDEX_IMAGE_CAPTCHA) {
        this.logger.log('Обнаружена капча изображение')
        const captchaFilePath = this.getCaptchaFilePath()
        const isSaved = await this.page.saveSmartCaptchaImage(captchaFilePath)

        if (isSaved) {
          const captchaService = this.captchaConfig.captchaService

          let textResult: string | false = ''
          if (captchaService === 'local') {
            textResult = await this.xEvilService.imageFromFileToText(captchaFilePath)
          } else {
            textResult = await this.solveRemote(captchaFilePath)
          }

          if (textResult && textResult.length) {
            await this.page.submitImageCaptcha(textResult)
            await remove(captchaFilePath)
          }
        }
        await sleep(3000)
        continue
      }

      if (pageType === false) {
        this.logger.error('Неизвестный тип страницы')
        await this.createSnapshot()
        await sleep(60000 * 10)
        continue
      }
    }
  }

  private getCaptchaFilePath() {
    const captchaFolderPath = `${path}/captcha`
    const captchaFilePath = `${captchaFolderPath}/${uuidv4()}.png`
    return captchaFilePath
  }

  private async solveRemote(captchaFilePath: string) {
    const captchaRemoteServiceUrl = this.captchaConfig.captchaRemoteServiceUrl
    if (captchaRemoteServiceUrl === '') {
      return false
    }

    const imageBase64 = (await readFile(captchaFilePath)).toString('base64')

    try {
      const { data } = await axios.post<string | false>(
        captchaRemoteServiceUrl,
        { imageBase64 },
        { headers: { 'ngrok-skip-browser-warning': '1' } }
      )
      return data
    } catch {
      this.logger.log('Ошибки при распознавании капчи удаленно')
      return false
    }
  }

  private async createSnapshot() {
    await this.page.saveScreenshot(
      `${path}/captcha/${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}.png`
    )
  }
}

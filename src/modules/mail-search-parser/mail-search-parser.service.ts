import { Injectable } from '@nestjs/common'
import { remove } from 'fs-extra'
import { v4 as uuidv4 } from 'uuid'
import { path } from 'app-root-path'
import { ConfigService } from '@nestjs/config'

import { promiseWithTimeout, sleep } from '../../utils'
import MailRuSearchPage from './pages/mail-search.page'
import { SearchParserResult } from '../../types/search-parser'
import { XEvilService } from '../xevil/xevil.service'
import { MAIL_CHECKBOX_CAPTCHA, MAIL_IMAGE_CAPTCHA, MAIL_INITIAL_PAGE, MAIL_SEARCH_RESULT } from './constants'
import { SearchConfig } from '../../config/search-engine.config'
import { CaptchaConfig } from '../../config/captcha.config'
import { ParserConfig } from '../../config/parser.config'
import { Logger } from '../logger/logger.service'

@Injectable()
export class MailSearchParserService {
  private readonly config: SearchConfig
  private readonly captchaConfig: CaptchaConfig
  private readonly parserConfig: ParserConfig
  private page: MailRuSearchPage

  constructor(
    private readonly configService: ConfigService,
    private readonly xevilService: XEvilService,
    private readonly logger: Logger
  ) {
    this.config = this.configService.get<SearchConfig>('searchEngine')
    this.captchaConfig = this.configService.get<CaptchaConfig>('captchaConfig')
    this.parserConfig = this.configService.get<ParserConfig>('parser')
  }

  public async parse(
    browser: WebdriverIO.Browser,
    keywords: string[],
    afterParseKeywordCb?: (data: SearchParserResult) => Promise<void>
  ) {
    this.page = new MailRuSearchPage(browser)
    await this.parseKeywords(keywords, afterParseKeywordCb)
  }

  private async parseKeywords(keywords: string[], afterParseKeywordCb?: (data: SearchParserResult) => void) {
    for (const keyword of keywords) {
      try {
        let result: null | SearchParserResult = null
        result = await promiseWithTimeout(Math.ceil(this.parserConfig.browserTimeout / 4), this.parseKeyword(keyword))
        if (result !== null && afterParseKeywordCb) {
          afterParseKeywordCb(result)
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
    const url = `https://go.mail.ru/search?q=${keyword}`

    await this.page.openUrl(url)
    await sleep(500)
    await this.page.switchToYandexFrame()

    let pageType: string | boolean = MAIL_INITIAL_PAGE

    while (pageType !== MAIL_SEARCH_RESULT) {
      let hasSearchResults = await this.page.hasSearchResults()
      if (hasSearchResults) {
        pageType = MAIL_SEARCH_RESULT
        break
      }

      pageType = await this.page.checkPage()

      if (pageType === MAIL_SEARCH_RESULT) {
        break
      }

      if (pageType === MAIL_CHECKBOX_CAPTCHA) {
        this.logger.log('Обнаружена чекбокс капча')
        await this.page.clickToCheckboxCaptcha()
        await sleep(3000)
        continue
      }

      if (pageType === MAIL_IMAGE_CAPTCHA) {
        this.logger.log('Обнаружена капча изображение')
        const captchaFilePath = this.getCaptchaFilePath()
        const isSaved = await this.page.saveSmartCaptchaImage(captchaFilePath)

        if (isSaved) {
          let textResult: string | false = ''
          textResult = await this.xevilService.imageFromFileToText(captchaFilePath)

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
        await sleep(60000 * 1)
        continue
      }
    }

    const urls: string[] = []

    const result = await this.page.getSearchResultUrls(keyword)
    if (!result) {
      this.logger.error(`ССЫЛОК НЕТ`)
      return null
    }

    result.urls.forEach((url) => urls.push(url))

    if (urls.length) {
      //this.logger.log(`Ссылки получены: ${urls.length}`)
    } else {
      this.logger.error(`Ошибка при получении`)
    }

    return { keyword, urls }
  }

  private getCaptchaFilePath() {
    const captchaFolderPath = `${path}/captcha`
    const captchaFilePath = `${captchaFolderPath}/${uuidv4()}.png`
    return captchaFilePath
  }

  private async createSnapshot() {
    await this.page.saveScreenshot(
      `${path}/captcha/${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}.png`
    )
  }
}

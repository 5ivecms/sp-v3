import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { path } from 'app-root-path'
import { ensureDir, remove } from 'fs-extra'
import puppeteer, { Browser } from 'puppeteer'

import { ThreadConfig } from '../../config/thread.config'
import { Keyword } from '../keywords/types'
import { ParseDto } from './dto'
import { YandexSearchPage } from './pages/yandex-search.page'
import { ParseResult } from './types'
import { YandexSearchService } from './yandex-search.service'

@Injectable()
export class Parser2Service {
  constructor(
    private readonly yandexSearchService: YandexSearchService,
    private readonly configService: ConfigService
  ) {}

  public async parse(dto: ParseDto): Promise<ParseResult[]> {
    const { keywords } = dto

    const browser = await this.initBrowser(false)
    const result = await this.yandexParser(browser, keywords)
    await browser.close()

    return result
  }

  public async initBrowser(headless: boolean | 'new'): Promise<Browser> {
    const { threadId } = this.configService.get<ThreadConfig>('threadConfig')
    console.log(threadId)
    await remove(`${path}/chromeProfiles/chromeProfile${threadId}`)
    await this.createFolders()
    return await puppeteer.launch({ headless: headless, userDataDir: this.getProfileFolder() })
  }

  public async yandexParser(browser: Browser, keywords: Keyword[]): Promise<ParseResult[]> {
    try {
      return await this.yandexSearchService.parse(await browser.newPage(), keywords)
    } catch (e) {
      throw new Error(e)
    }
  }

  public async parseKeyword(page: YandexSearchPage, keyword: Keyword) {
    return this.yandexSearchService.parseKeyword(page, keyword)
  }

  public async forceCaptcha(page: YandexSearchPage) {
    return this.yandexSearchService.forceCaptcha(page)
  }

  private getProfileFolder(): string {
    const { threadId } = this.configService.get<ThreadConfig>('threadConfig')
    return `${path}/chromeProfiles/chromeProfile${threadId}`
  }

  private async createFolders() {
    await ensureDir(this.getProfileFolder())
    await ensureDir(`${path}/captcha`)
  }
}

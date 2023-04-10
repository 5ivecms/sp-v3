import { Injectable } from '@nestjs/common'
import { ensureDir } from 'fs-extra'
import { path } from 'app-root-path'
import { remote } from 'webdriverio'
import { ConfigService } from '@nestjs/config'

import { BrowserConfig } from '../../config/browser.config'
import { Logger } from '../logger/logger.service'

type BrowserName = 'chrome' | 'hola'

@Injectable()
export class BrowserService {
  private readonly config: BrowserConfig
  private readonly browserName: BrowserName

  constructor(private readonly configService: ConfigService, private readonly logger: Logger) {
    this.config = this.configService.get<BrowserConfig>('browser')
    this.browserName = this.config.hola ? 'hola' : 'chrome'
    this.logger.setContext('BrowserService')
  }

  public async initBrowser() {
    await this.createFolders()

    let browser: null | WebdriverIO.Browser = null

    try {
      browser = await remote({
        reporters: ['dot'],
        logLevel: 'silent',
        capabilities: {
          browserName: 'chrome',
          maxInstances: 1,
          acceptInsecureCerts: true,
          'goog:chromeOptions': {
            args: this.getArgs(),
            binary: this.config.hola ? this.config.holaPath : undefined,
          },
        },
      })
    } catch (e) {
      this.logger.error('Ошибка при инициализации браузера', e)
    }

    this.logger.log('Браузер запущен')

    return browser
  }

  private getArgs(): string[] {
    const args: string[] = [
      '--disable-extensions',
      '--disable-application-cache',
      '--log-level=3',
      '--disable-logging',
      '--no-sandbox',
      `--user-data-dir=${this.getProfileFolder()}`,
      `--window-position=${this.config.windowPosition}`,
    ]

    if (this.config.headless) {
      args.push('--disable-gpu')
      args.push('--headless')
    }

    return args
  }

  private getProfileFolder(): string {
    return `${path}/${this.browserName}Profiles/${this.browserName}Profile`
  }

  private async createFolders() {
    await ensureDir(this.getProfileFolder())
    await ensureDir(`${path}/captcha`)
  }
}

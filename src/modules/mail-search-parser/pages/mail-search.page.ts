import { ChainablePromiseElement } from 'webdriverio'

import { SearchParserResult } from '../../../types/search-parser'
import { MAIL_CHECKBOX_CAPTCHA, MAIL_IMAGE_CAPTCHA, MAIL_SEARCH_RESULT } from '../constants'
import BasePage from './base.page'

const TIMEOUT = 1000

export default class MailRuSearchPage extends BasePage {
  get jsPlaceholder(): ChainablePromiseElement<WebdriverIO.Element> {
    return this.browser.$('#js-preloader')
  }

  public async switchToYandexFrame() {
    await this.browser.$('body #grid .yandex-frame').waitForExist({ timeout: TIMEOUT })
    const yandexFrame = await this.browser.$('body #grid .yandex-frame')
    await this.browser.switchToFrame(yandexFrame)
  }

  public async checkPage() {
    const [hasSearchResult, hasCheckboxCaptcha, hasSmartCaptcha] = await Promise.allSettled([
      this.hasSearchResults(),
      this.hasCheckboxCaptcha(),
      this.hasSmartCaptcha(),
    ])

    if (hasSearchResult.status === 'fulfilled' && hasSearchResult.value === MAIL_SEARCH_RESULT) {
      return MAIL_SEARCH_RESULT
    }

    if (hasCheckboxCaptcha.status === 'fulfilled' && hasCheckboxCaptcha.value === MAIL_CHECKBOX_CAPTCHA) {
      return MAIL_CHECKBOX_CAPTCHA
    }

    if (hasSmartCaptcha.status === 'fulfilled' && hasSmartCaptcha.value === MAIL_IMAGE_CAPTCHA) {
      return MAIL_IMAGE_CAPTCHA
    }

    return false
  }

  public async hasSearchResults() {
    try {
      const isExist = await this.browser.$('.content__left .serp-list').waitForExist({ timeout: TIMEOUT })

      if (isExist === true) {
        return MAIL_SEARCH_RESULT
      }

      return false
    } catch (e) {
      console.log('Ошибка при ожидании результатов поиска')
      //console.error(e)
      return false
    }
  }

  public async hasCheckboxCaptcha() {
    try {
      const hasCaptcha = await this.browser.$('.CheckboxCaptcha').waitForExist({
        timeout: TIMEOUT,
      })

      if (hasCaptcha === true) {
        return MAIL_CHECKBOX_CAPTCHA
      }

      return false
    } catch (e) {
      //console.log('Ошибка при ожидании чекбокс капчи')
      //console.error(e)
      return false
    }
  }

  public async clickToCheckboxCaptcha() {
    try {
      await this.browser.$('.CheckboxCaptcha-Button').waitForExist({ timeout: TIMEOUT })
      await this.browser.$('.CheckboxCaptcha').waitForExist({
        timeout: TIMEOUT,
      })
      await this.browser.$('.CheckboxCaptcha-Button').click()
    } catch (e) {
      console.log('Ошибка при клике на чекбокс капчу')
      //console.error(e)
    }
    return
  }

  public async hasSmartCaptcha() {
    try {
      await this.switchToYandexFrame()
    } catch {
      console.log('Ошибка при смене контекста')
      //return false
    }

    let hasCaptchaViewImg: boolean | void = false
    let hasCaptchaImage: boolean | void = false

    try {
      hasCaptchaViewImg = await this.browser.$('.AdvancedCaptcha-View img').waitForExist({
        timeout: TIMEOUT,
      })
    } catch (e) {
      console.error(`Нет hasCaptchaViewImg`)
    }

    try {
      hasCaptchaImage = await this.browser.$('.AdvancedCaptcha-Image').waitForExist({
        timeout: TIMEOUT,
      })
    } catch (e) {
      console.error(`Нет hasCaptchaImage`)
    }

    console.log(`Смарт капча ${hasCaptchaViewImg || hasCaptchaImage}`)

    if (hasCaptchaViewImg === true || hasCaptchaImage === true) {
      return MAIL_IMAGE_CAPTCHA
    }

    console.log('Смарт капчи нет или возникла ошибка')
    return false
  }

  public async saveSmartCaptchaImage(path: string) {
    try {
      await this.browser.$('.AdvancedCaptcha-View img').waitForExist({ timeout: TIMEOUT })
      await this.browser.$('.AdvancedCaptcha-View img').saveScreenshot(path)
      return true
    } catch {
      console.error('Ошибка при сохранении hasCaptchaViewImg')
    }

    try {
      await this.browser.$('.AdvancedCaptcha-Image').waitForExist({ timeout: TIMEOUT })
      await this.browser.$('.AdvancedCaptcha-Image').saveScreenshot(path)
      return true
    } catch {
      console.error('Ошибка при сохранении hasCaptchaImage')
    }

    return false
  }

  public async submitImageCaptcha(value: string) {
    await this.browser.$('.Textinput-Control[name="rep"]').waitForExist({ timeout: TIMEOUT })
    await this.browser.$('.CaptchaButton[type="submit"]').waitForExist({ timeout: TIMEOUT })
    await this.browser.$('.Textinput-Control[name="rep"]').setValue(value)
    await this.browser.$('.CaptchaButton[type="submit"]').click()
  }

  public async getSearchResultUrls(keyword: string): Promise<SearchParserResult | null> {
    try {
      await this.browser.$('.content__left .serp-list').waitForExist({ timeout: TIMEOUT })

      const serpItems = await this.browser.$$(
        '.content__left .serp-list .serp-item:not([data-fast-name="video-unisearch"]) .OrganicTitle .OrganicTitle-Link'
      )

      let urls: string[] = []
      for (const serpItem of serpItems) {
        const url = await serpItem.getAttribute('href')
        urls.push(url)
      }
      urls = urls.filter((url) => url.indexOf('yabs.yandex') === -1)

      return { keyword, urls }
    } catch (e) {
      //console.log(e)
      return null
    }
  }

  public async open(): Promise<void> {
    await super.open('https://go.mail.ru/')
  }

  public async close(): Promise<void> {
    await super.closeWindow()
  }

  public async deleteSession() {
    await super.deleteSession()
  }

  public async reloadSession() {
    await super.reloadSession()
  }

  public async openUrl(url: string): Promise<void> {
    await super.open(url)
  }

  public async minimizeWindow() {
    await super.minimizeWindow()
  }

  public async waitLoad() {
    await super.waitLoad()
  }

  public async saveScreenshot(filepath: string) {
    await super.saveScreenshot(filepath)
  }
}

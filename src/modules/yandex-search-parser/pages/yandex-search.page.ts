import { SearchParserResult } from '../../../types/search-parser'
import { YANDEX_CHECKBOX_CAPTCHA, YANDEX_IMAGE_CAPTCHA, YANDEX_SEARCH_RESULT } from '../constants'
import BasePage from './base.page'

const TIMEOUT = 1000

export default class YandexSearchPage extends BasePage {
  public async hasCheckboxCaptcha() {
    try {
      const hasCaptcha = await this.browser.$('.CheckboxCaptcha').waitForExist({
        timeout: TIMEOUT,
      })

      if (hasCaptcha === true) {
        return YANDEX_CHECKBOX_CAPTCHA
      }

      return false
    } catch (e) {
      return false
    }
  }

  public async hasSmartCaptcha() {
    try {
      const hasCaptchaViewImg = await this.browser.$('.AdvancedCaptcha-View img').waitForExist({
        timeout: TIMEOUT,
      })
      const hasCaptchaImage = await this.browser.$('.AdvancedCaptcha-Image').waitForExist({
        timeout: TIMEOUT,
      })

      if (hasCaptchaViewImg === true || hasCaptchaImage === true) {
        return YANDEX_IMAGE_CAPTCHA
      }

      return false
    } catch (e) {
      return false
    }
  }

  public async saveSmartCaptchaImage(path: string) {
    try {
      await this.browser.$('.AdvancedCaptcha-Image').waitForExist({ timeout: TIMEOUT })
      await this.browser.$('.AdvancedCaptcha-Image').saveScreenshot(path)
      return true
    } catch {
      return false
    }
  }

  public async submitImageCaptcha(value: string) {
    await this.browser.$('.Textinput-Control[name="rep"]').waitForExist({ timeout: TIMEOUT })
    await this.browser.$('.CaptchaButton[type="submit"]').waitForExist({ timeout: TIMEOUT })
    await this.browser.$('.Textinput-Control[name="rep"]').setValue(value)
    await this.browser.$('.CaptchaButton[type="submit"]').click()
  }

  public async checkPage() {
    const [hasSearchResult, hasCheckboxCaptcha, hasSmartCaptcha] = await Promise.allSettled([
      this.hasSearchResults(),
      this.hasCheckboxCaptcha(),
      this.hasSmartCaptcha(),
    ])

    if (hasSearchResult.status === 'fulfilled' && hasSearchResult.value === YANDEX_SEARCH_RESULT) {
      return YANDEX_SEARCH_RESULT
    }

    if (hasCheckboxCaptcha.status === 'fulfilled' && hasCheckboxCaptcha.value === YANDEX_CHECKBOX_CAPTCHA) {
      return YANDEX_CHECKBOX_CAPTCHA
    }

    if (hasSmartCaptcha.status === 'fulfilled' && hasSmartCaptcha.value === YANDEX_IMAGE_CAPTCHA) {
      return YANDEX_IMAGE_CAPTCHA
    }

    return false
  }

  public async clickToCheckboxCaptcha() {
    try {
      await this.browser.$('.CheckboxCaptcha').waitForExist({
        timeout: TIMEOUT,
      })
      await this.browser.$('.CheckboxCaptcha-Button').click()
    } catch (e) {
      this.logger.error('Ошибка при клике по чекбокс капчи', e)
    }
  }

  public async hasSearchResults() {
    try {
      const isExist = await this.browser.$('.content__left .serp-list').waitForExist({ timeout: TIMEOUT })

      if (isExist === true) {
        return YANDEX_SEARCH_RESULT
      }

      return false
    } catch (e) {
      return false
    }
  }

  public async getSearchResultUrls(keyword: string): Promise<SearchParserResult | null> {
    try {
      await this.browser.$('.content__left .serp-list').waitForExist({ timeout: TIMEOUT, interval: 500 })

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
      return null
    }
  }

  public async toNextPage(): Promise<boolean> {
    return false
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

/* eslint-disable no-console */
import { Page } from 'puppeteer'

import { Coords } from '../../../modules/captcha-guru/types'
import { sleep } from '../../../utils'

const TIMEOUT = 1000

export class YandexCaptchaPage {
  private readonly page: Page
  constructor(page: Page) {
    this.page = page
  }

  public async isSearch() {
    try {
      const searchResults = await this.page.waitForSelector('.main.serp', { timeout: TIMEOUT })

      if (searchResults !== null) {
        return true
      }

      return false
    } catch (e) {
      return false
    }
  }

  public async isRobotCaptcha() {
    try {
      const captcha = await this.page.waitForSelector('.CheckboxCaptcha', { timeout: TIMEOUT })

      if (captcha !== null) {
        return true
      }

      return false
    } catch (e) {
      return false
    }
  }

  public async clickToCRobotCaptcha() {
    try {
      await this.page.waitForSelector('.CheckboxCaptcha', { timeout: TIMEOUT })
      await this.page.click('.CheckboxCaptcha-Button')
    } catch (e) {
      console.error('Ошибка при клике по чекбокс капчи')
    }
  }

  public async isClickCaptcha() {
    try {
      await Promise.all([
        this.page.waitForSelector('.AdvancedCaptcha-View .AdvancedCaptcha-ImageWrapper img', {
          timeout: TIMEOUT,
        }),
        this.page.waitForSelector('.AdvancedCaptcha-SilhouetteTask img', {
          timeout: TIMEOUT,
        }),
      ])
      return true
    } catch (e) {
      return false
    }
  }

  public async clickOnCoordinates(coordinates: Coords[]) {
    await this.page.waitForSelector('.AdvancedCaptcha_silhouette', { timeout: TIMEOUT })
    console.log(1)
    for (const coordinate of coordinates) {
      console.log(coordinate)
      await sleep(5000)
      await this.page.click('.AdvancedCaptcha-View .AdvancedCaptcha-ImageWrapper img', {
        offset: coordinate,
      })
    }
    console.log(2)
    const element = await this.page.waitForSelector('.CaptchaButton[type="submit"]', { timeout: TIMEOUT })
    console.log(3)
    await sleep(5000)
    await element.click()
    console.log(4)
  }

  public async saveClickCaptchaScreenshot() {
    return await this.saveScreenshot('.AdvancedCaptcha_silhouette')
  }

  public async isImageCaptcha() {
    let hasCaptchaViewImg = null
    let hasCaptchaImage = null

    try {
      hasCaptchaViewImg = await this.page.waitForSelector('.AdvancedCaptcha-View img', {
        timeout: TIMEOUT,
      })
    } catch (e) {}

    try {
      hasCaptchaImage = await this.page.waitForSelector('.AAdvancedCaptcha_image', {
        timeout: TIMEOUT,
      })
    } catch (e) {}

    if (hasCaptchaViewImg === null || hasCaptchaImage === null) {
      return true
    }

    return false
  }

  public async inputCaptchaText(text: string) {
    await this.page.waitForSelector('.Textinput_view_captcha .Textinput-Control', { timeout: TIMEOUT })
    await this.page.$eval('.Textinput_view_captcha .Textinput-Control', (el: any, value) => (el.value = value), text)
  }

  public async submitImageCaptcha() {
    const element = await this.page.waitForSelector('.CaptchaButton[type="submit"]', { timeout: TIMEOUT })
    await element.click()
  }

  public async saveImageCaptchaScreenshot() {
    return await this.saveScreenshot('.AdvancedCaptcha_image .AdvancedCaptcha-View img')
  }

  public async saveScreenshot(selector: string): Promise<string> {
    const element = await this.page.waitForSelector(selector, { timeout: TIMEOUT })
    const box = await element.boundingBox()

    const captcha = await this.page.screenshot({ type: 'png', clip: box, encoding: 'base64' })

    return captcha
  }
}

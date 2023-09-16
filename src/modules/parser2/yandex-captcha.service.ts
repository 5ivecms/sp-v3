import { Injectable, Logger } from '@nestjs/common'
import { Page } from 'puppeteer'

import { sleep } from '../../utils'
import { CaptchaGuruService } from '../captcha-guru/captcha-guru.service'
import { YandexCaptcha } from './constants'
import { YandexCaptchaPage } from './pages/yandex-captcha.page'

@Injectable()
export class YandexCaptchaService {
  private readonly logger = new Logger(YandexCaptchaService.name)
  constructor(private readonly captchaGuruService: CaptchaGuruService) {}

  public async solve(page: Page) {
    let captchaType = 'unknown'

    while (captchaType !== 'none') {
      captchaType = await this.check(page)

      if (captchaType === 'none') {
        return true
      }

      const captchaPage = new YandexCaptchaPage(page)
      if (captchaType === 'robot') {
        await captchaPage.clickToCRobotCaptcha()
        await page.waitForNavigation()
        continue
      }

      if (captchaType === 'click') {
        const captchaBase64 = await captchaPage.saveClickCaptchaScreenshot()
        const coordinates = await this.captchaGuruService.yandexClickCaptchaBase64(captchaBase64)
        if (coordinates === null || !Array.isArray(coordinates)) {
          this.logger.error('Ошибка при получении координат для клик капчи')
          return false
        }

        try {
          await captchaPage.clickOnCoordinates(coordinates)
          await page.waitForNavigation()
        } catch (e) {
          this.logger.error('При клике на координаты произошла ошибка')
          this.logger.error(e)
          return false
        }

        continue
      }

      if (captchaType === 'image') {
        const captchaBase64 = await captchaPage.saveImageCaptchaScreenshot()
        const text = await this.captchaGuruService.yandexTextCaptchaBase64(captchaBase64)
        await captchaPage.inputCaptchaText(text)
        await sleep(200)
        await captchaPage.submitImageCaptcha()

        await page.waitForNavigation()
        continue
      }

      if (captchaType === 'unknown') {
        return false
      }
    }
  }

  public async check(page: Page): Promise<YandexCaptcha> {
    const captchaPage = new YandexCaptchaPage(page)

    const [isSearchResponse, isRobotCaptchaResponse, isClickCaptchaResponse, isImageCaptchaResponse] =
      await Promise.allSettled([
        captchaPage.isSearch(),
        captchaPage.isRobotCaptcha(),
        captchaPage.isClickCaptcha(),
        captchaPage.isImageCaptcha(),
      ])

    if (isSearchResponse.status === 'fulfilled' && isSearchResponse.value === true) {
      return 'none'
    }

    if (isRobotCaptchaResponse.status === 'fulfilled' && isRobotCaptchaResponse.value === true) {
      return 'robot'
    }

    if (isClickCaptchaResponse.status === 'fulfilled' && isClickCaptchaResponse.value === true) {
      return 'click'
    }

    if (isImageCaptchaResponse.status === 'fulfilled' && isImageCaptchaResponse.value === true) {
      return 'image'
    }

    return 'none'
  }
}

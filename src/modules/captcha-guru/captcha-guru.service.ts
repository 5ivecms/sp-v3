import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { readFile } from 'fs-extra'

import { CaptchaGuruConfig } from '../../config/captcha-guru.config'
import { sleep } from '../../utils'
import { Logger } from '../logger/logger.service'
import { BASE_URL } from './constants'
import { Coords, InResponse } from './types'

@Injectable()
export class CaptchaGuruService {
  constructor(private readonly configService: ConfigService, private readonly logger: Logger) {
    this.logger.setContext('CaptchaGuruService')
  }

  public async yandexSmartCaptcha(filePath: string): Promise<Coords[]> {
    const file = (await readFile(filePath)).toString('base64')
    const { apiKey } = this.configService.get<CaptchaGuruConfig>('captchaGuru')

    const { requestId, status } = await this.in({
      key: apiKey,
      type: 'base64',
      body: file,
      textinstructions: 'yandex',
      click: 'oth',
    })

    if (status !== 'OK') {
      return null
    }

    const response = await this.res(requestId)

    const coordinates = this.parseCoordinates(response)

    return coordinates
  }

  // { status: 0, request: 'ERROR_CAPTCHA_UNSOLVABLE' }

  public async yandexClickCaptchaBase64(imageBase64: string): Promise<Coords[]> {
    const { apiKey } = this.configService.get<CaptchaGuruConfig>('captchaGuru')

    const { requestId, status } = await this.in({
      key: apiKey,
      type: 'base64',
      body: imageBase64,
      textinstructions: 'yandex',
      click: 'oth',
    })

    if (status !== 'OK') {
      return null
    }

    await sleep(2000)

    const response = await this.res(requestId)
    if (response === null) {
      return null
    }

    const coordinates = this.parseCoordinates(response)

    return coordinates
  }

  public async yandexTextCaptcha(filePath: string): Promise<string | null> {
    const body = (await readFile(filePath)).toString('base64')
    const { apiKey } = this.configService.get<CaptchaGuruConfig>('captchaGuru')

    const { requestId, status } = await this.in({
      key: apiKey,
      body,
      method: 'base64',
      vernet: 18,
    })

    if (status !== 'OK') {
      return null
    }

    const response = await this.res(requestId)

    return response
  }

  public async yandexTextCaptchaBase64(imageBase64: string): Promise<string | null> {
    const { apiKey } = this.configService.get<CaptchaGuruConfig>('captchaGuru')

    const { requestId, status } = await this.in({
      key: apiKey,
      body: imageBase64,
      method: 'base64',
      vernet: 18,
    })

    if (status !== 'OK') {
      return null
    }

    const response = await this.res(requestId)

    return response
  }

  private async in(options: object): Promise<InResponse> {
    try {
      this.logger.log('Отправляем запрос')
      const { data } = await axios.post(`${BASE_URL}/in.php`, options)
      const [status, requestId] = data.split('|')
      this.logger.log(`Ответ получен. Статус: ${status}`)

      return { status, requestId }
    } catch (e) {
      this.logger.error(e)
      return null
    }
  }

  private async res(requestId: string) {
    try {
      const { apiKey } = this.configService.get<CaptchaGuruConfig>('captchaGuru')

      const tryCount = 10

      for (const i of Array.from(Array(tryCount).keys())) {
        await sleep(1500)

        const response = await axios.get(`${BASE_URL}/res.php`, {
          params: { key: apiKey, id: requestId, json: 1 },
        })

        this.logger.log(`Response status: ${response.data.status}`)

        if (response.data.status === 1) {
          this.logger.log(`Результат получен`)
          return response.data.request
        } else {
          this.logger.error(`ERROR_CAPTCHA_UNSOLVABLE`)
          return null
        }
      }

      return null
    } catch (e) {
      this.logger.error(e)
      return null
    }
  }

  private parseCoordinates(data: string) {
    const [_, coordinatesStr] = data.split(':')
    const coordinatesPairs = coordinatesStr.split(';')
    const coordinates = coordinatesPairs.reduce((acc, item) => {
      const [xStr, yStr] = item.split(',')
      const [_x, x] = xStr.split('=')
      const [_y, y] = yStr.split('=')
      return [...acc, { x: Number(x), y: Number(y) }]
    }, [])

    return coordinates
  }
}

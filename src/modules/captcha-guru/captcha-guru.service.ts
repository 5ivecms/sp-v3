import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { readFile } from 'fs-extra'
import axios from 'axios'

import { CaptchaGuruConfig } from '../../config/captcha-guru.config'
import { sleep } from '../../utils'
import { BASE_URL } from './constants'
import { InResponse } from './types'
import { Logger } from '../logger/logger.service'

@Injectable()
export class CaptchaGuruService {
  constructor(private readonly configService: ConfigService, private readonly logger: Logger) {
    this.logger.setContext('CaptchaGuruService')
  }

  public async yandexSmartCaptcha(filePath: string) {
    const file = (await readFile(filePath)).toString('base64')

    const { requestId, status } = await this.in(file)
    if (status !== 'OK') {
      return null
    }

    const response = await this.res(requestId)

    return response
  }

  private async in(body: string): Promise<InResponse> {
    try {
      const { apiKey } = this.configService.get<CaptchaGuruConfig>('captchaGuru')

      this.logger.log('Отправляем запрос')
      const { data } = await axios.post(`${BASE_URL}/in.php`, {
        key: apiKey,
        type: 'base64',
        body,
        textinstructions: 'yandex',
        click: 'oth',
      })
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

      let coordinates: object[] | null = null

      for (const i of Array.from(Array(tryCount).keys())) {
        await sleep(1000)

        const coordinatesResponse = await axios.get(`${BASE_URL}/res.php`, {
          params: { key: apiKey, id: requestId },
        })

        const [coordinatesStatus, data] = coordinatesResponse.data.split('|')

        this.logger.log(`Response status: ${coordinatesStatus}`)

        if (coordinatesStatus === 'OK') {
          coordinates = this.parseCoordinates(data)
          this.logger.log(`Координаты получены`)
          break
        }
      }

      return coordinates
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

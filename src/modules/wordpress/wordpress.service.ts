/* eslint-disable no-console */
import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'

import { capitalizeFirstLetter } from '../../utils'
import { GenerateResult } from '../article-generator/types'
import { Site } from '../site/types'

@Injectable()
export class WordpressService {
  private readonly logger = new Logger(WordpressService.name)
  public async saveArticle(data: GenerateResult, site: Site): Promise<boolean> {
    try {
      const auth = Buffer.from(`${site.login}:${site.password}`).toString('base64')
      await axios.post(
        `${site.domain}/wp-json/wp/v2/posts/`,
        {
          title: capitalizeFirstLetter(data.keyword.keyword),
          content: data.content,
          categories: `${data.keyword.categoryId}`,
          status: 'publish',
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 600000 * 2,
        }
      )
      return true
    } catch (e) {
      if (e.code === 'ECONNABORTED') {
        this.logger.error('AXIOS TIMEOUT ПРИ ПОСТИНГЕ')
      }
      return false
    }
  }
}

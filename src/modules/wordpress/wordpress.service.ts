/* eslint-disable no-console */
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

import { SaveArticleDto } from './dto'
import { WordpressApiUrls } from './wordpress.constants'
import { WordpressKeyword } from './wordpress.types'
import { WordpressConfig } from '../../config/wordpress.config'

@Injectable()
export class WordpressService {
  private readonly config: WordpressConfig

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<WordpressConfig>('wordpress')
  }

  public async getKeywords(): Promise<WordpressKeyword[]> {
    try {
      const { data } = await axios.get<WordpressKeyword[]>(`${this.config.domain}${WordpressApiUrls.GET_KEYWORDS}`, {
        timeout: 60000 * 2,
        params: { limit: this.config.keywordsPerTread },
      })
      return data
    } catch (e) {
      throw new Error(e)
    }
  }

  public async saveArticles(dto: SaveArticleDto[]): Promise<boolean> {
    try {
      await axios.post(`${this.config.domain}${WordpressApiUrls.SAVE_ARTICLE}`, dto, {
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 600000 * 2,
      })
      return true
    } catch (e) {
      if (e.code === 'ECONNABORTED') {
        console.log('AXIOS TIMEOUT ПРИ ПОСТИНГЕ')
      } else {
        console.log(e)
      }
      return false
    }
  }

  public findKeywordByText(keywords: WordpressKeyword[], text: string): WordpressKeyword | null {
    return keywords.find((keyword) => keyword.keyword === text)
  }
}

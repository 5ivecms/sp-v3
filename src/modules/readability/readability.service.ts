import { Injectable } from '@nestjs/common'
import { Readability } from '@mozilla/readability'
import { JSDOM, VirtualConsole } from 'jsdom'
import axios from 'axios'
import { ConfigService } from '@nestjs/config'

import { ReadabilityArticle } from './readability.types'
import { GetReadabilityArticleByUrlDto, GetReadabilityArticleByUrlsDto } from './dto'
import { promiseWithTimeout } from '../../utils'
import { ReadabilityConfig } from '../../config/readability.config'

type ContentData = {
  url: string
  data: string
}

@Injectable()
export class ReadabilityService {
  private config: ReadabilityConfig

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<ReadabilityConfig>('readability')
  }

  public async getReadabilityArticleByUrl(dto: GetReadabilityArticleByUrlDto): Promise<ReadabilityArticle> {
    const { url } = dto
    return await this.readability(url)
  }

  public async getReadabilityArticleByUrls(dto: GetReadabilityArticleByUrlsDto): Promise<ReadabilityArticle[]> {
    const { urls } = dto

    try {
      const readabilityArticles: ReadabilityArticle[] = []

      const result = await Promise.allSettled(
        urls.map(async (url) => await promiseWithTimeout(this.config.axiosTimeout, this.getContent(url)))
      )

      const fulfilledData = result
        .filter((data) => data.status === 'fulfilled')
        .filter((data: any) => data.value !== null)
        .filter((data: any) => data.value !== undefined)
        .map((data: any) => data.value as ContentData)

      const virtualConsole = new VirtualConsole()
      fulfilledData.forEach(({ data, url }) => {
        const doc = new JSDOM(data, { url, virtualConsole })
        const article = new Readability(doc.window.document, { debug: false }).parse() as ReadabilityArticle | null
        if (article !== undefined && article !== null) {
          readabilityArticles.push({ ...article, url })
        }
      })

      return readabilityArticles
    } catch (e) {
      return []
    }
  }

  private async readability(url: string): Promise<ReadabilityArticle | null> {
    try {
      const { data, headers } = await axios.get<string>(url, {
        timeout: this.config.axiosTimeout,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.5304.88 Safari/537.36',
          Referer: 'https://google.ru',
        },
      })

      if (headers['content-type'] === undefined || headers['content-type'] === null) {
        return null
      }

      if (headers['content-type'].indexOf('8') === -1) {
        return null
      }

      if (data.indexOf('<title>') === -1) {
        return null
      }

      const virtualConsole = new VirtualConsole()
      const doc = new JSDOM(data, { url, virtualConsole })
      const article = new Readability(doc.window.document, { debug: false }).parse() as ReadabilityArticle

      return { ...article, url }
    } catch (e) {
      if (e.code === 'ECONNABORTED') {
        console.log(`AXIOS TIMEOUT`)
      }

      return null
    }
  }

  private async getContent(url: string): Promise<ContentData | null> {
    try {
      const { data, headers } = await axios.get<string>(url, {
        timeout: this.config.axiosTimeout,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.5304.88 Safari/537.36',
          Referer: 'https://google.ru',
        },
      })

      if (headers['content-type'] === undefined || headers['content-type'] === null) {
        return null
      }

      if (headers['content-type'].indexOf('8') === -1) {
        return null
      }

      if (data.indexOf('<title>') === -1) {
        return null
      }

      return { url, data }
    } catch (e) {
      if (e.code === 'ECONNABORTED') {
        console.log(`AXIOS TIMEOUT`)
      }

      return null
    }
  }
}

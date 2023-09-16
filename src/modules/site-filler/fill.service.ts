import { Injectable, Logger } from '@nestjs/common'
import { chunk } from 'lodash'

import { millisToMinutesAndSeconds } from '../../utils'
import { ArticleGeneratorService } from '../article-generator/article-generator.service'
import { GenerateArticleDto } from '../article-generator/dto'
import { GenerateResult } from '../article-generator/types'
import { KeywordsService } from '../keywords/keywords.service'
import { LinksFilterService } from '../links-filter/links-filter.service'
import { ParseResult } from '../parser2/types'
import { Site } from '../site/types'
import { WordpressService } from '../wordpress/wordpress.service'

@Injectable()
export class FillService {
  private readonly logger = new Logger(FillService.name)
  constructor(
    private readonly articleGeneratorService: ArticleGeneratorService,
    private readonly wordpressService: WordpressService,
    private readonly linksFilterService: LinksFilterService,
    private readonly keywordsService: KeywordsService
  ) {}

  public async prepareData(data: ParseResult[]) {
    const result: GenerateArticleDto[] = []

    for (const item of data) {
      const { keyword, urls } = item
      const filteredUrls = await this.linksFilterService.filter({ urls })

      if (filteredUrls.length > 10) {
        const urlChunk = chunk(filteredUrls, 10)[0]
        if (urlChunk) {
          result.push({ keyword, urls: urlChunk, addSource: true })
        }
      } else {
        result.push({ keyword, urls: filteredUrls, addSource: true })
      }
    }

    return result
  }

  public async fill(dto: GenerateArticleDto[], site: Site) {
    const generateStart = new Date().getTime()
    this.logger.log('Начата генерация статей')

    const generatedResult = await Promise.all(
      dto.map((articleData) => this.articleGeneratorService.generate(articleData))
    )

    const generateEnd = new Date().getTime()
    const generateEndTime = generateEnd - generateStart
    this.logger.log(`Генерация статей завершена: ${millisToMinutesAndSeconds(generateEndTime)}`)

    const articles: GenerateResult[] = generatedResult.filter((article) => article !== null)

    this.logger.log(`Ожидание статей: ${generatedResult.length}`)
    this.logger.log(`На выходе статей: ${articles.length}`)

    if (articles.length) {
      const postingStart = new Date().getTime()
      this.logger.log('Постинг начат')

      for (const article of articles) {
        const isSaved = await this.wordpressService.saveArticle(article, site)
        if (isSaved) {
          await this.keywordsService.setCompleted(article.keyword.id)
        } else {
          await this.keywordsService.setError(article.keyword.id)
        }
      }

      const postingEnd = new Date().getTime()
      const postingEndTime = postingEnd - postingStart
      this.logger.log(`Постинг завершен ${millisToMinutesAndSeconds(postingEndTime)}`)
    }
  }
}

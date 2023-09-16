import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { chunk } from 'lodash'
import * as sanitizeHtml from 'sanitize-html'

import { ReadabilityService } from '../readability/readability.service'
import { GenerateArticleDto } from './dto'
import { GenerateResult } from './types'

@Injectable()
export class ArticleGeneratorService {
  private readonly minArticleLength: number
  private readonly minArticleCount: number
  private readonly maxArticleCount: number

  constructor(private readonly readabilityService: ReadabilityService, private readonly configService: ConfigService) {
    this.minArticleLength = +this.configService.get<number>('articleGenerator.minArticleLength')
    this.minArticleCount = +this.configService.get<number>('articleGenerator.minArticleCount')
    this.maxArticleCount = +this.configService.get<number>('articleGenerator.maxArticleCount')
  }

  public async generate(dto: GenerateArticleDto): Promise<GenerateResult | null> {
    const { urls, keyword, addSource } = dto

    if (urls.length < this.minArticleCount) {
      return null
    }

    const readabilityArticles = await this.readabilityService.getReadabilityArticleByUrls({ urls })
    if (!readabilityArticles.length) {
      return null
    }

    const sanitizedArticles = readabilityArticles
      .filter((article) => article.content !== undefined)
      .filter((article) => article.content !== null)
      .filter((article) => article.content.length >= this.minArticleLength)
      .map((article) => ({ ...article, content: this.sanitize(article.content) }))

    if (sanitizedArticles.length < this.minArticleCount) {
      return null
    }

    const articlesChunk = chunk(sanitizedArticles, this.maxArticleCount)[0]

    const resultArticlesContent: string[] = []
    articlesChunk.forEach((articleData) => {
      resultArticlesContent.push(articleData.content)
      if (addSource) {
        resultArticlesContent.push(this.generateSourceBlock(articleData.url))
      }
    })

    const article = resultArticlesContent.join('\n')

    return { content: article, keyword }
  }

  private sanitize(content: string): string | null {
    try {
      const sanitizeHtmlArticleContent = sanitizeHtml(content, {
        allowedTags: [
          'img',
          'address',
          'article',
          'aside',
          'footer',
          'header',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'hgroup',
          'main',
          'nav',
          'section',
          'blockquote',
          'dd',
          'div',
          'dl',
          'dt',
          'figcaption',
          //'figure',
          'hr',
          'li',
          'main',
          'ol',
          'p',
          'pre',
          'ul',
          //'a',
          'abbr',
          'b',
          'bdi',
          'bdo',
          'br',
          'cite',
          'code',
          'data',
          'dfn',
          'em',
          'i',
          'kbd',
          'mark',
          'q',
          'rb',
          'rp',
          'rt',
          'rtc',
          'ruby',
          's',
          'samp',
          'small',
          'span',
          'strong',
          'sub',
          'sup',
          'time',
          'u',
          'var',
          'wbr',
          //'caption',
          'col',
          'colgroup',
          'table',
          'tbody',
          'td',
          'tfoot',
          'th',
          'thead',
          'tr',
        ],
      })
      return sanitizeHtmlArticleContent
    } catch (e) {
      return null
    }
  }

  private generateSourceBlock(url: string) {
    return `<div class="source-url"><a href="${url}" rel="noopener" target="_blank">Источник</a></div>`
  }
}

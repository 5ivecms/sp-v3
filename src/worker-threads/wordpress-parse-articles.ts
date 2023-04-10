/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core'
import { parentPort, threadId } from 'worker_threads'
import { ConfigService } from '@nestjs/config'
import { chunk } from 'lodash'
import { ArticleGeneratorService } from '../modules/article-generator/article-generator.service'
import { AppModule } from '../app.module'
import { WordpressService } from '../modules/wordpress/wordpress.service'
import { ParseArticle, WordpressKeyword } from '../modules/wordpress/wordpress.types'
import { LinksFilterService } from '../modules/links-filter/links-filter.service'
import { GenerateArticleDto } from '../modules/article-generator/dto'
import { millisToMinutesAndSeconds } from '../utils'
import { YandexSearchParserService } from '../modules/yandex-search-parser/yandex-search-parser.service'
import { MailSearchParserService } from '../modules/mail-search-parser/mail-search-parser.service'

// Добавить время выполнения потока
async function wordpressParseArticlesWorker() {
  console.log(`Поток ${threadId} начал работу`)
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })
  const configService = app.get(ConfigService)
  const wordpressService = app.get(WordpressService)
  const articleGeneratorService = app.get(ArticleGeneratorService)
  const mailSearchParserService = app.get(MailSearchParserService)
  const yandexSearchParserService = app.get(YandexSearchParserService)
  const linksFilterService = app.get(LinksFilterService)
  const keywordsPerTread = +configService.get<number>('wordpress.keywordsPerTread')
  const searchEngine = configService.get<string>('searchEngine.searchEngine')

  let isParsing = true

  /* while (isParsing) {
    const currentDate = new Date()
    const currentTime = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`

    const start = new Date().getTime()
    let keywords: WordpressKeyword[] = []

    try {
      console.log(`Поток ${threadId} получает ключи`)
      keywords = await wordpressService.getKeywords({ limit: keywordsPerTread })
    } catch (e) {
      console.error(`Ошибка при получении ключей, парсинг остановлен, threadId ${threadId}`)
      console.error(e)
      isParsing = false
      continue
    }

    if (!keywords.length) {
      console.error(`Нет ключей, threadId ${threadId}`)
      isParsing = false
      continue
    }

    try {
      const parsingStart = new Date().getTime()
      const articlesData: GenerateArticleDto[] = []

      console.log(`Поток ${threadId} собирает ссылки`)
      if (searchEngine === 'yandex') {
        await yandexSearchParserService.parse(
          keywords.map(({ keyword }) => keyword),
          async (data) => {
            if (!data?.keyword) {
              return
            }
            const { keyword, urls } = data
            const filteredUrls = linksFilterService.filter({ urls })
            const urlChunk = chunk(filteredUrls, 10)[0]
            articlesData.push({ keyword, urls: urlChunk, addSource: true })
          }
        )
      }

      if (searchEngine === 'mail') {
        await mailSearchParserService.parse(
          keywords.map(({ keyword }) => keyword),
          async (data) => {
            if (!data?.keyword) {
              return
            }
            const { keyword, urls } = data
            const filteredUrls = linksFilterService.filter({ urls })
            //console.log(`Поток ${threadId}: filteredUrls ${filteredUrls.length}`)
            if (filteredUrls.length > 10) {
              const urlChunk = chunk(filteredUrls, 10)[0]
              if (urlChunk) {
                articlesData.push({ keyword, urls: urlChunk, addSource: true })
              }
            } else {
              articlesData.push({ keyword, urls: filteredUrls, addSource: true })
            }
          }
        )
      }

      console.log(`Поток ${threadId} генерирует статьи`)
      const parsingEnd = new Date().getTime()
      const parsingEndTime = parsingEnd - parsingStart

      const generateStart = new Date().getTime()
      const generatedResult = await Promise.all(
        articlesData.map((articleData) => articleGeneratorService.generate(articleData))
      )

      const notEmptyArticles = generatedResult.filter((article) => article !== null)

      const parseArticles: ParseArticle[] = notEmptyArticles.map(({ keyword, article, excerpt }) => ({
        keyword: wordpressService.findKeywordByText(keywords, keyword),
        article: { content: article, shortContent: excerpt, tableContent: '', thumb: '' },
      }))

      console.log(`Поток ${threadId} сохраняет статьи`)
      const generateEnd = new Date().getTime()
      const generateEndTime = generateEnd - generateStart

      const postingStart = new Date().getTime()
      await wordpressService.saveArticles(parseArticles)
      const postingEnd = new Date().getTime()
      const postingEndTime = postingEnd - postingStart

      const end = new Date().getTime()
      const time = end - start

      console.log('========================')
      console.log(`threadId: ${threadId}`)
      console.log(`Начало в ${currentTime}`)
      console.log(`articlesData: ${articlesData.length}`)
      console.log(`Ожидание статей: ${generatedResult.length}`)
      console.log(`На выходе статей: ${parseArticles.length}`)
      console.log(`Парсинг ссылок: ${millisToMinutesAndSeconds(parsingEndTime)}`)
      console.log(`Генерация статей: ${millisToMinutesAndSeconds(generateEndTime)}`)
      console.log(`Постинг: ${millisToMinutesAndSeconds(postingEndTime)}`)
      console.log(`Время выполнения: ${millisToMinutesAndSeconds(time)}`)
      console.log('========================')
    } catch (e) {
      console.error(e)
      continue
    }
  }

  console.log(`Поток ${threadId} завершил работу`)
  parentPort.postMessage(true) */
}

wordpressParseArticlesWorker()

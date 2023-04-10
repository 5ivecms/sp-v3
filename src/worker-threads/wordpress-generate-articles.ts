import { GenerateArticleDto } from '../modules/article-generator/dto'
import { threadId, workerData } from 'worker_threads'
import { ParseArticle, WordpressKeyword } from '../modules/wordpress/wordpress.types'
import * as sanitizeHtml from 'sanitize-html'
import { Readability } from '@mozilla/readability'
import { JSDOM, VirtualConsole } from 'jsdom'
import { millisToMinutesAndSeconds } from '../utils'
import { chunk } from 'lodash'
import { ReadabilityArticle } from '../modules/readability/readability.types'
import { GetReadabilityArticleByUrlsDto } from '../modules/readability/dto'
import axios from 'axios'
import { SaveArticleDto } from '../modules/wordpress/dto'
import { WordpressApiUrls } from '../modules/wordpress/wordpress.constants'

const minArticleLength = 2000
const minArticleCount = 3
const maxArticleCount = 10

async function wordpressGenerateArticlesWorker() {
  const { articlesData, keywords } = workerData as {
    articlesData: GenerateArticleDto[]
    keywords: WordpressKeyword[]
  }
  const start = new Date().getTime()

  console.log(`Генерируем статьи, threadId ${threadId}`)
  const generateStart = new Date().getTime()
  const generatedResult = await Promise.all(articlesData.map((articleData) => generate(articleData)))

  const notEmptyArticles = generatedResult.filter((article) => article !== null)

  const parseArticles: ParseArticle[] = notEmptyArticles.map(({ keyword, article, excerpt }) => ({
    keyword: findKeywordByText(keywords, keyword),
    article: { content: article, shortContent: excerpt, tableContent: '', thumb: '' },
  }))

  const generateEnd = new Date().getTime()
  const generateEndTime = generateEnd - generateStart
  console.log(`Генерация статей завершена, threadId ${threadId}: ${millisToMinutesAndSeconds(generateEndTime)}`)

  console.log(generatedResult.length, parseArticles.length)
  await saveArticles(parseArticles)

  const postingEnd = new Date().getTime()
  const postingEndTime = postingEnd - start
  console.log(`Постинг статей завершен, threadId ${threadId}: ${millisToMinutesAndSeconds(postingEndTime)}`)

  const end = new Date().getTime()
  const time = end - start
  console.log(`Время выполнения, threadId ${threadId}: ${millisToMinutesAndSeconds(time)}`)
  console.log('')
  console.log('')
  console.log('')
}

wordpressGenerateArticlesWorker()

async function generate(dto: GenerateArticleDto) {
  const { urls, keyword, addSource } = dto

  const readabilityArticles = await getReadabilityArticleByUrls({ urls })
  if (!readabilityArticles.length) {
    return null
  }

  const sanitizedArticles = readabilityArticles
    .filter((article) => article.length >= minArticleLength)
    .map((article) => ({ ...article, content: sanitize(article.content) }))

  if (sanitizedArticles.length < minArticleCount) {
    return null
  }

  const articlesChunk = chunk(sanitizedArticles, maxArticleCount)[0]

  const resultArticlesContent: string[] = []
  articlesChunk.forEach((articleData) => {
    resultArticlesContent.push(articleData.content)
    if (addSource) {
      resultArticlesContent.push(generateSourceBlock(articleData.url))
    }
  })

  const article = resultArticlesContent.join('\n')

  return { article, excerpt: sanitizedArticles[0].excerpt, keyword }
}

async function getReadabilityArticleByUrls(dto: GetReadabilityArticleByUrlsDto) {
  const { urls } = dto
  const result = await Promise.allSettled(urls.map(async (url) => await readability(url)))
  if (!result) {
    return []
  }

  const fulfilledData = result.filter((data) => data.status === 'fulfilled').filter((data: any) => data.value !== null)
  const readabilityArticles = fulfilledData.map((data: any) => data.value as ReadabilityArticle)

  return readabilityArticles
}

function sanitize(content: string): string {
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
}

function generateSourceBlock(url: string) {
  return `<div class="source-url"><a href="${url}" rel="noopener">Источник</a></div>`
}

async function readability(url: string): Promise<ReadabilityArticle | null> {
  try {
    const { data, headers } = await axios.get<string>(url, {
      timeout: 20000,
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
    //console.error(e)
    return null
  }
}

function findKeywordByText(keywords: WordpressKeyword[], text: string): WordpressKeyword | null {
  return keywords.find((keyword) => keyword.keyword === text)
}

async function saveArticles(dto: SaveArticleDto[]) {
  try {
    await axios.post(`http://article-wp.local:81${WordpressApiUrls.SAVE_ARTICLE}`, dto, {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 180000,
    })
  } catch (e) {
    console.log(e)
  }
}

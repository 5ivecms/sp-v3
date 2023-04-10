import { registerAs } from '@nestjs/config'

export default registerAs('articleGenerator', () => ({
  minArticleLength: process.env.ARTICLE_GENERATOR_MIN_ARTICLE_LENGTH,
  minArticleCount: process.env.ARTICLE_GENERATOR_MIN_ARTICLE_COUNT,
  maxArticleCount: process.env.ARTICLE_GENERATOR_MAX_ARTICLE_COUNT,
}))

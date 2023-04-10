import { registerAs } from '@nestjs/config'

export type WordpressConfig = {
  domain: string
  threads: number
  keywordsPerTread: number
}

export default registerAs('wordpress', () => ({
  domain: process.env.WORDPRESS_DOMAIN,
  threads: Number(process.env.WORDPRESS_THREADS),
  keywordsPerTread: Number(process.env.KEYWORDS_PER_THREAD),
}))

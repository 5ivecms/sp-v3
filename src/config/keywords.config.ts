import { registerAs } from '@nestjs/config'

export type KeywordsConfig = {
  keywordsPerTread: number
}

export default registerAs('keywords', () => ({
  keywordsPerTread: Number(process.env.KEYWORDS_PER_THREAD),
}))

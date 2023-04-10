import { registerAs } from '@nestjs/config'

export type SearchConfig = {
  searchEngine: 'yandex' | 'mail'
  startPage: number
  lastPage: number
}

export default registerAs('searchEngine', () => ({
  searchEngine: process.env.SEARCH_ENGINE || 'mail',
  startPage: Number(process.env.SEARCH_START_PAGE || 1),
  lastPage: Number(process.env.SEARCH_LAST_PAGE || 1),
}))

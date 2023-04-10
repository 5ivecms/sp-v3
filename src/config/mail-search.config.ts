import { registerAs } from '@nestjs/config'

export default registerAs('mailSearch', () => ({
  startPage: process.env.MAIL_SEARCH_START_PAGE || 1,
  lastPage: process.env.MAIL_SEARCH_LAST_PAGE || 1,
}))

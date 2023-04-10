import { registerAs } from '@nestjs/config'

export type ParserConfig = {
  browserTimeout: number
}

export default registerAs('parser', () => ({
  browserTimeout: Number(process.env.PARSER_BROWSER_TIMEOUT),
}))

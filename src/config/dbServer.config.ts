import { registerAs } from '@nestjs/config'

export type DbServerConfig = {
  host: number
}

export default registerAs('dbServer', () => ({
  host: process.env.DB_SERVER,
}))

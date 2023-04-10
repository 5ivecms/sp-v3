import { registerAs } from '@nestjs/config'

export type ReadabilityConfig = {
  axiosTimeout: number
}

export default registerAs('readability', () => ({
  axiosTimeout: Number(process.env.READABILITY_AXIOS_TIMEOUT),
}))

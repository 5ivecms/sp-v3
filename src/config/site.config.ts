import { registerAs } from '@nestjs/config'

export type SiteConfig = {
  id: number
}

export default registerAs('site', () => ({
  id: Number(process.env.SITE_ID),
}))

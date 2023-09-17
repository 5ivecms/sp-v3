import { registerAs } from '@nestjs/config'

export type ThreadConfig = {
  threadId: number
}

export default registerAs('threadConfig', () => ({
  threadId: process.env.THREAD_ID,
}))

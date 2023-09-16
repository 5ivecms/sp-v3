import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { WordpressService } from './wordpress.service'

@Module({
  imports: [ConfigModule],
  exports: [WordpressService],
  providers: [WordpressService],
})
export class WordpressModule {}

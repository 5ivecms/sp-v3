import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ReadabilityController } from './readability.controller'
import { ReadabilityService } from './readability.service'

@Module({
  imports: [ConfigModule],
  controllers: [ReadabilityController],
  exports: [ReadabilityService],
  providers: [ReadabilityService],
})
export class ReadabilityModule {}

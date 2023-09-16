import { Module } from '@nestjs/common'

import { KeywordsService } from './keywords.service'

@Module({
  imports: [],
  providers: [KeywordsService],
  exports: [KeywordsService],
})
export class KeywordsModule {}

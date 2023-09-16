import { Module } from '@nestjs/common'

import { LinksFilterController } from './links-filter.controller'
import { LinksFilterService } from './links-filter.service'

@Module({
  controllers: [LinksFilterController],
  exports: [LinksFilterService],
  providers: [LinksFilterService],
})
export class LinksFilterModule {}

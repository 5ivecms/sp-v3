import { Module } from '@nestjs/common'

import { SiteService } from './site.service'

@Module({
  imports: [],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}

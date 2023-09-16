import { Module } from '@nestjs/common'

import { ArticleGeneratorModule } from '../article-generator/article-generator.module'
import { KeywordsModule } from '../keywords/keywords.module'
import { LinksFilterModule } from '../links-filter/links-filter.module'
import { LoggerModule } from '../logger/logger.module'
import { Parser2Module } from '../parser2/parser2.module'
import { SiteModule } from '../site/site.module'
import { WordpressModule } from '../wordpress/wordpress.module'
import { FillService } from './fill.service'
import { SiteFillerCommand } from './site-filler.command'
import { SiteFillerController } from './site-filler.controller'
import { SiteFillerService } from './site-filler.service'

@Module({
  imports: [
    WordpressModule,
    Parser2Module,
    LinksFilterModule,
    ArticleGeneratorModule,
    LoggerModule,
    SiteModule,
    KeywordsModule,
  ],
  controllers: [SiteFillerController],
  providers: [SiteFillerService, FillService, SiteFillerCommand],
  exports: [SiteFillerService, FillService, SiteFillerCommand],
})
export class SiteFillerModule {}

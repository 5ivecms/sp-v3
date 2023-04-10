import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ArticleGeneratorModule } from '../article-generator/article-generator.module'
import { LinksFilterModule } from '../links-filter/links-filter.module'
import { WordpressController } from './wordpress.controller'
import { WordpressService } from './wordpress.service'

@Module({
  imports: [ConfigModule, LinksFilterModule, ArticleGeneratorModule],
  controllers: [WordpressController],
  exports: [WordpressService],
  providers: [WordpressService],
})
export class WordpressModule {}

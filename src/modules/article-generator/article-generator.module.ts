import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ReadabilityModule } from '../readability/readability.module'
import { ArticleGeneratorController } from './article-generator.controller'
import { ArticleGeneratorService } from './article-generator.service'

@Module({
  imports: [ReadabilityModule, ConfigModule],
  controllers: [ArticleGeneratorController],
  providers: [ArticleGeneratorService],
  exports: [ArticleGeneratorService],
})
export class ArticleGeneratorModule {}

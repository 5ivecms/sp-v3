import { Body, Controller, Post } from '@nestjs/common'
import { ArticleGeneratorService } from './article-generator.service'
import { GenerateArticleDto } from './dto'

@Controller('api/article-generator')
export class ArticleGeneratorController {
  constructor(private readonly articleGeneratorService: ArticleGeneratorService) {}

  @Post('generate')
  public generate(@Body() dto: GenerateArticleDto) {
    return this.articleGeneratorService.generate(dto)
  }
}

import { Body, Controller, Get, Post } from '@nestjs/common'
import { SaveArticleDto } from './dto/save-article.dto'
import { WordpressService } from './wordpress.service'

@Controller('api/wordpress')
export class WordpressController {
  constructor(public readonly wordpressService: WordpressService) {}

  @Get('get-keywords')
  public getKeywords() {
    return this.wordpressService.getKeywords()
  }

  @Post('save-articles')
  public saveArticles(@Body() dto: SaveArticleDto) {
    return this.wordpressService.saveArticles([dto])
  }
}

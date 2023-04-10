import { Body, Controller, Post } from '@nestjs/common'
import { GetReadabilityArticleByUrlDto, GetReadabilityArticleByUrlsDto } from './dto'
import { ReadabilityService } from './readability.service'

@Controller('api/readability')
export class ReadabilityController {
  constructor(private readonly readabilityService: ReadabilityService) {}

  @Post('by-url')
  public async getReadabilityArticleByUrl(@Body() dto: GetReadabilityArticleByUrlDto) {
    return this.readabilityService.getReadabilityArticleByUrl(dto)
  }

  @Post('by-urls')
  public async getReadabilityArticleByUrls(@Body() dto: GetReadabilityArticleByUrlsDto) {
    return this.readabilityService.getReadabilityArticleByUrls(dto)
  }
}

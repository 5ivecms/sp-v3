import { Body, Controller, Post } from '@nestjs/common'
import { FilterDto } from './dto'
import { LinksFilterService } from './links-filter.service'

@Controller('api/links-filter')
export class LinksFilterController {
  constructor(private readonly linksFilterService: LinksFilterService) {}

  @Post('filter')
  public filter(@Body() dto: FilterDto) {
    return this.linksFilterService.filter(dto)
  }
}

import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { ArticleDto, KeywordDto } from './index'

export class SaveArticleDto {
  @ValidateNested({ each: true })
  @Type(() => ArticleDto)
  public readonly article: ArticleDto

  @ValidateNested({ each: true })
  @Type(() => KeywordDto)
  public readonly keyword: KeywordDto
}

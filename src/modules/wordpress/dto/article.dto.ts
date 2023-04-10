import { IsString } from 'class-validator'

export class ArticleDto {
  @IsString()
  public readonly content: string

  @IsString()
  public readonly thumb: string

  @IsString()
  public readonly tableContent: string

  @IsString()
  public readonly shortContent: string
}

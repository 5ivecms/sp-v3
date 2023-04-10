import { IsArray } from 'class-validator'

export class GetReadabilityArticleByUrlsDto {
  @IsArray()
  public readonly urls: string[]
}

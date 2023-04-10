import { IsString } from 'class-validator'

export class GetReadabilityArticleByUrlDto {
  @IsString()
  public readonly url: string
}

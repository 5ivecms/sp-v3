import { IsArray } from 'class-validator'

export class ParseKeywordsDto {
  @IsArray()
  readonly keywords: string[]
}

import { IsArray, IsBoolean, IsObject } from 'class-validator'

import { Keyword } from '../../../modules/keywords/types'

export class GenerateArticleDto {
  @IsArray()
  public readonly urls: string[]

  @IsObject()
  public readonly keyword: Keyword

  @IsBoolean()
  public readonly addSource: boolean
}

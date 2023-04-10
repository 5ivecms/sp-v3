import { IsArray, IsBoolean, IsString } from 'class-validator'

export class GenerateArticleDto {
  @IsArray()
  public readonly urls: string[]

  @IsString()
  public readonly keyword: string

  @IsBoolean()
  public readonly addSource: boolean
}

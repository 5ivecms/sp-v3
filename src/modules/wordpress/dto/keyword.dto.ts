import { IsString } from 'class-validator'

export class KeywordDto {
  @IsString()
  public readonly id: string

  @IsString()
  public readonly keyword: string

  @IsString()
  public readonly category_id: string

  @IsString()
  public readonly parsing_status: string

  @IsString()
  public readonly uniqid: string
}

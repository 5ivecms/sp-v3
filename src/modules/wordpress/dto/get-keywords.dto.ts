import { IsNumberString } from 'class-validator'

export class GetKeywordsDto {
  @IsNumberString()
  public readonly limit: number
}

import { ArrayMinSize, IsArray, IsString } from 'class-validator'

import { Keyword } from '../../../modules/keywords/types'

export class ParseDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  public readonly keywords: Keyword[]
}

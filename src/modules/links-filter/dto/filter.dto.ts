import { IsArray } from 'class-validator'

export class FilterDto {
  @IsArray()
  public readonly urls: string[]
}

export type Site = {
  id: number
  domain: string
  login: string
  password: string
}

export enum KeywordStatusEnum {
  NEW = 'NEW',
  PROCESS = 'PROCESS',
  COMPLETED = 'COMPLETED',
}

export type Keyword = {
  id: number
  keyword: string
  status: KeywordStatusEnum
  categoryId: number
  siteId: number
  site: Site
}

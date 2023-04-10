export type WordpressKeyword = {
  id: string
  keyword: string
  category_id: string
  parsing_status: string
  uniqid: string
}

export type WordpressArticle = {
  content: string
  thumb: string
  tableContent: string
  shortContent: string
}

export type ParseArticle = {
  keyword: WordpressKeyword
  article: WordpressArticle
}

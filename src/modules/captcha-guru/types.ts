export type InResponse = {
  status: 'OK' | 'ERROR_WRONG_USER_KEY' | 'ERROR_CAPTCHA_UNSOLVABLE'
  requestId: string
}

export interface GeeWalletInitOptions {
  mchUserId: string
  mchNo: string
  appId: string
  geewalletPublicKey: string
  secretKey: string
  apiHost?: string
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

export interface ExecuteOptions {
  method?: HttpMethod
  url: string
  headers?: Record<string, string | number | boolean>
  body?: any
}

export default class GeeWallet {
  constructor (options: GeeWalletInitOptions)
  genRSASign (payload: any): Promise<string>
  verifyRSASign (payload: any, sign: string): Promise<boolean>
  execute<T = any> (options: ExecuteOptions): Promise<T>
}

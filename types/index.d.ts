export type ProxyOptions =
  | string
  | {
      protocol: 'http' | 'socks'
      host: string
      port: number
      username?: string
      password?: string
    }

export interface GeeWalletInitOptions {
  mchUserId: string
  mchNo: string
  appId: string
  geewalletPublicKey: string
  secretKey: string
  apiHost?: string
  proxy?: ProxyOptions
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
  genRSASign (payload: any): string
  verifyRSASign (payload: any, sign: string): boolean
  execute<T = any> (options: ExecuteOptions): Promise<T>
}

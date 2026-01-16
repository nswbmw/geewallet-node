import crypto from 'node:crypto'

import request from 'lite-request'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'
import sortKeys from 'sort-keys'

class GeeWallet {
  constructor (options = {}) {
    this.mchUserId = options.mchUserId
    this.mchNo = options.mchNo
    this.appId = options.appId
    this.geewalletPublicKey = options.geewalletPublicKey
    this.secretKey = options.secretKey
    this.apiHost = options.apiHost || 'https://easypayer.io/payment-ci/api/'

    if (!this.mchUserId) {
      throw new TypeError('No mchUserId')
    }
    if (!this.mchNo) {
      throw new TypeError('No mchNo')
    }
    if (!this.appId) {
      throw new TypeError('No appId')
    }
    if (!this.geewalletPublicKey) {
      throw new TypeError('No geewalletPublicKey')
    }
    if (!this.secretKey) {
      throw new TypeError('No secretKey')
    }
    this.geewalletPublicKey = normalizePublicKey(this.geewalletPublicKey)
    this.secretKey = normalizeSecretKey(this.secretKey)

    const proxy = options.proxy
    if (proxy) {
      if (typeof proxy === 'string') {
        if (proxy.startsWith('http://')) {
          this.agent = new HttpsProxyAgent(proxy)
        } else if (proxy.startsWith('socks://')) {
          this.agent = new SocksProxyAgent(proxy)
        }
      } else if (typeof proxy === 'object') {
        if (!['http', 'socks'].includes(proxy.protocol)) {
          throw new TypeError('proxy.protocol must be one of ["http", "socks"]')
        }
        this.agent = (proxy.protocol === 'http')
          ? new HttpsProxyAgent((proxy.username && proxy.password)
            ? `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
            : `http://${proxy.host}:${proxy.port}`
          )
          : new SocksProxyAgent((proxy.username && proxy.password)
            ? `socks://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
            : `socks://${proxy.host}:${proxy.port}`
          )
      }
    }
  }

  _genRSASignStr (payload) {
    return Object.keys(payload)
      .filter(key => {
        const val = payload[key]
        return (
          key !== 'sign' &&
          key !== 'fileData' &&
          val !== null &&
          val !== ''
        )
      })
      .sort()
      .map(key => {
        if (typeof payload[key] === 'object') {
          return `${key}=${JSON.stringify(payload[key])}`
        } else {
          return `${key}=${payload[key]}`
        }
      })
      .join('&')
  }

  genRSASign (payload) {
    const signStr = this._genRSASignStr(payload)

    return crypto.sign(
      'RSA-SHA256',
      Buffer.from(signStr, 'utf8'),
      {
        key: this.secretKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      }
    ).toString('base64')
  }

  verifyRSASign (payload, sign) {
    const signStr = this._genRSASignStr(payload)

    return crypto.verify(
      'RSA-SHA256',
      Buffer.from(signStr, 'utf8'),
      {
        key: this.geewalletPublicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(sign, 'base64')
    )
  }

  _getURL (url) {
    url = url.replace(/^\//, '')
    return `${this.apiHost}${url}`
  }

  async execute ({ method = 'GET', url, headers = {}, body }) {
    const payload = {
      method,
      url: this._getURL(url),
      headers,
      agent: this.agent,
      json: true
    }

    if (body) {
      body.mchUserId = this.mchUserId
      body.mchNo = this.mchNo
      body.appId = this.appId
      body.signType = body.signType || 'RSA'
      body.reqTime = body.reqTime || Date.now()
      body.version = body.version || '1.0'
      body = sortKeys(body, { deep: true })
      body.sign = this.genRSASign(body)

      payload.body = body
    }

    const response = await request(payload)
    const data = response.data

    const passed = await this.verifyRSASign(data.data, data.sign)
    if (!passed) {
      throw new Error(`Failed to verify response sign: ${JSON.stringify(data, null, 2)}`)
    }

    return data
  }
}

function normalizePublicKey (publicKey) {
  if (publicKey.includes('BEGIN PUBLIC KEY')) {
    return publicKey
  }

  const body = publicKey.replace(/\s+/g, '')

  return `-----BEGIN PUBLIC KEY-----\n${
    body.match(/.{1,64}/g).join('\n')
  }\n-----END PUBLIC KEY-----`
}

function normalizeSecretKey (secretKey) {
  // PKCS#1 / PKCS#8
  if (
    secretKey.includes('BEGIN PRIVATE KEY') ||
    secretKey.includes('BEGIN RSA PRIVATE KEY')
  ) {
    return secretKey
  }

  const body = secretKey.replace(/\s+/g, '')

  // PKCS#8
  return `-----BEGIN PRIVATE KEY-----\n${
    body.match(/.{1,64}/g).join('\n')
  }\n-----END PRIVATE KEY-----`
}

export default GeeWallet

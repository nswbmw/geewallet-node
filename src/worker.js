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

  async genRSASign (payload) {
    const signStr = this._genRSASignStr(payload)
    const key = await importPrivateKey(this.secretKey)
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(signStr)

    const signature = await crypto.subtle.sign(
      {
        name: 'RSASSA-PKCS1-v1_5'
      },
      key,
      dataBuffer
    )

    return arrayBufferToBase64(signature)
  }

  async verifyRSASign (payload, sign) {
    const signStr = this._genRSASignStr(payload)
    const key = await importPublicKey(this.geewalletPublicKey)
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(signStr)

    return crypto.subtle.verify(
      {
        name: 'RSASSA-PKCS1-v1_5'
      },
      key,
      base64ToArrayBuffer(sign),
      dataBuffer
    )
  }

  _getURL (url) {
    url = url.replace(/^\//, '')
    return `${this.apiHost}${url}`
  }

  async execute ({ method = 'GET', url, headers = {}, body }) {
    const fetchOptions = {
      method,
      headers: Object.assign({
        'Content-Type': 'application/json'
      }, headers)
    }

    if (body) {
      body.mchUserId = this.mchUserId
      body.mchNo = this.mchNo
      body.appId = this.appId
      body.signType = body.signType || 'RSA'
      body.reqTime = body.reqTime || Date.now()
      body.version = body.version || '1.0'

      body = sortKeys(body, { deep: true })
      body.sign = await this.genRSASign(body)

      fetchOptions.body = JSON.stringify(body)
    }

    const response = await fetch(this._getURL(url), fetchOptions)
    const data = await response.json()

    const passed = await this.verifyRSASign(data.data, data.sign)
    if (!passed) {
      throw new Error(`Failed to verify response sign: ${JSON.stringify(data, null, 2)}`)
    }

    return data
  }
}

async function importPrivateKey (pem) {
  if (pem.includes('BEGIN RSA PRIVATE KEY')) {
    throw new TypeError('RSA private key in PKCS#1 format is not supported in WebCrypto; please provide a PKCS#8 private key (BEGIN PRIVATE KEY).')
  }

  const der = pemToDer(pem)

  return crypto.subtle.importKey(
    'pkcs8',
    der,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  )
}

async function importPublicKey (pem) {
  const der = pemToDer(pem)

  return crypto.subtle.importKey(
    'spki',
    der,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['verify']
  )
}

function pemToDer (pem) {
  const pemBody = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '')

  return base64ToArrayBuffer(pemBody)
}

function base64ToArrayBuffer (base64) {
  const binaryDerString = atob(base64)
  const bytes = new Uint8Array(binaryDerString.length)
  for (let i = 0; i < binaryDerString.length; i++) {
    bytes[i] = binaryDerString.charCodeAt(i)
  }
  return bytes.buffer
}

function arrayBufferToBase64 (buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export default GeeWallet

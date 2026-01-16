## geewallet

GeeWallet SDK for Node.js.

### Install

```sh
$ npm i geewallet --save
```

### Example

```js
import GeeWallet from 'geewallet'

const geewalletClient = new GeeWallet({
  mchUserId: '7652222',
  mchNo: 'M1644203246',
  appId: '62e49a0dec2e3a4f360e59d5',
  geewalletPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAin6L7sbSapqKlDKzJkm9ztT98sH6sn/IggTr0AUN2jJIPZg6Xzi/t2rV/Bq8e8/xHE7IqkRZmLsIs8a4b+cel/NzcltKs/H9fWEq3o13MVA/ARokP5bqgIoFdHlnI8PRu+v8XdCZVKTxtgu4KIQV6HYyB6UhND4NyhqwsDC101MAuskxLVBMZfG9Og9RC3SysXCCzJrhsQNVUrdZ6boXf+2CyiACL/P+LADx8rs63uyAON2t6hjMfwgIMo2RWuP9rMPUP250UzWd/4gIrwpco4WdMeSbLqltHR3qUu6TPazVA5xgYz3Y7q84ffCBvXarVJmy2pwxd9VCohN8ayWgeQIDAQAB',
  secretKey: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCr4QiIyFFjEbj2bHFLXlX9L8oNN45Uy5CZgvwSgVl9Rt7ahHTvR3RMFSL8MTbOtFfUhnURkH8qk4nRC7Nsy8PCadtI1SIzU9e+wRnIeMtqLFrp9SpxxkxsJN6y2S++EkE2v8Mkq8Jd0v8muV4s6Rjy/FB9cqqIsu1VSxHiDZYbjVScNtjRgUpDfxwGp3FdD8yJeQW4j2BoMh5Y4EaPluPGIu3Qzt0v3/4xtLpfvEpirtJaJH4gJW9k2KPlsFc0QFbmgQwapTQ/RVErXgRKXDtiYD9WnZoQHTpYDTGufPRsRxJOq2C8coQKaK75pUxo6hScactSYenzWbQXmTqTakZ7AgMBAAECggEAU3BYG0bbs7Nbzk0Qptzx84pqlQX+U43K8asTwcwHbHimIQCiX7KZc4HjTPh7Odd0t9haJp+2DC45fkEm5k75Bn0rFe1Zv/8YwiKt6JMzdKR5sg/xffAdE3bGoZ4rviLQg8qN6lRzc+bFNMBSRo0WLodsb6nlvZzW+EwML2gXEeI7QtxaqkBWoSAJ0Umj+hyiZRFP/GekNdj5xdJZNcZJHMqM9UHwhb4IEGbW8uZcN5aU34eFpuHXbYTtAJS8CI6KP44WSEzDudagQR0bGZjxd0aE0xg/geTJw0Z2r2WuQIPUnLKKuIDLmTK/LEvT5te0RkKVUFjE/Qt2AuNmKcyyqQKBgQDe037Yp8zfkaZjoBXp93xuxB3++lWI6UliKOVUQ2D9yavIu1rbUkur39WBcAdaYMgk6TXOk8uY1lxH5mBdRyslTT9bvU++kR9mbGa8L89fz0MWN/S70bnZM4SaoQVozJdAeJfMa99CohoUzOltKxN2D+g/Sw0i6863L157E1GDTwKBgQDFd85Zga9z+gbJfzQGtfaoAKDrAD4Z+u26HPDz01b8kGlSrUqyvyaqR+cxlXyaWDe8AzLlBawgmxVyv7DRuS2ZtClVWve/7b62Kf9yeJTdDa/IkpwBROEd/Gdbte0LIqjJNtObLZW1eHIRfPlIDuPc6u7e0+/3zQh3AqB2s7EvFQKBgQDbanufsCxngi7ML1kk2JTpJak76RnNBZtDU23vOaIKhknoEcV37mOhTXoaSUyUTHUJE7PuRU7Yo0yfaFU/xNLRmm1nUtVxm8nFu7y2VoXnnFo9SMBvKifNn5NWCHUhK0VNMPKZUye3n5P7I4RAAYjaWvOhT7AR0Q3vCHAK1Y0QtQKBgQCZRCMaX8kBmHd6H8wOxV88CLjdjaOl4JhxkxMF/OwQPjoxXKWU1T66ffKZDrDWz0/7EvSGw/9Uk2pzVQt1zGfzW92VDXUsN+iFVVWa0LKiXIQqhnill4OvFYBXs33X3b/p5S8ay6feYS0QG9MUNdJwXrymoRMpX6+JR7WqTFBi/QKBgBpqbJ9bkW5QK6+O4G1fHiLTi0s5t2I2lJ84gqkkCQ69TwlBlnJdL9zpil8cWh7iCWjToic/x6BVN/PhKMo6hLJQBbYwFMlVyii/UR4KvTQZCY3HKqvwsPFynUw9sOXpP1b0AGvN41hsdGbQhbA/hBcDLbK/pAqPZi+AXLVQLrgX'
})

;(async () => {
  const res = await geewalletClient.execute({
    method: 'POST',
    url: '/pay/cashierOrder',
    body: {
      mchOrderNo: String(Date.now()),
      subject: '商品标题测试',
      body: '商品描述测试',
      mchUserId: '7652222',
      amount: 100,
      currency: 'USD',
      wayCode: 'GEEPAY_CASHIER_NSETT',
      channelExtra: {
        terminalType: 'WEB',
        language: 'en',
        country: 'US',
      },
      clientIp: '210.73.10.148',
      returnUrl: 'https://google.com/returnUrl'
    }
  })

  /*
  {
    code: '0',
    data: {
      mchOrderNo: '1768474911172',
      orderState: 0,
      payData: 'https://sandbox.geewallet.us/geepay-ui-cashier/#/?terminalType=WEB&token=4ec344aaa5db83a04804a8796793e4e57922e7fe1076b391c50bc2895020ee06&payway=zip|ZIP-afterpay|AFTERPAY-skrill|SKRILL&language=en&jumpType=2',
      payDataType: 'payurl',
      payOrderId: 'P20117557107648102410115'
    },
    msg: 'SUCCESS',
    sign: 'UqfaMZt5UNgtjWClAzWVB3UAwVqz6GqiyEn8LbblCEDJ3AqGKoYNYpC0J8AYfLdBU4tda1axSn702Fv94VD2qj4xx4CGI66V3/hPwBpSSydJyPLjrjRuJynxH+IuXLb425BGxvu4OMBwws3OEAR1/4MVMjkH0bIGrrsmgzBJs3fOuHCmcJ8VoKvMgTio6v6X4r7LZGWiFo4FTo5UYiHabhNeG0CfMPP6bu1sIGlsJMmtHc+5mZZqUSneuHc4SCPrmaBsG5g0yWH5uuIRe8uXpKBAzvUMrfNxfBy7FwnpCZbKTjB2l7Ht2DWwUa5MxzVSZslMjRLdN3ZPcinWXw5xTg=='
  }
  */
  console.log(res)
})().catch(console.error)
```

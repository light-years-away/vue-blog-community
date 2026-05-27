/*
 * @Author: 
 * @Date: 2026-03-14 17:27:05
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-25 17:35:44
 * @Description: 
 * @FilePath: \vue-blog\src\util\encrypt.js
 */
import store from 'store'
import base from '@/config/base.config'
import forge from 'node-forge'
import service from '@/api/common'

const { PUBKEY_NAME } = base
export default
  async function encrypt (value) {
  let key = store.get(PUBKEY_NAME)
  try {
    if (!key || key === 'undefined') {
      let result = await service.get('/keys')
      key = result.data.pubKey
      key = key.replace(/\. +/g, '')
      key = key.replace(/[\r\n]/g, '')
      store.set(PUBKEY_NAME, key)
    }

    //使用公钥加密
    const publicObj = forge.pki.publicKeyFromPem(key)
    let bytes = publicObj.encrypt(value, 'RSA-OAEP')
    return forge.util.encode64(bytes)
  } catch (err) {
    console.log(err)
  }
}
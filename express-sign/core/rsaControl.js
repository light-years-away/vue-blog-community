/*
 * @Author: 
 * @Date: 2025-12-09 22:09:09
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-01-30 18:34:57
 * @Description: 
 * @FilePath: \付浩哲_Node第四十七天_20260130\express-sign\core\rsaControl.js
 */
const { generateKeys, encrypt, decrypt } = require('../core/util/util')
const fs = require('fs').promises
const fsSync = require('fs')
const { pubKeyPath, priKeyPath } = require('../config')

module.exports = {
  async getPubilcKey() {
    let key
    try {
      key = await fs.readFile(pubKeyPath, 'utf8')
    } catch (err) {
      generateKeys()//创建秘钥
      key = await fs.readFile(pubKeyPath, 'utf8')
    }
    return key
  },
  getPublicKeySync () {//同步获取PublicKey
    return fsSync.readFileSync(pubKeyPath, 'utf8')
  },
  async getPrivateKey() {
    let key
    try {
      key = await fs.readFile(priKeyPath, 'utf8')
    } catch (err) {
      generateKeys()//创建秘钥
      key = await fs.readFile(priKeyPath, 'utf8')
    }
    return key
  }
}
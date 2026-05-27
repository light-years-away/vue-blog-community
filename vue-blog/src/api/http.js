/*
 * @Author: 
 * @Date: 2026-03-14 17:17:05
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-04 18:43:24
 * @Description: 
 * @FilePath: \vue-blog\src\api\http.js
 */
import service from './common'
import { ElNotification } from 'element-plus'
//引用pinia
import { useUserStore } from '@/stores/userStore.js'
import store from 'store'
import API_LIST from '@/config/api.config'
import base from '@/config/base.config.js'
import encrypt from '@/util/encrypt'

const { TOKEN_NAME } = base



export default async function Http({ type, data }) {
  //创建 Store 实例
  const userStore = useUserStore()

  if (!(type in API_LIST)) {
    console.log(type)
    throw new Error('API请求错误')
  }
  let { url, method, noMessage = false, rsaKey = false, rest = false, setToken = false } = API_LIST[type]
  try {
    method = method.toLowerCase()
    if (rest) {
      let restSymbol = url.match(/:(.*)$/)[1]//从URL中，提取最后一个:之后直到字符串末尾的所有内容,[0]是完整匹配的内容（包含冒号），[1]是第一个捕获组(.*)匹配的内容（只取冒号后的部分）比如/api/rest/articles/:id取 'id'
      url = url.replace(/:(.*)$/, data[restSymbol])//从传入的data中取对应名称的真实值（比如data['id']得到 654765876456）
    }
    if (rsaKey && data[rsaKey]) {
      data[rsaKey] = await encrypt(data[rsaKey])
    }
    data = method === 'get' ? { params: data } : data//get请求时axios会把params里的键值对拼接成 URL 查询参数(如?id=123&name=xxx)

    let result = await service[method](url, data)

    if (setToken) {
      let token = result.token;
      let uid = result.userId
      //本地存储uid
      store.set('uid', uid)
      //本地存储token
      store.set(TOKEN_NAME, token)
      userStore.login()//执行一次 userStore.login
    }

    //因为async  JS 会自动把返回值包一层 Promise
    return result
    // ↓ 自动变成
    // return Promise.resolve(result)
  } catch (error) {
    if (error.response) {
      let message = error.response.data.message
      if (!noMessage) {
        console.log(message)

        ElNotification.error({ title: '错误', message: message })
      }
    }
    return Promise.reject(error);
  }
}
/* //参数 公钥 明文
//返回 密文
function encrypt(publicKey, plain) {
  const publicObj = forge.pki.publicKeyFromPem(publicKey)
  let bytes = publicObj.encrypt(plain, 'RSA-OAEP')
  return forge.util.encode64(bytes)
} */

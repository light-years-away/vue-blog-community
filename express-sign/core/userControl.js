/*
 * @Author: 
 * @Date: 2025-12-10 16:16:42
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-01-19 11:41:11
 * @Description: 
 * @FilePath: \付浩哲_Node第三十六天_20260117\express-sign\core\userControl.js
 */
//无用
const { decrypt, encrypt, generateKeys } = require('../core/util/util')
const fs = require('fs').promises
const { userPath } = require('../config')
const { verify } = require('crypto')
const { getUserStatusMsg } = require('./statusControl')

module.exports = {
  //添加用户
  async addUser(username, pwd) {
    let password = await encrypt(pwd)//传输过来之后再加密一次
    // console.log(password, '========')
    let user = await this.getUserInfo(username)
    if (user?.['tag'] === 'USER_NOF') {//用户不存在
      let userId = await getUsersNum()
      userId = ('000000' + userId).slice(-6)//将userId补零后 截取最后6位字符
      try {
        await appendUser({ user_id: userId, user_name: username, password })
        let resData = getUserStatusMsg('USER_ADD')
        resData.statusCode = 200
        return {
          ...resData,
          data: {
            user_id: userId, user_name: username
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
    if (user?.['tag'] === 'USER_FOND') {
      return {
        ...getUserStatusMsg('USER_DR')
      }
    }
    return {
      statusCode: user.statusCode,
      errMsg: '注册失败'
    }
  },

  //获取用户信息
  async getUserInfo(username) {
    try {
      let users = await getUsers()
      let userInfo = users.find(item => {
        return item['user_name'].trim() === username.trim()
      })
      if (!userInfo) {
        return {
          ...getUserStatusMsg('USER_NOF')
        }
      }
      return {
        ...getUserStatusMsg('USER_FOND'),
        data: {
          ...userInfo
        }
      }

    } catch (err) {
      console.error(err)
      return {
        ...getUserStatusMsg('USER_FERR'),
      }
    }

  },

  //验证用户账号密码
  async verifyUser(username, pwd) {
    let user = await this.getUserInfo(username)

    if (user?.['tag'] !== 'USER_FOND') {//如果没有查询成功
      return user
    }

    let { user_name, user_id, password } = user.data

    //验证密码 库中存储二次加密 和传输 一次加密 对比
    // decrypt(password.trim()).then(str => console.log(str, '11111111111111111111111'))

    // console.log('11111111111111111111111', await decrypt(await decrypt(password.trim())))

    let isVerify = await decrypt(await decrypt(password.trim())) === await decrypt(pwd.trim())

    console.log(isVerify)
    if (isVerify) {
      return {
        ...getUserStatusMsg('USER_INN'),
        data: {
          user_id, user_name
        }
      }
    }

  },


  //验证Token信息
  async verifyToken(username, userID) {
    // console.log(username, userID)
    try {
      let users = await getUsers();
      let userInfo = users.find(item => item['user_id'].trim() === userID.trim())

      if (!userInfo) {
        console.log('USER_NOF')
        return {
          ...getUserStatusMsg('USER_NOF')
        }
      }

      if (userInfo['user_name'] === username) {
console.log('USER_FOND')
        return {
          
          ...getUserStatusMsg('USER_FOND'),
        }
      }

    } catch (err) {
      console.error(err)
      return {
        ...getUserStatusMsg('USER_FERR'),
      }
    }
  },

}


async function getUsers() {
  let users = await fs.readFile(userPath, 'utf8')
  users = JSON.parse(users)
  return users
}


async function setUsers(users) {
  try {
    await fs.writeFile(userPath, JSON.stringify(users), 'utf8')
    return true
  } catch (err) {
    console.error(err)
    return false
  }

}

async function appendUser({ user_id = false, user_name = false, password = false }) {
  let user = await getUsers()
  user.push({
    user_id, user_name, password
  })
  await setUsers(user)
  return true
}


async function getUsersNum() {
  let users = await getUsers()
  return users.length
}
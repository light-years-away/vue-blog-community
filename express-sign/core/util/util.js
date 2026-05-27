/*
 * @Author: 
 * @Date: 2025-12-07 18:19:50
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-08 16:41:12
 * @Description: 
 * @FilePath: \express-sign\core\util\util.js
 */
const NodeRSA = require('node-rsa');
const path = require('path')
const fs = require('fs')
const fsp = require('fs').promises
const { pubKeyPath, priKeyPath } = require('../../config')
const mongoPage = require('mongoose-sex-page')
const qs = require('qs')

// generateKeys()
//创建秘钥
function generateKeys() {
  //实例化 b 秘钥位 bit 越大越安全 256 , 512, 1024 - 4096
  const newkey = new NodeRSA({ b: 2048 });

  //设置秘钥模式
  // newkey.setOptions({ encryptionScheme: 'pkcs1' })

  //设置公钥 
  let public_key = newkey.exportKey('pkcs1-public')//公钥,

  //设置私钥
  let private_key = newkey.exportKey('pkcs1-private') //私钥

  //写入公钥 私钥 cer文件
  fs.writeFileSync(priKeyPath, private_key);
  fs.writeFileSync(pubKeyPath, public_key);

}

//加密
function encrypt(plain) {
  //读取秘钥 公钥
  let public_key = fs.readFileSync(pubKeyPath, 'utf8');
  const nodersa = new NodeRSA(public_key);

  //设置秘钥 scheme
  // nodersa.setOptions({ encryptionScheme: 'pkcs1' });

  //调用加密方法  plain是需要加密的明文 加密生成的格式
  const encrypted = nodersa.encrypt(plain, 'base64');
  return encrypted;
}
// encrypt('1234565').then(str => console.log(str))
//解密
function decrypt(cipher) {
  // 获取私钥
  let private_key = fs.readFileSync(priKeyPath, 'utf8');
  //私钥实例化 NodeRSA
  let prikey = new NodeRSA(private_key);

  //设置 模式 scheme pkcs1
  // prikey.setOptions({ encryptionScheme: 'pkcs1' });

  // decrypt(解密密文, 解密后格式)
  return prikey.decrypt(cipher, 'utf8')
}

// decrypt('YAoy9Vn1bE3ftiKNtpzoNm7phpTpjCSrw2o8CWltTSfdCHOaWA77iji0kPj6xHSt+JQBpJLuUeC/41JkjlGpaWBKcr8IpVhwDmHi3AArGPysEX+5l5Y4Ja11Il1zMctmrrJg6rWrCtOd0tfkYKFWrWTP1HEuOnturWXBJxvnIYiS3VDmaU+UQWK17z0A3dmY9MxtiN/oeNFkRohOC4UCDE/duaVawiRk/QqaWsMe3y0BT0zwmYOZOeWDj2c2LCbh2TQvFddZFl7R9opfcmbi5wKe1fgbRRHmj4+pZ1y35czunC6SILoJFf96SSt3sm2o4K55iVutZVZ7I3lkBrM4/w==').then(str => console.log(str))

// decrypt('iGrb0F4hCzASNOO1afcyJWUt29wybsusN8K6ZkdcDTGbiJdaNrVQvRGKjx7VE90dR2lpERR7xAYS9r4dkWegvGS6y4GE7ubfAipj0/ZEZuu7jbnC7BaI2O3xqDNDqbE+zVJi/bpnAA895FAeMu96Ubn/3kXVs+EL6aPwo1Vs4xrUYV4KxLbbIslUhWUOy/zvveL6K8efS1LQYJB4dDITO2DrOM+i5K+rky9h9MvJ9kmrbD2EEFLo4oT8zc/rB50X+2k9hpnYx5u32grVVRx/LWCSp6ei8tR63RYp5i2ALmwUyFnbnEDevR7HCb/4IunpkGuntABuBBAcjKtmYtvfVQ==').then(str => console.log(str))

async function pagination({
  model,// 必须：你要查哪个表？(Article, Comment...)
  query,// 必须：查询条件是什么？(只看某个分类，或者搜素关键词)
  options,// 可选：筛选返回字段（比如只要 title，不要 content）
  populate = {},// 可选：关联查询配置（就是 POPULATE_MAP 里的东西）
  /* 
  Mongoose（以及 mongoose-sex-page）的 .populate() 一共只支持 2 种数据结构：
  第一种：传 单个对象（只关联 1 个字段）
  .populate({
    path: "author",
    select: "nikname avatar"
  })

  第二种：传 数组 [ ]（同时关联多个字段）
  .populate([
    { path: "author", select: "..." },
    { path: "column", select: "..." },
    { path: "comments", select: "...", populate: {...} }
  ])
    
  */
  size,// 必须：每页几条数据？
  page,// 必须：第几页？
  dis,// 可选：前端分页栏显示几个页码（UI用）
  sort// 可选：排序规则
}) {
  // 第一步：保险处理 query（防止它还是字符串）
  if (typeof query === 'string') {
    query = qs.parse(query)//转换为对象
    // console.log(query)
  }
  // 第二步：处理排序
  // 如果传了 sort 就用，没传就默认按 date 倒序（最新的在最前）
  const sortOption = sort || { date: -1 } // -1 表示降序，1 表示升序

  let result = await mongoPage(model)// 1. 先把模型传进去
    .find(query)// 2. 设置查询条件
    .populate(populate)// 3. 设置关联查询（把作者信息查出来）
    .select(options)// 4. 设置字段筛选
    .sort(sortOption)// 5. 设置排序
    .size(size)// 6. 设置每页条数
    .page(page)// 7. 设置第几页
    .display(dis)// 8. 设置分页栏显示数字个数
    .exec()// 9. 执行查询

  // 第四步：解构返回结果，整理成前端喜欢的格式
  let {
    total,// 数据库里总共有多少条数据
    records: list,// 当前页的数据列表（这个库把数据放在 records 里，我们把它改名成 list）
    pages,// 总共有多少页
    display// 回传 display
  } = result

  let count = list.length// 当前页实际有几条数据

  // 第五步：返回整理好的对象
  return { count, page, size, total, list, pages, display }

  /* 
  这个函数返回给前端的数据长什么样？
  {
    count: 10,      // 当前页这一页有 10 条
    page: 2,        // 当前是第 2 页
    size: 10,       // 每页要求 10 条
    total: 100,     // 数据库里总共有 100 条
    list: [...],    // 这 10 条文章的具体数组
    pages: 10,      // 总共 10 页
    display: 8      // 前端分页组件显示 8 个页码按钮
  }
  
  */
}
/* // 手动实现分页函数（兼容高版本 Mongoose）
async function pagination ({ model, query, options, size, page, dis }) {
  // 1. 处理参数默认值，避免非法值
  const pageNum = Math.max(1, Number(page)) // 页码最小为 1
  const pageSize = Math.max(1, Number(size)) // 每页条数最小为 1
  const skipNum = (pageNum - 1) * pageSize // 计算需要跳过的条目数（第1页跳过 0 条，第2页跳过 size 条...）

  try {
    // 2. 并行查询：同时获取当前页数据和总条数（提升效率）
    const [list, total] = await Promise.all([
      // 查询当前页数据：find(筛选条件) -> select(字段筛选) -> skip(跳过条目) -> limit(每页条数)
      model.find(query).select(options).skip(skipNum).limit(pageSize).exec(),
      // 查询符合条件的总条数（替代废弃的 count()）
      model.countDocuments(query).exec()
    ])

    // 3. 计算总页数
    const pages = Math.ceil(total / pageSize)

    // 4. 构造返回结果（保持和原来一致的格式，避免前端需要修改）
    return {
      count: list.length, // 当前页实际条目数
      page: pageNum, // 当前页码
      size: pageSize, // 每页预期要返回的条目数
      total: total, // 总条目数
      list: list, // 当前页数据列表
      pages: pages, // 总页数
      display: dis // 分页栏显示页码数量（回传参数，不影响逻辑）
    }
  } catch (err) {
    // 抛出错误，让上层路由的 try/catch 捕获
    throw new Error(`分页查询失败：${err.message}`)
  }
} */

function toDouble(num) {
  return String(num)[1] && String(num) || '0' + num;
}

function formatDate(date = new Date(), format = "yyyy-MM-dd hh:mm:ss") {

  let regMap = {
    'y': date.getFullYear(),
    'M': toDouble(date.getMonth() + 1),
    'd': toDouble(date.getDate()),
    'h': toDouble(date.getHours()),
    'm': toDouble(date.getMinutes()),
    's': toDouble(date.getSeconds()),
  }

  //逻辑(正则替换 对应位置替换对应值) 数据(日期验证字符 对应值) 分离
  return Object.entries(regMap).reduce((acc, [reg, value]) => {
    return acc.replace(new RegExp(`${reg}+`, 'g'), value);
  }, format);
}
module.exports = {
  encrypt, decrypt, generateKeys, pagination, formatDate
}
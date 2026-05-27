/*
 * @Author: 
 * @Date: 2026-01-27 18:53:49
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-17 22:41:43
 * @Description: 
 * @FilePath: \express-sign\routes\bus.js
 */
const express = require('express')
const router = express.Router()
const createError = require('http-errors')
const { pagination } = require('../core/util/util')
const POPULATE_MAP = require('../plugins/POPULATE_MAP')
const POP_POST_MAP = require('../plugins/POP_POST_MAP')
const POP_GET_MAP = require('../plugins/POP_GET_MAP')
const POP_PUT_MAP = require('../plugins/POP_PUT_MAP')
const RESOURCE_POST_MAP = require('../plugins/RESOURCE_POST_MAP')
const User = require('../models/User')
const Article = require('../models/Article')
const Column = require('../models/Column')
const Comment = require('../models/Comment')
const assert = require('http-assert')
const qs = require('qs')
// /api/rest/:resource?query 
// /api/rest/users?query  users => User
// /api/rest/articles?query  articles => Article


//创建资源
router.post('/', async (req, res, next) => {

  //通用化的资源创建接口，不仅能创建 Article、Comment 等模型的数据，还能自动根据 POP_POST_MAP 的配置，更新对应父资源的关联 ID 集合，保障双向关联的数据一致性。
  try {
    //步骤 1: 准备工作 - 拿到当前是在操作哪个模型（是 Article? 还是 Comment?）
    //步骤 2: 预处理请求体 - 比如创建文章时，自动加上作者ID，不用前端传
    //步骤 3: 核心操作 - 把数据存入数据库
    //步骤 4: 联动更新 - 比如创建完评论，自动去把文章的评论数+1
    //步骤 5: 返回结果给前端

    // 1. 获取模型名称 (比如 "Article", "Comment")
    // req.Model 是在中间件 resource.js 里挂载上去的
    // 比如访问 /api/rest/articles，req.Model 就是 Article 模型
    let modelName = req.Model.modelName// req.Model.modelName：mongoose 模型自带的属性，返回模型的名称（和数据库集合名对应，首字母大写）

    let body = req.body

    // 2. 【关键】预处理请求体
    // 检查 RESOURCE_POST_MAP 里有没有针对这个模型的特殊处理
    if (modelName in RESOURCE_POST_MAP) {
      // 如果有，就执行那个函数，加工一下 body
      // 比如创建 Article 时，这里会自动把当前登录用户的 ID 塞给 author 字段
      body = RESOURCE_POST_MAP[modelName]['body'](body, req._id)
    }


    // 3. 把处理好的数据存入数据库
    // result 就是数据库刚创建出来的那条完整数据（包含自动生成的 _id）
    const result = await req.Model.create(body)
    /* 
    这一步发生了什么？
      Mongoose 去连接 MongoDB。
      在对应的集合（Collection，比如 articles）里插入一条新记录。
      返回的 result 长这样 
      {
        _id: ObjectId("新生成的文章ID"),
        title: "今天学了Mongoose",
        author: ObjectId("用户ID"),
        ... // 其他字段
      }
    */

    // console.log("req.Model.modelName", req.Model.modelName)

    //创建完子资源，自动去更新父资源
    // 4. 检查是否需要联动更新父表
    if (modelName in POP_POST_MAP) {
      let item = POP_POST_MAP[modelName]
      let { _refId, _model, queryAct, options } = item
      let _id = result._id//刚创建的这条数据的 ID (比如新评论的 ID)
      let refId = result?.[_refId]//这条数据关联的父级 ID (比如评论里的 aid -> 文章 ID)
      assert(refId, 422, `${_refId} 必填`)// 校验父级ID必须存在
/* 
等价于手写：

if (!refId) {
  throw createError(400, "无权修改")
}
*/
      //举例 创建Comment时 await Article.findByIdAndUpdate(aid, { $push: { comments: 新评论 _id } })
      await _model[queryAct](refId, options(_id))
    }
    res.send(200, {
      message: '提交成功',
      data: {
        id: result._id//返回创建成功的资源id
      }
    })
  } catch (err) {
    next(err || createError(400, '添加失败'))
  }
})

//更新资源
//这一步是针对修改操作的专属业务校验 只在 put接口内执行，核心是验证当前登录用户 有没有权限修改这个资源
// /api/rest/:resource/:id?queryString...
router.put('/:id', async (req, res, next) => {
  // 步骤 1: 准备工作 - 拿数据、拿身份
  // 步骤 2: 第一层校验 - 这个模型允不允许通过通用接口改？我登录了吗？
  // 步骤 3: 检查资源 - 要改的那个东西在数据库里存在吗？
  // 步骤 4: 第二层校验 (核心) - 这东西是我写的吗？
  // 步骤 5: 过滤字段 - 只允许改标题、内容，不允许改作者
  // 步骤 6: 执行更新 & 返回

  let putData = req.body// 前端发来的要修改的数据（比如 { title: "新标题" }）
  let modelName = req.Model.modelName//模型名称
  let id = req.params.id //要修改的那篇文章的 ID (从 URL 里拿)
  let isPass = req.isPass //Token 校验通过了吗(true=Token校验通过)
  let userId = req._id // 当前登录用户的 ID (从 Token 里解析出来的)

  try {
    // 2. 第一层校验
    //校验条件1.该模型在可修改配置POP_PUT_MAP中 2.Token鉴权通过 isPass=true
    let isValidate = (modelName in POP_PUT_MAP) && isPass
    assert(isValidate, 400, "无权修改")// 只要有一个不满足，直接报错
    // 3. 先去数据库把这条旧数据查出来
    let data = await req.Model.findById(id)
    assert(data, 404, "资源不存在")

    // 4. 【核心鉴权】取出配置
    // revisable: 哪些字段允许改
    // authField: 这条数据里，哪个字段存的是“作者的用户 ID”？
    let { revisable, authField } = POP_PUT_MAP[modelName]
    // 比对
    // userId: 当前登录的我 (从 Token 来)
    // data[authField]: 数据库里这篇文章的作者 ID
    assert.equal(userId, data?.[authField], 400, '无权修改')//将token中此用户的id与数据库中的要修改的资源所属用户的id进行对比 防止合法用户修改别人的资源

    // 5. 字段过滤
    //校验通过，执行实际修改操作
    //只能修改revisable中包含的可修改的字段
    let updateData = Object.entries(putData).filter(([key, value]) => {
      return revisable.includes(key)//过滤出请求体中在revisable中包含的可修改的字段
    })

    //过滤之后检查updateData.length是否等于0
    isValidate = updateData.length !== 0
    assert(isValidate, 400, '修改失败')

    updateData = Object.fromEntries(updateData)//重新将数组转换为对象

    //【附加操作】自动更新最后修改时间
    updateData['date'] = new Date().toISOString()//给updateData添加date字段.值为最新时间,为了之后修改数据库中数据的最后更新时间
    await req.Model.findByIdAndUpdate(id, updateData)
    /* 
     Mongoose 内部偷偷处理成了这样：
      {
        $set: {
          title: "新标题",
          content: "新内容",
          date: "..."
        }
      }
    既然 Mongoose 这么智能，为什么我们在 POP_POST_MAP.js 里必须手动写 $push 和 $inc 呢？
    原因：因为 $set 只能做 “覆盖 / 更新”，做不了 “数组追加”、“数字自增” 这种特殊操作。
    */
    res.send(200, {
      message: '修改成功'
    })
  } catch (err) {
    next(err)
  }
})

//删除资源
router.delete('/:id', async (req, res) => {
  await req.Model.findByIdAndDelete(req.params.id)
  res.send({
    errMsg: 'ok'
  })
})

//查询资源列表
router.get('/', async (req, res, next) => {
  // 步骤 1: 接收前端传来的各种参数（第几页、每页几条、搜索关键词、筛选条件）
  // 步骤 2: 【核心逻辑】构建数据库查询条件（既要分类筛选，又要关键词搜索）
  // 步骤 3: 检查是否需要关联查询（populate）
  // 步骤 4: 执行分页查询并返回
  let modelName = req.Model.modelName

  // 1. 接收参数
  // 从 URL 问号后面拿参数，例如：/api/rest/articles?page=1&size=10&column=xxx&q=关键词
  let {
    options = {}, // 筛选返回字段（一般不用）
    page = 1, // 第几页，默认第1页
    size = 100, // 每页几条，默认100条
    query = {}, // 筛选条件（比如只看某个分类的文章）
    dis = 8 // 分页栏显示几个页码（前端UI用的）
  } = req.query

  // 2. 处理 query 参数
  // 兼容空字符串 query，避免解析成 {column: ""}
  if (typeof query === 'string') {
    if (query.trim() === "") {
      query = {} // 空字符串直接转为空对象
    } else {
      query = qs.parse(query)//将查询字符串解析为对象
    }
  }
  // 保存原始的筛选条件（比如 { column: "某个分类ID" }）
  let finalQuery = { ...query }
  // 检查有没有搜索关键词 q
  if (finalQuery.q) {
    // 构建正则表达式，i 表示忽略大小写
    let regexp = new RegExp(finalQuery.q, 'i')

    // 构建搜索条件：标题 或者 内容 包含关键词
    const searchCondition = {
      $or: [
        { title: { $regex: regexp } },
        { content: { $regex: regexp } }
      ]
    }
    // 把 q 从条件里删掉，避免干扰
    delete finalQuery.q

    // 用 $and 合并 原始条件（column）+ 搜索条件（$or）
    // 意思是：既要满足分类，又要满足 标题或内容含 关键词
    finalQuery = {
      $and: [
        finalQuery,
        searchCondition
      ]
    }
  }

  try {
    // 3. 检查是否需要关联查询（比如查文章时，顺便把作者信息查出来）
    if (modelName in POPULATE_MAP) {
      populate = POPULATE_MAP[modelName]
    }

    // 4. 执行分页查询
    // 调用 util.js 里封装好的 pagination 函数
    let result = await pagination({
      model: req.Model,
      query: finalQuery,// 刚才构建的查询条件
      options,
      populate,// 关联配置
      size,// 每页几条
      page,// 第几页
      dis,
      sort: { 'date': -1 }//排序：按日期倒序（最新的在最前面）
    })
    res.send(200, {
      message: "ok",
      data: result
    })
  } catch (err) {
    console.log(err)
    next(createError(422, "获取失败"))
  }

  // const items = await req.Model.find().setOptions(queryOptions)
  // res.send(200, { message: 'ok', data: { count: items.length, list: items } })
})

//查询资源详情
router.get('/:id', async (req, res) => {
  console.log(req.Model)
  let modelName = req.Model.modelName
  let _id = req.params.id

  try {
    // 第一步：查数据 
    let querys = req.Model.findById(req.params.id)
    if (modelName in POPULATE_MAP) {
      // 如果有关联配置，就 populate（把作者、评论查出来）
      let populates = POPULATE_MAP[modelName]
      const result = await querys.populate(populates).exec()
      res.send(200, {
        message: '查询成功',
        data: result
      })
    }

    // 第二步：偷偷更新点击量 
    //查询资源详情的联动操作
    if (modelName in POP_GET_MAP) {
      let { queryAct, options } = POP_GET_MAP[modelName]
      //动态调用方法：相当于 Article.findByIdAndUpdate(id, { $inc: { hit_num: 1 } })
      await req.Model[queryAct](_id, options())
    }
  } catch (err) {
    console.log(err)
  }

})

module.exports = router
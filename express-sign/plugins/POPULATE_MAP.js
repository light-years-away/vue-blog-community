/*
 * @Author: 
 * @Date: 2026-02-02 18:39:20
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-08 16:36:26
 * @Description: 
 * @FilePath: \express-sign\plugins\POPULATE_MAP.js
 */
module.exports = {
  "Article": [
    // 第一个关联：查作者
    {
      "path": "author",//Article需要关联的字段名
      "select": "nikname avatar"//返回的目标表的字段
    },
    // 第二个关联：查分类
    {
      "path": "column",
      "select": "name"
    },
    // 第三个关联：查评论
    {
      "path": "comments",
      "select": "content date uid",
      "options": {//查询关联数据时的附加设置。
        /* 
        常用子项:
        sort: 排序（{ date: -1 } 表示最新的在最前面）。
        limit: 限制数量（比如只查 10 条评论）。
        skip: 跳过数量。
        */
        sort: { 'date': -1 }
      }, //评论排序
      "populate": {//二次关联  理论上可以无限嵌套 不建议超过 3 层
        "path": "uid",
        "select": "nikname avatar"
      }
    }
  ],
  "Comment": [
    {
      "path": "uid",
      "select": "nikname avatar"
    }
  ],
  "Column": [
    {
      "path": "aids",
      "select": "title cover date hit_num comment_num like_num author"
    }
  ]
}

/* 
// 完整的 populate 配置语法
.populate({
  path: 'comments',          // 关联字段名
  select: 'content date uid', // 选择返回的字段
  match: { status: 'active' }, // 条件筛选
  options: { 
    sort: { date: -1 },      // 排序
    limit: 10,               // 限制数量
    skip: 0                  // 跳过数量
  },
  populate: {                // 嵌套 populate
    path: 'uid',
    select: 'nikname avatar'
  }
})

*/
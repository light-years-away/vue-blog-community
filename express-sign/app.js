/*
 * @Author: 
 * @Date: 2025-12-09 14:24:49
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-16 22:06:42
 * @Description: 
 * @FilePath: \付浩哲_vue第四十天_20260407\express-sign\app.js
 */
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
const mongoose = require('./plugins/db')//引入就会执行模块中的代码
const { maxFileSize } = require('./config')
const { expressjwt } = require('express-jwt')
const { getPublicKeySync } = require('./core/rsaControl')
const User = require('./models/User')
require('./socket')
/* 
测试
columns 69820887f1b811edc1bad2cf
users 698202d7a1710614a15912f6
      69833b231772a659a03b940b

articles 69820a4449d531bc216c1e56
comments 69820b15b70d9be4ffeb38d0

token  eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMTIzIiwiX2lkIjoiNjk4MjAyZDdhMTcxMDYxNGExNTkxMmY2IiwiZXhwIjoxNzcwMzg3Mjg3LCJpYXQiOjE3NzAxMjgwODd9.S9ozhWZPtC_0_zJDyYGZqVnp-DCcveiKHlR-Ov3APmvPVqY7WciyWbFjNiPUO0NfRjyl41_C00v9MOgHhzBAfcBEAwtNbpXZvz7qCHZdLhk0ljmaNF3RIwQS8dQloNC_KBToXAFx9ASg2a0u-1bGvxQ77RAHd3cLGbsLWrdcXDp45Hrj7v3iPk_8djQ0lx_hKPOE7_U09Qko8InWa-yVC72GJzkEaY_AJ2kM34R1_udTkKpStrULUcmxjrMoEMQa9dMXkKZIo1GRfcLlrK7HQcNm23KndQXh52XSiUP5LMYGfGfwpF3zESpPJq8O9SWacWsSHSBL_AGBhxdOrnc85Q



eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFkbWluMTIzIiwiX2lkIjoiNjk4MzNiMjMxNzcyYTY1OWEwM2I5NDBiIiwiZXhwIjoxNzcwNDY3MjM1LCJpYXQiOjE3NzAyMDgwMzV9.D1iX3O7V3v3GKVR07Q1mlIw3dRjZ6XWtkm9KNKq0SeKEZYlvnTSPa2U8dqi34e39-nt1rBkXP59inZmVhiUVo-SxNHU7efiyLcPkGF3t_tOEFyIQwlnvZcL2xJ9tzO-14zZ1vGscSvdRfilVUXiAN7Htonl9kInsB9RnJpdq2FAouYkWuJuICamENOgIDGSOTCnXs0ex0CM1K286FlWuHTKEusi4Nb_4ByjXeb91nHAAUZKdO1hsMaC8GF0-rCaFYuI0pPKvN6E5p93DMwhRUi95_vx4v62pqgjcJknTkU21_DnvLsh9emGPQvgrbAvsEzg9HzGv8WU1FXJ0YzR13A

*/
// const indexRouter = require('./routes/index');
// const registerRouter = require('./routes/register');
// const loginRouter = require('./routes/login');
// const getPublicKey = require('./routes/getPubKey');
const app = express();
app.use(cors({
  "origin": true, //true 设置为 req.origin.url
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE", //容许跨域的请求方式
  "allowedHeaders": "x-requested-with,Authorization,token, content-type", //跨域请求头
  "preflightContinue": false, // 是否通过next() 传递options请求 给后续中间件 
  "maxAge": 1728000, //options预验结果缓存时间 20天
  "credentials": true, //携带cookie跨域
  "optionsSuccessStatus": 200 //options 请求返回状态码
}))

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');

app.use(logger('dev'));

//这两个中间件把这段二进制读出来 → 解析成 JS 对象 → 挂到 req.body 上
app.use(express.json());// 解析 JSON 格式的请求体
app.use(express.urlencoded({ extended: false })); // 解析表单格式的请求体

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));//查找文件时会从这里配置的默认静态文件地址中寻找http://127.0.0.1:3000/article/DongJing_1769929827527.jpg


//中间件  nameMiddleware
const resourceMiddleware = require('./middleware/resource')

//路由  nameRoute
const busRoute = require('./routes/bus');
const adminRoute = require('./routes/admin');
const pubKeyRoute = require('./routes/getPubKey')
const uploadRoute = require('./routes/upload')
const searchRoute = require('./routes/search')
const artLikesRoute = require('./routes/artLikes')
const userRoute = require('./routes/user')
//所有需要鉴权的接口 都会先走Token 全局校验
//这一步只验证用户是不是 合法登录用户 不验证 用户能不能修改这篇文章
app.use(expressjwt({
  secret: getPublicKeySync(), //解密秘钥 
  algorithms: ["RS256"], //6.0.0以上版本必须设置解密算法 
  isRevoked: async (req, payload) => {
    // console.log()
    let { _id } = payload.payload
    req._id = _id //  先假设用户存在，把 _id 挂上去
    req.isPass = true// 先假设放行

    try {
      let result = await User.findById(_id)// 去数据库查，验证用户是否真的存在
      console.log(result)
      if (!result) {
        req.isPass = false
      }

      // 直接返回布尔值：true=Token吊销（用户不存在），false=Token有效
      return !result;
    } catch (err) {
      // 异常时返回 true（标记Token吊销）
      return true;
    }
  }
}).unless({//这些请求会跳过express-jwt的Token解密、校验逻辑 直接进入后续中间件或接口
  path: [
    { url: /\/api\/rest/, methods: ['GET'] },
    { url: '/api/rest/keys', methods: ['GET'] },
    { url: '/admin/login' },
    { url: '/admin/register' },
    { url: '/keys' },
    { url: '/articles/search' },
    // { url: '/articles/likes' },//点赞接口必须带 token
  ]
}))

app.use('/api/rest/:resource', resourceMiddleware(), busRoute)

//登录注册
app.use('/admin', adminRoute)
//用户信息
app.use('/user', userRoute)
app.use('/index', (req, res, next) => {
  if (req.isPass) {
    res.send(200, {
      message: 'ok'
    })
  } else {
    res.send(401, {
      message: '请先登录'
    })
  }

})

//获取公钥
app.use('/keys', pubKeyRoute)

//文件上传
app.use('/upload', uploadRoute)

//文章搜索
// app.use('/articles/search', searchRoute)

//文章点赞
app.use('/articles/likes', artLikesRoute)
// app.use('/login', loginRouter);
// app.use('/user', indexRouter);
// app.use('/register', registerRouter);
// app.use('/getPublicKey', getPublicKey);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

const ERROR_CODE_MAP = {
  'LIMIT_FILE_SIZE': `文件大小不得超过 ${maxFileSize} bytes`//文件大小错误处理
}
const ERROR_STATUS_MAP = {
  '401': "无权限操作,请先登录"
}

const QUE_MAP = {
  "username": "用户名",
  "password": "密码",
  "email": "邮箱",
  "nikname": "昵称",
  "avatar": "头像",
  "name": "分类名称",
  "nikname": "昵称"
}

// error handler Express 靠参数个数来区分普通中间件和错误处理中间件
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page


  //处理唯一索引冲突错误（用户名 / 邮箱重复，因为模型中 username、email 配置了 unique: true）
  if (err.message.indexOf('duplicate key error') !== -1) {
    let repeatKey = Object.entries(err.keyPattern)?.map(([key, value]) => {
      return `${QUE_MAP?.[key]}不能重复`
    })[0]
    err.status = 422
    err.message = repeatKey
  }

  //处理Mongoose 模型校验错误（用户名格式不对、密码必填、邮箱格式非法等，对应模型中 required、validate 配置的规则）
  if (err.errors) {
    let paramErrors = Object.entries(err.errors).map(([key, val]) => {
      return `${val.message} `
    }).join(',')
    // .reduce((acc, curr) => {
    //   acc += curr
    //   return acc
    // }, "")
    err.status = 422
    err.message = paramErrors
  }

  if (err.code in ERROR_CODE_MAP) {
    err.status = 422
    err.message = ERROR_CODE_MAP[err.code]
  }
  if (err.status in ERROR_STATUS_MAP) {
    err.message = ERROR_STATUS_MAP[err.status]
  }
  res.status(err.status || 500).send({
    code: err.status,
    message: err.message
  });
  // res.render('error');
});


/* app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    // 打印具体的 401 原因
    console.log('401 原因：', err.message, err.inner?.message);
    res.status(401).json({ statusCode: 401, errMsg: 'Token 验证失败' });
  }
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
 */
module.exports = app;

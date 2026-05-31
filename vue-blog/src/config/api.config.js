/*
 * @Author: 
 * @Date: 2026-03-14 15:59:00
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-25 14:16:47
 * @Description: 
 * @FilePath: \vue-blog\src\config\api.config.js
 */
export default {
  'index': {
    url: '/index',
    method: 'GET',
    noMessage: true,
  },
  'register': {
    url: 'admin/register',
    method: 'POST',
    rsaKey: 'password',//表单中需要加密的键(name)
    setToken: true
  },
  'login': {
    url: 'admin/login',
    method: 'POST',
    rsaKey: 'password',//表单中需要加密的键(name)
    setToken: true
  },
  'pubKey': {
    url: '/keys',
    method: 'GET'
  },
  'captcha': {
    url: '/captcha',
    method: 'GET',
    noMessage: true  // 静默请求，失败了不弹错误提示
  },
  'articles': {
    url: '/api/rest/articles',
    method: 'GET'
  },
  'postArticle': {
    url: '/api/rest/articles',
    method: 'POST'
  },
  'getArticleById': {
    rest: true,
    url: '/api/rest/articles/:id',
    method: 'GET'
  },
  'columns': {
    url: '/api/rest/columns',
    method: 'GET'
  },
  'postColumn': {
    url: '/api/rest/columns',
    method: 'POST'
  },
  'postComment': {
    url: '/api/rest/comments',
    method: 'POST'
  },
  'getUserInfo': {
    url: '/user',
    method: 'GET',
  },
  'putUserInfo': {
    url: '/user',
    method: 'PUT',
  },
  'articleLikes': {
    url: '/articles/likes/:id',
    method: 'POST',
    rest: true
  }
}
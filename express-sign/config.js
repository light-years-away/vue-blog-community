/*
 * @Author: 
 * @Date: 2026-02-01 11:43:51
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-02-04 21:49:06
 * @Description: 
 * @FilePath: \付浩哲_Node第五十一天_20260204\express-sign\config.js
 */
const path = require("path")
/* 
	            __dirname	                  process.cwd()
参照物	  当前源文件所在的目录	         执行 node 命令时所在的目录（工作目录）
会不会变	文件写在哪就是哪，永远不变	  从哪个目录启动项目就是哪个，会变


*/
module.exports = {
  host: '127.0.0.1',
  root: __dirname,
  port: 3000,
  keyPath: path.join(__dirname, '/auth'),
  pubKeyPath: path.join(__dirname, '/auth/public.cer'),
  priKeyPath: path.join(__dirname, '/auth/private.cer'),
  userPath: path.join(__dirname, '/user/user.json'),
  uploadPath: path.join(__dirname, '/uploads'),
  uploadURL: 'http://127.0.0.1:3000/',
  maxFileSize: 20 * 1024 * 1024  // 20 MB
}

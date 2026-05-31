/*
 * @Author: 
 * @Date: 2026-03-12 21:20:29
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-05 18:26:36
 * @Description: 
 * @FilePath: \vue-blog\src\config\validate.config.js
 */
export default {
  username: [
    {
      required: true,//必填
      message: '账号必填',
      trigger: ['blur', 'submit']
    },
    {
      pattern: /^(?!\d+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,8}$/,
      message: '账号格式 数字+字母 6-8位', trigger: ['blur', 'submit']
    }],//失焦 + 提交都校验 trigger: 'blur' 表示失焦触发
  email: [
    {
      required: true,
      message: '邮箱必填',
      trigger: ['blur', 'submit']
    },
    {
      pattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
      message: '请输入正确的邮箱格式',
      trigger: ['blur', 'submit']
    }],
  password: [
    {
      required: true,
      message: '密码必填',
      trigger: ['blur', 'submit']
    },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!.#*?&]{8,12}$/,
      message: '密码格式 至少包含大写字母+小写字母+数字 8-12位',
      trigger: ['blur', 'submit']
    }],
  name: [
    {
      required: true,
      message: '名称必填',
      trigger: ['blur', 'submit']
    }],
  captcha: [
    {
      required: true,
      message: '验证码必填',
      trigger: ['blur', 'submit']
    }],
  nikname: [
    {
      required: true,
      message: '昵称必填',
      trigger: ['blur', 'submit']
    },
    {
      pattern: /^[0-9a-zA-Z\u0391-\uFFE5]{1,8}$/,
      message: '昵称可包含 数字/英文/汉字 1-8位',
      trigger: ['blur', 'submit']
    }]

}
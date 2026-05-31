/*
 * 验证码临时存储
 * 用 Map 存 { key: { answer, expires } }，带 TTL 自动过期清理
 *
 * 为什么不用数据库：
 * 验证码是临时数据，用一次就删，几分钟后就失效。
 * 存数据库反而浪费 I/O，进内存足矣。
 * 多机部署时需换成 Redis，保证不同服务器拿到同一份验证码。
 */
const store = new Map()

// 每 60 秒清理一次过期验证码
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of store) {
    if (val.expires < now) store.delete(key)
  }
}, 60 * 1000)

module.exports = {
  // 保存验证码答案，返回唯一 key
  set(answer, ttl = 5 * 60 * 1000) {
    const key = Math.random().toString(36).slice(2) + Date.now().toString(36)
    store.set(key, { answer, expires: Date.now() + ttl })//expires 验证码设一个过期时间戳
    return key
  },

  // 校验验证码。一次性消费——校验完就删，防止同一个验证码重复用
  verify(key, answer) {
    const val = store.get(key)
    if (!val) return false           // key 不存在或已过期
    store.delete(key)                // 用完即删
    if (val.expires < Date.now()) return false
    return val.answer.toLowerCase() === answer.toLowerCase()  // 忽略大小写
  }
}

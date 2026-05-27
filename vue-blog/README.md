# 博客社区平台

基于 Vue 3 全栈开发的个人博客社区系统，PC 端与移动端双端自适应，支持文章发布、评论互动、实时聊天、文件上传等完整功能。

## 技术栈

**前端**
- Vue 3（Composition API + `<script setup>`）
- Pinia 状态管理 + Vue Router 4（Hash 模式）
- Element Plus（PC 端）+ Vant 4（移动端）
- Axios（统一封装：动态路由参数替换、Token 自动携带、RSA 密码加密）
- Socket.IO Client（全局 WebSocket 实时通信）
- Vite 5（代码分割、CDN 加速、Gzip 压缩、打包可视化分析）
- Stylus 预处理器

**后端**（[express-sign](../express-sign/)）
- Node.js + Express + MongoDB + Mongoose
- JWT + RSA（RS256）非对称加密鉴权
- Multer 文件上传（20MB 限制）
- Socket.IO 多设备顶号检测与强制下线

## 功能概览

| 模块 | 实现要点 |
|------|---------|
| 用户注册/登录 | RSA 公钥加密传输密码，JWT Token 自动签发与续期 |
| 双端自适应 | userAgent 检测自动切换 PC/移动端路由，独立组件适配 |
| 文章发布/编辑 | 富文本编辑器（WangEditor）、分类栏目选择、封面图上传 |
| 文章列表 | 分类筛选、分页懒加载、keep-alive 缓存 + 滚动位置恢复 |
| 文章详情 | Markdown 渲染 + 代码高亮、点击量统计、评论列表 |
| 评论系统 | 文章评论增删、双向关联（文章 ⇄ 评论）自动维护 |
| 文章点赞 | $addToSet/$pull 原子切换、like_num 实时更新 |
| 文件上传 | 用户头像 + 文章图片分目录存储、Multer 动态分类 |
| 实时聊天 | 登录自动建立全局 Socket、顶号检测强制下线提示 |
| 全文搜索 | 标题 + 内容正则检索，支持分页 |
| 个人中心 | 昵称/头像/签名修改、昵称唯一性校验 |
| Live2D 看板娘 | 页面宠物挂件，提升交互趣味性 |

## 快速开始

### 环境
- Node.js ≥ 18
- MongoDB ≥ 6.0

```bash
# 1. 启动后端（另开终端）
cd ../express-sign
npm install
npm start          # http://localhost:3000

# 2. 启动前端
npm install
npm run dev        # http://localhost:5173

# 3. 构建生产版本
npm run build
```

## 项目结构

```
src/
├── views/              # 页面组件
│   ├── Home.vue        # 主框架（Header + Aside + keep-alive 路由）
│   ├── ArticleList.vue # 文章列表（分页懒加载）
│   ├── Article.vue     # 文章详情
│   ├── Editor.vue      # 文章编辑器
│   ├── User.vue        # 个人中心
│   └── Socket.vue      # 实时聊天室
├── components/         # 通用组件
│   ├── base/           # BaseHeader / BaseAside / BaseModal / BaseForm
│   ├── article/        # ArticleItem / ArticleContent / ArticleBarInfo
│   ├── comment/        # CommentList / CommentItem / CommentTextArea
│   └── user/           # UserImgAvatar / UserLoginHead
├── mviews/             # 移动端页面
├── mcomponents/        # 移动端组件
├── router/             # 路由配置 + 全局守卫（鉴权 + 设备检测）
├── stores/             # Pinia Store（user / modal / likes）
├── api/                # Axios 封装（拦截器 + RESTful 动态路由 + RSA 加密）
├── config/             # API 映射 / 表单规则 / 模态框 / 悬浮菜单
└── util/               # 工具函数（加密 / 日期格式化 / 事件总线）
```

## 核心设计

**统一 HTTP 层** — 基于 Axios 二次封装，支持：
- RESTful 动态路由参数替换（`:id` → 实际值）
- JWT Token 请求头自动注入
- RSA 公钥密码字段自动加密
- 统一错误拦截 + ElementPlus 通知

**通用化后端路由** — `/api/rest/:resource` 单一路由覆盖所有 CRUD：
- 中间件自动注入 Mongoose 模型
- 关联映射配置（POPULATE_MAP / POP_POST_MAP / POP_PUT_MAP）
- 双向关联自动维护（创建评论 → 推送至文章评论数组 + 计数自增）
- 修改权限校验（Token 用户 ID ⇄ 资源作者 ID）

**WebSocket 实时通信**：
- 登录成功自动建立全局 Socket 连接
- 多设备顶号检测（同一账号新登录 → 旧设备强制下线提醒）
- 聊天室支持登录用户 + 游客两种模式

## 简历对应项目经历

本项目为简历中「博客社区平台（Vue 3 重构前端）」的核心代码，对应关系：

| 简历描述 | 代码位置 |
|---------|---------|
| PC/移动端双端自适应 | `router/index.js` userAgent 检测 + `mviews/` `mcomponents/` |
| 封装统一 HTTP 层 | `api/http.js` + `api/common.js` |
| Socket.IO 实时通信 + 顶号检测 | `stores/userStore.js` + `views/Socket.vue` |
| keep-alive + 滚动位置恢复 | `views/Home.vue` inject/provide |
| RESTful 统一资源路由 | `express-sign/routes/bus.js` + 中间件 |
| Vite 打包优化 | `vite.config.js` |

## License

MIT

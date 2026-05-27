<template>
  <div class="blog-chat">
    <!-- 游客弹窗 -->
    <el-dialog v-model="showGuestTip" title="游客模式" width="360px" :show-close="false" :close-on-click-modal="false">
      <div style="text-align: center; font-size: 15px">
        你当前未登录，将以临时身份聊天
        <br>
        你的临时昵称：<span style="color:red; font-weight:bold">{{ guestName }}</span>
      </div>
      <template #footer>
        <el-button type="primary" @click="enterGuest">进入聊天室</el-button>
      </template>
    </el-dialog>


    <div class="blog-chat--content" ref="chatContentRef">
      <div class="blog-chat--item" :class="chat.dis" v-for="chat in chatList" :key="chat.time">
        <!-- 系统提示 -->
        <span v-if="chat.type === 'action'" class="system-tip">{{ chat.msg }}</span>

        <!-- 聊天消息 -->
        <template v-else>
          <!-- 头像 -->
          <el-image class="blog-chat-avatar" :src="chat.avatar" v-if="chat.avatar" fit="cover">
            <template #error>
              <!-- 头像加载失败时的默认文字头像 -->
              <div class="avatar-placeholder">{{ chat.nikname?.slice(0, 1) }}</div>
            </template>
          </el-image>

          <!-- 消息内容 -->
          <div class="blog-chat--box">
            <span class="blog-chat--nikname">
              {{ chat.nikname }}
            </span>
            <div class="message-bubble">
              <p class="blog-chat--msg" v-if="chat.msg">{{ chat.msg }}</p>
            </div>
            <span class="blog-chat--time" v-if="chat.time">{{ chat.time }}</span>
          </div>
        </template>
      </div>
    </div>
    <div class="blog-chat--bottom">
      <el-input v-model="sendMsg" placeholder="请输入内容" @keyup.enter="sendChat" clearable></el-input>
      <el-button type="primary" @click="sendChat">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, inject } from 'vue'
import { io } from 'socket.io-client'
import formatDate from '@/util/formatDate'
import { useUserStore } from '@/stores/userStore'
import baseConfig from '@/config/base.config'
const BASE_URL = baseConfig.BASE_URL
// 状态
const sendMsg = ref('')
const chatList = ref([])
let ws = null

// 注入Home的滚动条
const scrollContainerRef = inject('scrollContainerRef')

// 获取用户信息
const userStore = useUserStore()

const showGuestTip = ref(false)
const guestName = ref('')
//组件挂载 连接socket
onMounted(() => {
  // 登录用户：等待全部就绪
  if (userStore.token) {
    //等待 userInfo  userStore.ws加载完成再初始化
    const stopWatch = watch(
      () => [userStore.userInfo?._id, userStore.isWsConnected], // 同时监听两个
      ([userId, connected]) => {
        console.log(userId, connected)
        //connected 是 socket.io 客户端实例自带的布尔属性
        //当socket成功连接服务器 true
        //当socket未连接 / 连接中 / 断开 false
        if (userId && connected) {
          initChat()
        }
      },
      {
        immediate: true,//立刻执行一次回调
        deep: true//Vue 3 监听数组时，默认不会深度监听内部对象的变化 加 deep: true 才能监听内部值变化
      }
    )
    return
  }
  //游客直接初始化

  initChat()
})

//初始化聊天 登录用户 / 游客
function initChat() {

  if (userStore.token && userStore.ws) {//用户
    ws = userStore.ws
    listenMsg()
    return
  }

  //游客
  generateGuestName()
  showGuestTip.value = true
}

// 监听消息
function listenMsg() {
  ws.on('chat', serverChat)
  ws.on('logged', (name) => {//进入聊天室
    serverLog({ nikname: name, isLogin: true })
  })
  ws.on('logout', (name) => {//退出聊天室
    serverLog({ nikname: name, isLogin: false })
  })
}

//生成游客昵称
function generateGuestName() {
  const str = Math.random().toString(36).slice(-8)
  guestName.value = `游客${str}`
}

// 游客进入
function enterGuest() {
  showGuestTip.value = false
  ws = io('ws://127.0.0.1:8888', { transports: ['websocket'] })
  ws.on('connect', () => {
    ws.emit('enterGuest', {
      uid: 'guest_' + Math.random().toString(36).slice(-8) + Date.now(),
      nikname: guestName.value
    })
  })
  listenMsg()
}

// 发送消息
function sendChat() {
  if (!sendMsg.value.trim()) {
    ElMessage({
      message: '发送内容不能为空',
      type: 'error',
    })
    return
  }
  //ws 不存在就不发送
  if (!ws) {
    ElMessage({
      message: '聊天连接未初始化，请稍候…',
      type: 'warning',
    })
    return
  }
  const msg = sendMsg.value
  addChat({
    isMe: true,
    msg,
    nikname: userStore.userInfo.nikname || guestName.value,
    avatar: userStore.userInfo.avatar
  })

  //发给服务端
  ws.emit('send', msg)
  sendMsg.value = ''
}

//添加消息到列表
function addChat({
  type = 'msg',
  msg = '',
  nikname = '',
  time = formatDate(),
  isMe = false,
  avatar
}) {
  let dis = 'left'
  if (type === 'action') {
    dis = 'center'
  }
  if (isMe) {
    dis = 'right'
  }

  chatList.value.push({
    type,
    msg,
    nikname,
    time,
    isMe,
    dis,
    avatar
  })
}



//接收别人的消息
function serverChat(data) {
  addChat(data)
}

//系统提示（进入/离开）
function serverLog({ nikname, isLogin }) {
  const state = isLogin ? '进入' : '离开'
  const msg = `${nikname} ${state}了聊天室`
  addChat({ type: 'action', msg })
}

//监听消息变化，自动滚动到底部
watch(
  chatList,
  async () => {
    await nextTick()
    if (scrollContainerRef?.value?.wrapRef) {
      const el = scrollContainerRef.value.wrapRef

      //平滑滚动到底部
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      })
    }
  },
  { deep: true }
)

//组件销毁时 游客断开socket 登录用户不断开
onBeforeUnmount(() => {
  //只有游客才关闭连接
  if (!userStore.token && ws) {
    ws.emit('logout')
    ws.close()
    ws = null
  }
})
</script>

<style lang="stylus" scoped>
// 主题色配置
$theme-color = #2D2F33
$other-bubble-bg = #fff
$self-bubble-bg = $theme-color
$bg-color = #f1f1f1
$text-main = #333
$text-light = #999
$text-white = #fff
$border-radius = 8px

/* 共用全局滚动条 */
.blog-chat
  position: relative;
  min-height: 100%;
  padding-bottom: 100px;
  width: 100%;
  box-sizing: border-box;
  background-color: $bg-color;
  padding: 10px 0 100px;

/* 消息列表容器 */
.blog-chat--content
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;//给 flex 子元素之间设置间距

/* 消息项基础样式 */
.blog-chat--item
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding: 0 10px;
  gap: 10px;//给 flex 子元素之间设置间距
  // align-items center
  /* 系统提示居中 */
  &.center
    justify-content: center;
    .system-tip
      font-size: 12px;
      color: #fff;
      background-color: rgba(0,0,0,0.25);
      padding: 3px 8px;
      border-radius: 4px;
      line-height: 1.2;

  /* 他人消息靠左 */
  &.left
    justify-content: flex-start;
    flex-direction: row;
    .blog-chat--box
      align-items: flex-start;
// .blog-chat--item.left
//   justify-content flex-start
// .blog-chat--item.right
//   justify-content flex-start
//   flex-direction row-reverse//flex 容器里的子元素，左右颠倒反过来排列
  /* 自己消息靠右 */
  &.right
    justify-content: flex-start
    flex-direction: row-reverse;
    .blog-chat--box
      align-items: flex-end;

/* 头像样式 */
.blog-chat-avatar
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top 20px

/* 头像加载失败默认图 */
.avatar-placeholder
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: $theme-color;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;

/* 消息内容区 */
.blog-chat--box
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;


.blog-chat--nikname
  font-size: 12px;
  color: $text-light;
  padding: 0 6px;

/* 消息气泡 */
.message-bubble
  position: relative;
  padding: 10px 14px;
  border-radius: $border-radius;
  word-break: break-word;
  max-width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);

  /* 他人消息气泡 */
  .left &
    background-color: $other-bubble-bg;
    color: $text-main;
    // 气泡尖角
    &::after
      content: '';
      position: absolute;
      left: -8px;
      top: 10px;
      width: 0;
      height: 0;
      border: 4px solid transparent;
      border-right-color: $other-bubble-bg;

  /* 自己消息气泡 */
  .right &
    background-color: $self-bubble-bg;
    color: $text-white;
    // 气泡尖角
    &::after
      content: '';
      position: absolute;
      right: -8px;
      top: 10px;
      width: 0;
      height: 0;
      border: 4px solid transparent;
      border-left-color: $self-bubble-bg;

/* 消息文字 */
.blog-chat--msg
  margin: 0;
  font-size: 14px;
  line-height: 1.5;

/* 消息时间 */
.blog-chat--time
  font-size: 11px;
  color: $text-light;
  padding: 0 6px;

/* 底部输入框：固定在屏幕底部 */
.blog-chat--bottom 
  position: fixed;
  bottom: 20px;
  // left: 20%
  margin 0 auto
  // transform: translateX(-50%);
  width: 65%;
  min-width 320px
  max-width: 1000px;
  display: flex;
  gap: 12px;
  background: #fff;
  padding: 12px 16px;
  border-radius: $border-radius;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  z-index: 99;
  box-sizing: border-box;

  /* 输入框样式适配 */
  .el-input__wrapper
    box-shadow: 0 0 0 1px #e4e4e4;
    &:focus-within
      box-shadow: 0 0 0 1px $theme-color;

  /* 按钮匹配主题色 */
  .el-button--primary
    background-color: $theme-color;
    border-color: $theme-color;
    padding: 0 20px;
    flex-shrink: 0;
    
    &:hover
      background-color: #3a3c42;
      border-color: #3a3c42;

</style>
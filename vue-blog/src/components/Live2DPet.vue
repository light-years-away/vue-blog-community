<template>
  <!-- 隐藏状态：只显示侧边箭头 -->
  <div v-if="!isShow" class="arrow-trigger" @click="toggleLive2D">
    <div class="arrow-icon">▼</div>
  </div>

  <!-- 显示状态：模型 + 按钮 -->
  <div v-else class="live2d-wrapper">
    <div id="live2d-container"></div>
    <button @click="toggleLive2D" class="toggle-btn">隐藏</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { L2Dwidget } from 'live2d-widget'
import store from 'store'

const isShow = ref(store.get('live2dShow') !== 'false')
let live2dLoaded = false
let checkWidgetInterval = null

// 控制模型父容器的显示隐藏
const setModelVisibility = (visible) => {
  const widget = document.getElementById('live2d-widget')
  if (widget) {
    widget.style.display = visible ? 'block' : 'none'
  }
}

onMounted(() => {
  if (live2dLoaded) return
  live2dLoaded = true

  // 初始化 Live2D
  L2Dwidget.init({
    model: {
      jsonPath: "https://unpkg.com/live2d-widget-model-wanko@1.0.5/assets/wanko.model.json",
      scale: 0.8
    },
    display: {
      position: 'left',
      width: 200,
      height: 200,
      hOffset: -20,
      vOffset: -20
    },
    container: "#live2d-container",
    mobile: { show: true },
    react: { opacity: 0.9 },
    log: true
  })

  // 等待父容器出现后，根据存储状态设置显示/隐藏
  checkWidgetInterval = setInterval(() => {
    const widget = document.getElementById('live2d-widget')
    if (widget) {
      setModelVisibility(isShow.value)
      clearInterval(checkWidgetInterval)
      checkWidgetInterval = null
    }
  }, 100)
})

// 切换显示/隐藏
const toggleLive2D = () => {
  isShow.value = !isShow.value
  store.set('live2dShow', isShow.value)
  setModelVisibility(isShow.value)
}

onBeforeUnmount(() => {
  if (checkWidgetInterval) {
    clearInterval(checkWidgetInterval)
  }
  if (window.L2Dwidget) {
    window.L2Dwidget.destroy()
  }
})
</script>

<style lang="stylus">
.arrow-trigger {
  position: fixed;
  left: 5px;
  bottom: 100px;
  z-index: 99999;
  width: 30px;
  height: 60px;
  background: #2D2F33;
  border-radius: 0 6px 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
}

.arrow-trigger:hover {
  background: #777;
  transform: translateX(2px);
}

.arrow-icon {
  color: #fff;
  font-size: 16px;
  transform: rotate(-90deg);
}

.toggle-btn {
  position: fixed;
  left: 10px;
  bottom: 120px;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: #2D2F33;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #777;
}
</style>
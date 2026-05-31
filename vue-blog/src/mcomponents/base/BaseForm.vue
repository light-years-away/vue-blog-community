<!--
 * @Author: 
 * @Date: 2026-04-03 11:04:57
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-06 16:07:26
 * @Description: 
 * @FilePath: \vue-blog\src\mcomponents\base\BaseForm.vue
-->
<template>
  <van-form ref="formRef">
    <van-cell-group inset>
      <template v-for="item in formData" :key="item.query">
        <!-- 头像上传 -->
        <van-field v-if="item.type === 'avatar'" :label="item.label" :label-width="80" readonly
          class="blog-m-avatar-cell">
          <template #input>
            <!-- avatarFileList 是 Vant Uploader 组件要求绑定的数组 配合 :max-count="1" 实现单图上传 -->
            <van-uploader v-model="avatarFileList" :max-count="1" :before-read="beforeAvatarUpload"
              :after-read="handleAfterRead">
              <van-image width="60" height="60"
                :src="form[item.query] || 'https://fastly.jsdelivr.net/npm/@vant/assets/avatar.png'" />
            </van-uploader>
          </template>
        </van-field>

        <!-- 验证码 -->
        <template v-else-if="item.type === 'captcha'">
          <van-field v-model="form.captcha" :type="'text'" label="" :placeholder="item.placeholder"
            :label-width="80">
            <template #extra>
              <span v-html="captchaSvg" class="captcha-svg-m" @click="refreshCaptcha" title="点击刷新"></span>
            </template>
          </van-field>
        </template>

        <!-- 普通文本/密码输入项 -->
        <van-field v-else v-model="form[item.query]" :type="item.type" :label="item.label" :readonly="item.readonly"
          :placeholder="item.placeholder" :rules="formatRuleTrigger(validates[item.query])" :label-width="80" :required="isRequired(item.query)"/>
      </template>
    </van-cell-group>
  </van-form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore.js'
import FORM_DATA from '@/config/form.config'
import VALIDATE_DATE from '@/config/validate.config'
import { showToast } from 'vant'
import baseConfig from '@/config/base.config.js'
import http from '@/api/http'
//创建 Store 实例
const userStore = useUserStore()
// props
const props = defineProps({
  type: {
    type: String,
    default: ''
  }
})

//表单实例
const form = ref({})
const formRef = ref(null)

// 头像文件列表
const avatarFileList = ref([])

//计算属性
const formData = computed(() => FORM_DATA[props.type] || [])
const validates = computed(() => VALIDATE_DATE)
const userFileAction = computed(() =>
  baseConfig['USER_UPLOAD_PATH']
)

//初始化表单
const initForm = () => {
  form.value = {}
  formRef.value?.resetValidation()
}

//把校验规则的触发方式强制统一改成 '失焦校验'
const formatRuleTrigger = (rules) => {
  if (!rules) return []
  return rules.map(item => {
    item.trigger = 'onBlur'//失焦校验
    return item
  })
}

//头像上传前置校验
const beforeAvatarUpload = (file) => {
  const isImage = /image/.test(file.type)
  const isLt5M = file.size < 5 * 1024 * 1024

  if (!isImage) {
    showToast('请选择图片文件')
    return false
  }
  if (!isLt5M) {
    showToast('文件不得大于5M')
    return false
  }
  return true
}

// 手动触发上传请求 
const handleAfterRead = async (file) => {
  try {
    showToast('上传中...')

    //构建 FormData
    const formData = new FormData()
    formData.append('file', file.file) //注意：Vant这里是 file.file

    //手动发送上传请求
    const res = await fetch(userFileAction.value, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
      },
      body: formData
    })

    const data = await res.json()
    console.log(form.value)
    console.log(data)

    //适配后端返回格式
    if (data.data?.fileURL) {
      form.value.avatar = data.data?.fileURL
      console.log(form.value)
      showToast('头像上传成功')
    } else {
      throw new Error(data.message || '上传失败')
    }

  } catch (err) {
    showToast(err.message || '上传失败，请稍后重试')
    // 上传失败，清空文件列表
    avatarFileList.value = []
  }
}

//辅助方法 判断某个字段是否必填
const isRequired = (query) => {
  const rules = validates.value?.[query]
  if (!rules) return false
  //检查 rules 数组中是否有 required:true 的规则
  //some 判断数组中有没有至少一个元素满足条件
  return rules.some(rule => rule.required)
}

// 验证码
const captchaSvg = ref('')

const hasCaptcha = computed(() => props.type === 'login' || props.type === 'register')

const refreshCaptcha = async () => {
  try {
    const res = await http({ type: 'captcha' })
    captchaSvg.value = res.svg
    form.value.captchaKey = res.key
  } catch (err) {
    console.error('验证码加载失败', err)
  }
}

//type 变化时重置
watch(
  () => props.type,
  () => {
    initForm()
    if (hasCaptcha.value) refreshCaptcha()
  }
)

//监听 userInfo 变化 数据回来时，会自动再赋值一遍
watch(
  () => userStore.userInfo,
  (newVal) => {
    if (props.type === 'userInfo' && newVal) {
      form.value = { ...newVal }
    }
  },
  { deep: true }//监听 对象/数组 里面的内容变化，必须加 deep: true
)

// created 逻辑
onMounted(() => {
  //编辑用户信息时 userInfo 自动赋值
  if (props.type === 'userInfo') {
    const userInfo = userStore.userInfo
    const configFields = FORM_DATA.userInfo.map(item => item.query)
    form.value = Object.fromEntries(
      Object.entries(userInfo).filter(([key]) => configFields.includes(key))
    )
  }
  if (hasCaptcha.value) refreshCaptcha()
})



// 暴露给父组件
defineExpose({
  formRef,
  form: form,// 暴露整个 form 不是 form.value 因为form.value传递的赋值那一刻的静态值
  resetForm: initForm
})
</script>

<style lang="stylus">
.blog-m-avatar-cell
  //清除输入框默认的内边距 让头像垂直居中
  .van-field__control
    padding: 0;
    min-height: 60px;
    display: flex;
    align-items: center;
  // 清除uploader默认外边距
  .van-uploader
    margin: 0

.captcha-svg-m
  cursor pointer
  :deep(svg)
    height 36px
    vertical-align middle
</style>
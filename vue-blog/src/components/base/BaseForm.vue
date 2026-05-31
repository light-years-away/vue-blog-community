<!--
 * @Author: 
 * @Date: 2026-03-12 21:05:05
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-04-06 12:13:43
 * @Description: 
 * @FilePath: \vue-blog\src\components\base\BaseForm.vue
-->
<template>
  <div>
    <!-- ref="formRef"作用是formRef.value 能拿到 <el-form> 组件实例，进而调用 validate 做表单校验  -->
    <el-form :model="form" ref="formRef">
      <!-- 
      :prop="item.query" 关联「表单字段」和「校验规则」，是 Element Plus 表单校验的核心属性
       
      prop 的值（比如 username/password）要和 form 对象的 key 一致（form.username）；
      同时要和 rules 中的校验规则 key 一致（rules.username）；
      只有设置了 prop，<el-form> 的 validate 方法才会校验这个表单项；

      举例：如果 item.query = 'username'，:prop="username" 就会触发 rules.username 中的必填、正则等校验规则
      -->
      <el-form-item v-for="(item) in formData" :key="item.query" :label="item.label" label-width="100px"
        :rules="validates[item.query]" :prop="item.query">

        <el-upload v-if="item.type === 'avatar'" class="avatar-uploader" :action="userFileAction"
          :show-file-list="false" :on-success="handleAvatarSuccess" :on-error="handleAvatarError"
          :before-upload="beforeAvatarUpload" :headers="{
            'Authorization': `Bearer ${userStore.token}`,
          }">
          <el-image style="width: 100px; height: 100px" v-if="form[item.query]" :src="form[item.query]" class="avatar"
            fit="cover"></el-image>
        </el-upload>

        <!-- autocomplete="off" 关闭浏览器对输入框的 自动补全 / 记忆 功能-->
        <el-input v-if="['text', 'password'].includes(item.type)" v-model="form[item.query]" :type="item.type"
          :name="item.query" autocomplete="off" :readonly="item.readonly" />

        <!-- 验证码：SVG 图片 + 输入框 + 刷新按钮 -->
        <div v-if="item.type === 'captcha'" class="captcha-wrap">
          <el-input v-model="form.captcha" placeholder="请输入验证码" class="captcha-input" />
          <span v-html="captchaSvg" class="captcha-svg" @click="refreshCaptcha" title="点击刷新"></span>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>


<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import FORM_DATA from '@/config/form.config'
import VALIDATE_DATE from '@/config/validate.config'
import baseConfig from '@/config/base.config.js'
import { useUserStore } from '@/stores/userStore'
import { ElNotification } from 'element-plus'
import http from '@/api/http'
const BASE_URL = baseConfig.BASE_URL
//创建 Store 实例
const userStore = useUserStore()

const form = ref({})
// 定义表单 ref
const formRef = ref(null)
// ref="formRef"作用是formRef.value 能拿到 <el-form> 组件实例，进而调用 validate 做表单校验 

const props = defineProps({

  type: {
    type: String,
    required: true
  }
})

// 验证码
const captchaSvg = ref('')

const refreshCaptcha = async () => {
  try {
    const res = await http({ type: 'captcha' })
    captchaSvg.value = res.svg
    form.value.captchaKey = res.key
  } catch (err) {
    console.error('验证码加载失败', err)
  }
}

const hasCaptcha = computed(() => {
  return props.type === 'login' || props.type === 'register'
})

// 初始化用户信息
onMounted(() => {
  if (props.type === 'userInfo') {
    form.value = { ...userStore.userInfo }
  } else {
    initForm()
  }
  if (hasCaptcha.value) refreshCaptcha()
})
// 监听 userInfo 变化 数据回来时，会自动再赋值一遍
watch(
  () => userStore.userInfo,
  (newVal) => {
    if (props.type === 'userInfo' && newVal) {
      form.value = { ...newVal }
    }
  },
  { deep: true }//监听 对象/数组 里面的内容变化，必须加 deep: true
)

watch(
  //props.type是普通值,无法被 watch 追踪变化必须用 函数返回值 或 ref 对象的形式传给watch
  () => props.type, //监听 props.type 变化
  () => {
    initForm()
    if (hasCaptcha.value) refreshCaptcha()  // 切换登录/注册时刷新验证码
  }
)
const validates = computed(() =>
  VALIDATE_DATE
)
const formData = computed(() =>
  FORM_DATA[props.type] || []
)
const userFileAction = computed(() =>
  baseConfig['USER_UPLOAD_PATH']
)
//初始化表单方法
const initForm = () => {
  form.value = {} // 重置表单
  formData.value.forEach(item => {
    form.value[item.query] = ''
  })
  console.log(formData.value, 'form')
  formRef.value?.resetFields()
}

//重置表单校验




// 暴露 validate 方法给父组件调用（替代 Vue2  this.$refs.xx.validate()的子组件方法调用）
defineExpose({
  validate: (callback) => {
    if (formRef.value) {
      formRef.value.validate(callback)
    }
  },
  //把表单数据暴露给父组件
  // form: form.value//父组件想拿子组件的数据 必须子组件主动暴露
  form: form,// 暴露整个 form 不是 form.value 因为form.value传递的赋值那一刻的静态值
  resetForm: initForm
})
// 头像上传成功
const handleAvatarSuccess = (res) => {
  form.value.avatar = res.data.fileURL
}
// 头像上传失败
const handleAvatarError = (err) => {
  ElNotification.error({ title: '上传失败', message: JSON.parse(err.message)?.message })
}
const beforeAvatarUpload = (file) => {
  const isImage = /image/.test(file.type)
  const isLt5M = file.size < 5 * 1024 * 1024

  if (!isImage) {
    ElNotification.error({ title: '上传错误', message: '请选择图片文件' })
    return false
  }

  if (!isLt5M) {
    ElNotification.error({ title: '上传错误', message: '文件不得大于5M' })
    return false
  }

  return true
}


</script>

<style>
.captcha-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 0; /* 消除 SVG 底部多余空隙 */
}

.captcha-svg {
  cursor: pointer;
  flex-shrink: 0;
  height: 32px; /* 和 el-input 默认高度一致，label 才能对齐 input */
  display: flex;
  align-items: center;

  /* 让内部 SVG 缩放到等高 */
  & svg {
    height: 100%;
    width: auto;
  }
}

.captcha-input {
  flex: 1;
}
</style>
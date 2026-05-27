<!--
 * @Author: 
 * @Date: 2026-03-14 17:56:37
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-15 17:37:58
 * @Description: 
 * @FilePath: \vue-blog\src\components\user\UserLoginHead.vue
-->
<template>
  <div class="blog-header--login">
    <span @click="refreshModal('login')">登录</span>
    <i class="blog-header--split">|</i>
    <span @click="refreshModal('register')">注册</span>
  </div>
</template>

<script setup>
import { useGlobal } from '@/core/minxin'
const { global, refreshModal } = useGlobal()

</script>

<style lang="stylus">
.blog-header--login span
  cursor pointer
.blog-header--split
  font-size 18px
  padding 0 4px
</style>
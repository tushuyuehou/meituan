<template>
  <div class=""/>
</template>

<script>
export default {
  layout: 'blank',
  //退出用中间件做，为什么用中间件做，因为不涉及交互，跳到页面直接执行
  middleware: async (ctx) => {
    let {status,data}=await ctx.$axios.get('/users/exit')
    if(status===200&&data&&data.code===0){
      window.location.href='/'
    }
  }
}
</script>

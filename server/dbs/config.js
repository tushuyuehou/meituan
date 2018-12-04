export default {
  /**
   * 设置数据库地址
   * */
  dbs:'mongodb://127.0.0.1:27017/student',

  /**
   * redis配置
   * */
  redis:{
    get host(){
      return '127.0.0.1'
    },
    get port(){
      return 6379
    }
  },

  /**
   * smtp服务配置
   * */
  smtp:{
    get host(){
      return 'smtp.qq.com'
    },
    get user(){
      return '**@qq.com'
    },
    get pass(){
      return ''
    },
    /**
     * 发验证码
     * */
    get code(){
      return ()=>{
        return Math.random().toString(16).slice(2,6).toUpperCase()
      }
    },
    /**
     * 验证码过期时间
     * */
    get expire(){
      return ()=>{
        return new Date().getTime()+60*60*1000
      }
    }
  }
}

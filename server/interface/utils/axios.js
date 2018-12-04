import axios from 'axios'
/**
 * 创建axios实例
 * */
const instance = axios.create({
  baseURL:`http://${process.env.HOST||'localhost'}:${process.env.PORT||3000}`,//基础url
  timeout:2000,//超时
  headers:{
    //有特殊头部自行添加配置，详细可看手册
  }
})

export default instance

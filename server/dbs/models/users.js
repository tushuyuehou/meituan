/**
 * 引入mongoose,先安装npm i mongoose,可能会报错
 * */
import mongoose from 'mongoose'
const Schema = mongoose.Schema
const UserSchema=new Schema({
  username:{
    type:String,//类型
    unique:true,//唯一性
    require:true //必须
  },
  password:{
    type:String,
    require:true
  },
  email:{
    type:String,
    require:true
  }
})

export default mongoose.model('User',UserSchema)

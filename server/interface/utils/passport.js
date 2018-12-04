import passport from 'koa-passport'
import LocalStrategy from 'passport-local'
import UserModel from '../../dbs/models/users'


/**
 * 本地策略LocalStrategy
 * 策略是passport中最重要的概念。passport模块本身不能做认证，
 * 所有的认证方法都以策略模式封装为插件。
 * */
passport.use(new LocalStrategy(async function(username,password,done){
  let where = {
    username
  };
  let result = await UserModel.findOne(where)
  if(result!=null){
    if(result.password===password){
      return done(null,result)
    }else{
      return done(null,false,'密码错误')
    }
  }else{
    return done(null,false,'用户不存在')
  }
}))


/**
 * 用户通过session验证
 * session序列化与反序列化
 * 验证用户提交的凭证是否正确，是与session中储存的对象进行对比，
 * 所以涉及到从session中存取数据，需要做session对象序列化与反序列化。
 *
 * 固定用法，库封装好的api
 * */
passport.serializeUser(function(user,done){
  done(null,user)
})

passport.deserializeUser(function(user,done){
  return done(null,user)
})

export default passport

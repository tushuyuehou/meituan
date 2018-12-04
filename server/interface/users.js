/**
 * 引入koa路由
 * */
import Router from 'koa-router';
/**
 * 引入Redis，处理每个用户的请求，如获取验证码
 * */
import Redis from 'koa-redis'
/**
 * 发邮件的应用
 * */
import nodeMailer from 'nodemailer'

/**
 * 导入用户模型，Passport，stmp配置,axios
 * */
import User from '../dbs/models/users'
import Passport from './utils/passport'
import Email from '../dbs/config'
import axios from './utils/axios'

/**
 * 创建路由对象，定义前缀
 * */
let router = new Router({prefix: '/users'})

//获取Redis客户端
let Store = new Redis().client

//定义注册接口post
router.post('/signup', async (ctx) => {
  const {username, password, email, code} = ctx.request.body;

  if (code) {
    //从redis中储存的获取验证码拿出来做对比
    const saveCode = await Store.hget(`nodemail:${username}`, 'code')
    //取过期时间
    const saveExpire = await Store.hget(`nodemail:${username}`, 'expire')
    if (code === saveCode) {
      if (new Date().getTime() - saveExpire > 0) {
        ctx.body = {
          code: -1,
          msg: '验证码已过期，请重新尝试'
        }
        return false
      }
    } else {
      ctx.body = {
        code: -1,
        msg: '请填写正确的验证码'
      }
    }
  } else {
    ctx.body = {
      code: -1,
      msg: '请填写验证码'
    }
  }
  //查询用户是否注册
  let user = await User.find({username})
  if (user.length) {
    ctx.body = {
      code: -1,
      msg: '已被注册'
    }
    return
  }
  //创建用户
  let nuser = await User.create({username, password, email})
  if (nuser) {
    let res = await axios.post('/users/signin', {username, password})
    if (res.data && res.data.code === 0) {
      ctx.body = {
        code: 0,
        msg: '注册成功',
        user: res.data.user
      }
    } else {
      ctx.body = {
        code: -1,
        msg: 'error'
      }
    }
  } else {
    ctx.body = {
      code: -1,
      msg: '注册失败'
    }
  }
})

//登录接口
router.post('/signin', async (ctx, next) => {
  //调用passport的local策略，固定用法
  return Passport.authenticate('local', function(err, user, info, status) {
    if (err) {
      ctx.body = {
        code: -1,
        msg: err
      }
    } else {
      if (user) {
        ctx.body = {
          code: 0,
          msg: '登录成功',
          user
        }
        return ctx.login(user)
      } else {
        ctx.body = {
          code: 1,
          msg: info
        }
      }
    }
  })(ctx, next)
})

router.post('/verify', async (ctx, next) => {
  let username = ctx.request.body.username
  //定义过期时间
  const saveExpire = await Store.hget(`nodemail:${username}`, 'expire')
  //拦截频繁调用接口
  if (saveExpire && new Date().getTime() - saveExpire < 0) {
    ctx.body = {
      code: -1,
      msg: '验证请求过于频繁，1分钟内1次'
    }
    return false
  }
  //发送的对象（验证码发邮件功能）
  let transporter = nodeMailer.createTransport({
    service: 'qq',
    auth: {
      user: Email.smtp.user,
      pass: Email.smtp.pass
    }
  })
  //接收的信息
  let ko = {
    //调用config封装号的方法
    code: Email.smtp.code(),
    expire: Email.smtp.expire(),
    email: ctx.request.body.email,
    user: ctx.request.body.username
  }
  //邮件中显示的内容
  let mailOptions = {
    //发送方
    from: `"认证邮件" <${Email.smtp.user}>`,
    //接收方
    to: ko.email,
    //主题
    subject: '注册码',
    //显示内容
    html: `您的邀请码是${ko.code}`
  }
  //发送
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    } else {
      //发送成功在Redis中存储验证码，过期时间，邮箱
      Store.hmset(`nodemail:${ko.user}`, 'code', ko.code, 'expire', ko.expire, 'email', ko.email)
    }
  })
  ctx.body = {
    code: 0,
    msg: '验证码已发送，可能会有延时，有效期1分钟'
  }
})

//退出
router.get('/exit', async (ctx, next) => {
  await ctx.logout()
  //检查是不是登录状态
  if (!ctx.isAuthenticated()) {
    ctx.body = {
      code: 0
    }
  } else {
    ctx.body = {
      code: -1
    }
  }
})

//获取用户名
router.get('/getUser', async (ctx) => {
  //检查是不是登录状态
  if (ctx.isAuthenticated()) {
    //如果是登录状态，从session中取用户信息出来
    const {username, email} = ctx.session.passport.user
    ctx.body={
      user:username,
      email
    }
  }else{
    ctx.body={
      user:'',
      email:''
    }
  }
})

export default router

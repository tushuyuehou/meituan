import Koa from 'koa'
const consola = require('consola')
const {Nuxt, Builder} = require('nuxt')

//导入mongoose
import mongoose from 'mongoose'
//导入bodyParser,处理post相关请求
import bodyParser from 'koa-bodyparser'
//导入session,登录和注册用到
import session from 'koa-generic-session'
import Redis from 'koa-redis'
//导入json，处理数据格式
import json from 'koa-json'
//导入数据库配置
import dbConfig from './dbs/config'
import passport from './interface/utils/passport'
//导入接口文件
import users from './interface/users'
import geo from './interface/geo'
import search from './interface/search'
import categroy from './interface/categroy'
import cart from './interface/cart'
import order from './interface/order'

const app = new Koa()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

//session配置
app.keys = ['mt', 'keyskeys']
app.proxy = true
app.use(session({key: 'mt', prefix: 'mt:uid', store: new Redis()}))
//post处理配置
app.use(bodyParser({
  extendTypes:['json','form','text']
}))
app.use(json())

//连接数据库
mongoose.connect(dbConfig.dbs,{
  useNewUrlParser:true
})
//初始化passport
app.use(passport.initialize())
app.use(passport.session())

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  //引入路由
  app.use(users.routes()).use(users.allowedMethods())
  app.use(geo.routes()).use(geo.allowedMethods())
  app.use(search.routes()).use(search.allowedMethods())
  app.use(categroy.routes()).use(categroy.allowedMethods())
  app.use(cart.routes()).use(cart.allowedMethods())
  app.use(order.routes()).use(order.allowedMethods())
  //路由放到这里之前，不然可能会实效

  app.use(ctx => {
    ctx.status = 200 // koa defaults to 404 when it sees that status is unset

    return new Promise((resolve, reject) => {
      ctx.res.on('close', resolve)
      ctx.res.on('finish', resolve)
      nuxt.render(ctx.req, ctx.res, promise => {
        // nuxt.render passes a rejected promise into callback on error.
        promise.then(resolve).catch(reject)
      })
    })
  })

  app.listen(port, host)
  consola.ready({message: `Server listening on http://${host}:${port}`, badge: true})
}

start()

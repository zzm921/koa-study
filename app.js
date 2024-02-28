let Koa=require('./koa')
let app=new Koa()


//logger
// app.use(async(ctx,next)=>{
//     await next()
//     const rt = ctx.response.get('X-Response-Time');
//     console.log(`${ctx.method} ${ctx.url} - ${rt}`);
// })

// app.use(async(ctx,next)=>{
//     const start = Date.now();
//     await next();
//     const ms = Date.now() - start;
//     ctx.set('X-Response-Time', `${ms}ms`);
// })


app.use(async(ctx,next)=>{
  console.log(ctx.request.method)
  console.log(ctx.method)
  next()
  ctx.body='hell0'
})




app.listen('3333')
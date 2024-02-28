let http=require('http')
let context=require('./context')
let request=require('./request')
let response=require('./response')
class Application {
    constructor(){
        this.middleware=[]
        //为了避免污染，使用object.create复制一个对象
        this.context=Object.create(context)
        this.request=Object.create(request)
        this.response=Object.create(response)
    }
    listen(...arg){
     let server =   http.createServer(this.callback())
     server.listen(...arg)
     return server
    }

    use(fn){
        if(typeof fn !=='function'){
            throw Error('middleware must be function ')
        }
        this.middleware.push(fn)
    }
    //用于创建上下文对象
    createContext(req,res){
        const context = Object.create(this.context);
        const request = context.request = Object.create(this.request);
        const response = context.response = Object.create(this.response);
        context.app = request.app = response.app = this;
        context.req = request.req = response.req = req;
        context.res = request.res = response.res = res;
        request.ctx = response.ctx = context;
        request.response = response;
        response.request = request;
        context.originalUrl = request.originalUrl = req.url;
        context.state = {};
        return context;
    }

    //http请求回调执行
    callback(){
        //每个请求都有一个独立的context独享
      
        let fnMiddleware=this.compose(this.middleware)
        // http请求回调执行
        const handleRequest=(req,res)=>{
            let ctx=this.createContext(req,res)
            const handleResponse = () => respond(ctx);
            //先执行中间件
            fnMiddleware(ctx).then(handleResponse).catch(reson=>{
                res.end(reson.message)
            })
        }
        return handleRequest
    }

    handleResponse(value){
        res.end(value)
    }
    //异步递归遍历调用中间件处理函数
    compose(middleware){
        return function(ctx){
            //返回第n个用于执行第n个中间件
            const dispatch=(index)=>{
                //如果index到最后一个函数，啧直接返回
                if(index>=middleware.length){
                    return Promise.resolve()
                }
                //第n个中间件函数
                let fn =middleware[index]
                //将中间件包装成一个Promise
                //中间件函数两个参数为 ctx,next  next表示下一个中间件执行函数，将next包装成一个返回dispatch(index=1)的方法
                let next=()=>{
                    return dispatch(index+1)
                }
                return Promise.resolve( 
                    fn(ctx,next)
                )
            }
            return dispatch(0)
        }
        
    }
}


function respond(ctx) {
    const res = ctx.res;
    let body = ctx.body;
    const code = ctx.status;
  
    if ('HEAD' === ctx.method) {
      if (!res.headersSent && !ctx.response.has('Content-Length')) {
        const { length } = ctx.response;
        if (Number.isInteger(length)) ctx.length = length;
      }
      return res.end();
    }
  
    // status body
    if (null == body) {
      if (ctx.response._explicitNullBody) {
        ctx.response.remove('Content-Type');
        ctx.response.remove('Transfer-Encoding');
        return res.end();
      }
      if (ctx.req.httpVersionMajor >= 2) {
        body = String(code);
      } else {
        body = ctx.message || String(code);
      }
      if (!res.headersSent) {
        ctx.type = 'text';
        ctx.length = Buffer.byteLength(body);
      }
      return res.end(body);
    }
  
    // responses
    if (Buffer.isBuffer(body)) return res.end(body);
    if ('string' === typeof body) return res.end(body);
    if (body instanceof Stream) return body.pipe(res);
    // body: json
    body = JSON.stringify(body);
    if (!res.headersSent) {
      ctx.length = Buffer.byteLength(body);
    }
    res.end(body);
  }

module.exports=Application
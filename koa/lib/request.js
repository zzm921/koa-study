let request={
    get method(){
        return this.req.method
    },

    get headers(){
        return this.req.headers
    },

    get url(){
        return this.req.url
    },

    get path(){
        return this.req.path
    },
    get query(){
        return this.req.query
    },
}

module.exports=request
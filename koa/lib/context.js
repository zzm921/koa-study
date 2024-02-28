let context={}

defineProporty('request','method')
defineProporty('response','status')
defineProporty('response','body')
function defineProporty(target,name){
    Object.defineProperty(context,name,{
        get(){
            return this[target][name]
        },

        set(value){
             this[target][name]=value
        }
    })
}

module.exports=context
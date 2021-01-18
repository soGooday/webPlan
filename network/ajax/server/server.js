
let express = require('express');
const os = require('os');

let app = express();
// ajax get
app.get('',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin',"*")
    response.send('学习 ajax get')
})
// ajax post
app.post('/abort',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin',"*") 
    setTimeout(()=>{
      response.send('学习 ajax abort')
    },3000)
})
//取消ajax的发送
app.get('/timeout',(request,response)=>{
  response.setHeader('Access-Control-Allow-Origin',"*") 
  setTimeout(()=>{
    response.send('学习 ajax timeout')
  },3000) 
})
//ie的发送
app.get('/ie',(request,response)=>{
  response.setHeader('Access-Control-Allow-Origin',"*") 
 
  response.send('学习 ajax ie缓存处理')
  
})
let point = 8080;
var server = app.listen(point,(arg)=>{  
    console.log(`启动成功地址 ${getIpAddress()}:${point}`)
})



/**
 * 获取当前机器的ip地址
 */
function getIpAddress() {
  var ifaces=os.networkInterfaces()

  for (var dev in ifaces) {
    let iface = ifaces[dev]

    for (let i = 0; i < iface.length; i++) {
      let {family, address, internal} = iface[i]

      if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
        return address
      }
    }
  }
}  
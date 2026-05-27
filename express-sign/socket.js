/*
  接收连接 登录用户上线（支持顶号）
  管理在线用户
  接收消息
  广播消息
*/

var app = require('./app');
var http = require('http');
let webSocketServer = http.Server(app) // 把 express 服务转成 http 服务
let socketIo = require('socket.io')// 引入 socket.io
let io = socketIo(webSocketServer,//给http服务装上WebSocket功能
  {
    transports: ['websocket'] //强制只用 WebSocket 协议
  })
let { formatDate } = require('./core/util/util')

const users = {}//存所有在线用户

//监听客户端连接
io.on('connection', (socket) => {
  //socket: 当前连接的客户端会话（每个用户一个独立 socket）
  //监听client客户端emit的message事件
  console.log('新客户端连接:', `id:${socket.id}`)

  //登录用户上线 支持顶号
  socket.on('online', ({ uid, nikname, avatar }) => {
    //如果已在线 顶掉旧连接
    if (users[uid]) {
      // 先把旧 socket 的 uid 清掉，防止 disconnect 事件误删新用户数据
      users[uid].socket.uid = null
      users[uid].socket.disconnect();
    }

    users[uid] = {
      uid,
      nikname,
      avatar,
      socket: socket,
      isGuest: false
    };

    socket.uid = uid;
    socket.nikname = nikname;
    socket.avatar = avatar;
    socket.isGuest = false;

    //广播进入
    io.sockets.emit('logged', nikname);// 广播：xxx 加入聊天室
    /*
    io.sockets.emit()
      发给所有人，包括自己
    socket.broadcast.emit()
      发给所有人，除了自己
    */
  });

  //游客进入聊天室
  socket.on('enterGuest', ({ uid, nikname }) => {
    users[uid] = {
      uid,
      nikname,
      socket: socket,
      isGuest: true
    };

    socket.uid = uid;
    socket.nikname = nikname;
    socket.isGuest = true;

    io.sockets.emit('logged', nikname);// 广播：xxx 加入聊天室
  });


  //发送聊天消息
  socket.on('send', (msg) => {
    if (!socket.uid || !users[socket.uid]) {
      return
    }
    const user = users[socket.uid]
    socket.broadcast.emit('chat', {//广播给所有人 除了自己
      nikname: user.nikname,
      msg: msg,
      time: formatDate(),
      avatar: user.avatar
    })

  })

  //处理游客退出
  socket.on('logout', () => {
    const uid = socket.uid
    if (!uid || !users[uid]) return

    const user = users[uid]
    io.sockets.emit('logout', user.nikname)

    delete users[uid]
    socket.disconnect()
  })

  //断开连接
  socket.on('disconnect', () => {
    const uid = socket.uid;
    if (!uid || !users[uid]) {
      return
    }

    const user = users[uid];
    io.sockets.emit('logout', user.nikname)// 广播：xxx 离开了

    delete users[uid];

  })
})



webSocketServer.listen(8888, () => {
  console.log('websocket聊天室开启 端口8888')
})

module.exports = webSocketServer


/*
io socket服务对象
io.sockets 接入的socket - client客户端的所有会话对象
io.close 关闭socket服务
events
  io.on 监听事件
    connection client客户端建立ws连接
    disconnect client客户端断开ws连接
    disconnecting 断开中

  io.emit 触发事件
    自定义事件
socket 会话对象
  socket.id 会话id
  socket.client 会话客户端对象
  socket.send([…args][, ack])
    socket.emit('message',data)
    socket.on('message',(data)=>{

    })
  //监听事件
  socket.on('事件名称',(data)=>{
    //事件回调 data接收到的信息
  })
  //触发事件
  socket.emit('事件名称',信息)

  io.sockets.emit()
    向所有与socketIO server建立连接的客户端socket会话广播信息
  socket.broadcast.emit()
    该属性触发事件发出将仅向除了 发送方 以外的所有 客户端会话 广播事件数据。
*/
/*
  文字在线聊天室

  客户端
    昵称
      登录用户 (userInfo.nikname)
      未登录
        输入昵称
        建立连接
    信息输入
      input
    信息展示
      信息列表
        他人信息
        自身信息
        信息日期
        昵称
  服务端
    用户列表 clientList
      name:nikname
      socket:socket

*/

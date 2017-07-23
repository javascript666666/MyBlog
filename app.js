/**
 * 应用程序的启动(入口)文件
 */

//加载express 模块
var express = require('express');
//加载模板处理模块
var swig = require('swig');
//加载数据库模块
var mongoose = require('mongoose');
//加载body-parser,用来处理post提交过来的数据
var bodyParser = require('body-parser')
//创建app应用  等同 NodeJS 中的服务端对象 Http.createServe();
var app = express();

//设置静态文件托管
//当用户访问的url以/public开始, 那么直接返回对应的__dirname + '/public' 下的文件
app.use('/public', express.static(__dirname + '/public'));

//配置应用模板
//定义当前应用所使用的模板引擎
//第一个参数: 模板引擎的名称,同时也是模板引擎的后缀,第二个参数表示用于解析处理模板内容的方法
app.engine('html', swig.renderFile);
//设置模板文件存放的目录,第一个参数必须是views,第二个参数是目录
app.set('views', './views');
//注册所使用的模板引擎,第一个参数必须是view engine, 第二个参数和app.engine这个方法中定义的模板引擎的名称(第一个参数)是一致的
app.set('view engine', 'html');
//在开发过程中,需要取消模板缓存
swig.setDefaults({cache: false});

//bodyParser设置  app调用bodyParser下的urlencoded方法 会在req对象上增加个body属性获取到前端提交过来的数据
app.use(bodyParser.urlencoded({extended: true}));
//路由绑定
// /**
//  * 首页
//  * req request对象 保存客户端请求相关的的一些数据 -http.request
//  * res response对象 服务端输出对象,提供了一些服务端输出相关的一些方法 -http.response
//  * next 方法 用于中心下一个和路径匹配的函数
//  *
//  */
//
// app.get('/',function(req, res, next) {
//     //内容输出: res.send(string)发送内容至客户端
//     //res.send('<h1>欢迎来到我的博客</
//
//     /*
//     * 读取views 目录下的知道文件,解析并返回给客户端
//     * 第一个参数: 表示模板的文件, 相对于views目录   views/index.html
//     * 第二个参数: 传递给模板使用的数据
//     * */
//     res.render('index');
// })

/*
* 根据不同的功能划分模块 ./routers
* admin 后台管理模块
* api API模块
* main 前台模块
* */
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/',require('./routers/main'));

//连接服务器
mongoose.connect('mongodb://localhost:27018/blog', function(err) {
    if(err){
        console.log('数据库连接失败')
    } else {
        console.log('数据库连接成功')
        //监听http请求
        app.listen(8080);
    }
});


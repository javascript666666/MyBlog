var mongoose = require('mongoose');
//用户的表结构
new mongoose.Schema({
    //用户名
    username: String,
    //密码
    password: String
});
var express = require('express');
var router = express.Router();

//统一返回格式
var responseData;

router.use(functino() {
    responseData = {
        code: 0,
        message: ''
    }
})
/*
* 用户注册
*   注册逻辑:
*   1 用户名不能为空
*   2 密码不能为空
*   3 2次输入密码必须一致
*
*   1 用户是否已经被注册了
*       数据库查询
* */
router.post('/user/register', function(req, res, next) {
    //console.log(req.body);
    var username = req.body.username;
    var possword = req.body.password;
    var repassword = req.body.repassword;

    //用户名是否为空
    if (username == ''){
        responseData.c
    }
});
module.exports = router;
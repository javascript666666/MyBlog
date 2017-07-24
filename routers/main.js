var express = require('express');
var router = express.Router();
router.get('/',function(req, res, next) {
    //console.log(req.userInfo);
    //render 第二个参数 就是分配给模板去使用的
    res.render('main/index', {
        userInfo: req.userInfo
    });
});
module.exports = router;
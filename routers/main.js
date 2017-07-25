var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content');

var data;
/*
* 处理通用数据
* */
router.use(function(req, res, next){
    data={
        userInfo: req.userInfo,
        categories: [],
    }
    Category.find().sort({_id: -1}).then(function(categories){
        data.categories = categories;
        next();
    })
})
/*
* 首页
* */
router.get('/',function(req, res, next){
        //data不能重新等与新对象
        //用户点击分类标签 发起get请求 记录category 来展示分类下的内容
        data.category = req.query.category || '';
        data.page = Number(req.query.page || 1);
        data.limit = 10;
        data.pages = 0;
        data.count = 0;

    var where = {};
    if (data.category){
        where.category = data.category
    }

     Content.where(where).count().then(function (count){
        data.count = count;
        data.pages = Math.ceil(data.count / data.limit);
        data.page = Math.min(data.page, data.pages);
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1)*data.limit;
        //.where({})限制查询
        //console.log(where);
        return Content.find().where(where).limit( data.limit).skip(skip).populate(['category','user']).sort({addTime: -1});
    }).then(function(contents){
        data.contents = contents;
        // console.log(data);
        //render 第二个参数 就是分配给模板去使用的
        res.render('main/index',data);
    })
});

/*
* 阅读全文
* */

router.get('/view',function (req, res){
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id: contentId
    }).then(function(content){
        data.content = content;
        //console.log(data);
        content.views++;
        content.save();
        res.render('main/view',data);
    })
})
module.exports = router;
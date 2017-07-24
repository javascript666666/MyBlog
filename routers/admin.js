var express = require('express');
var router = express.Router();

var User = require('../models/User');
var Category = require('../models/Category');
router.use(function(req, res, next) {
    if (!req.userInfo.isAdmin){
        //如果当前用户是非管理员
        res.send('对不起,只有管理员才能进入后台管理');
        return;
    }
    next();
})

/*
* 后台主页
*/
router.get('/',function(req, res, next) {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});

/*
* 用户管理
* */

router.get('/user', function(req, res, next) {

    /*
    *从数据库中读取所有的用户数据 分配给模板  通过模板展示出数据
    *
    * limit(Number): 限制获取的数据条数
    *
    * skip(Number):  忽略数据的条数
    * 每页显示2条
    * 1 : 1-2   skip:0   _> (当前页-1)*limit
    * 2 : 3-4   skip:2
    * */
    //获取用户url /admin/user?page =2  中的page的值
    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    //User.count() 查询数据有多少条
    User.count().then(function(count) {
        //console.log(count)
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过总页数
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);
        var skip = (page-1)*limit;
        User.find().limit(limit).skip(skip).then(function(users) {
            console.log(users)

            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,

                count: count,
                pages: pages,
                page: page,
                limit: limit
            });
        })
    })
});

/*
* 分类管理
* */
router.get('/category',function(req, res){
    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    Category.count().then(function(count) {
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page-1)*limit;
        Category.find().limit(limit).skip(skip).then(function(categories) {
            //console.log(categories)
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,

                count: count,
                pages: pages,
                page: page,
                limit: limit
            });
        })
    })

})

/*
* 分类的添加
* */
router.get('/category/add', function(req, res){
    res.render('admin/category_add',{
        userInfo: req.userInfo
    });
});

/*
* 分类的保存
* */
router.post('/category/add', function(req, res){
    var name = req.body.name || '';
    if (name == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: "名称不能为空"
        });
        return;
    }

    //数据库中是否存在同类名称
    Category.findOne({
        name: name
    }).then(function(rs) {
        if(rs) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类已经存在'
            });
            return Promise.reject();
        } else {
            //分类名不存在,可以保存
            return new Category({
                name: name
            }).save();
        }
    }).then(function(newCategory){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        })
    });
});
/*
* 分类修改
* */
router.get('/category/edit',function(req, res){
    //获取要修改的分类信息,并用表单的形式表现出来
    var id = req.query.id || '';
    //查询这条数据是否在数据库中存在
    Category.findOne({
        _id: id
    }).then(function(category){
        if(!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            })
        } else {
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            })
        }
    })
});

/*
* 分类的修改保存
* */
router.post('/category/edit', function(req, res) {
    var id = req.query.id || '';
    //获取post提交过来的名称
    var name = req.body.name || '';
    //查询这条数据是否在数据库中存在
    Category.findOne({
        _id: id
    }).then(function(category){
        if(!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            })
            return Promise.reject();
        } else {
            //当用户没有做任何修改提交时,
            if (name == category.name){
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '修改成功',
                    url: '/admin/category'
                })
                return Promise.reject();
            } else{
                //要修改的名称是否已经在数据库中存在了
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                })
            }
        }
    }).then(function(sameCategory) {
        console.log(sameCategory);
        if(sameCategory) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '数据库中已存在同名分类存在'
            })
            return Promise.reject();
        } else {
            return Category.update({
                _id: id
            },{
                name: name
            })
        }
    }).then(function(){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/category'
        })
    })
});


/*
* 分类删除
* */
router.get('/category/delete',function(req, res){
    //获取要删除的分类ID
    var id = req.query.id || '';
    //查询这条数据是否在数据库中存在
    Category.findOne({
        _id: id
    }).then(function(category){
        if(!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            })
            return Promise.reject();
        } else {
            return Category.remove({
                _id: id
            })
        }
    }).then(function(){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/category'
        })
    })
});

module.exports = router;
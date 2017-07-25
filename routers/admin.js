var express = require('express');
var router = express.Router();

var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');
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

        /*
        * User.sort({_id: 1 || -1}) 排序   1 从小到大  -1 从大到小 id受创建时间戳影响
        * */
        User.find().sort({_id: -1}).limit(limit).skip(skip).then(function(users) {
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
        Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function(categories) {
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

    if (name == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: "名称不能为空"
        });
        return;
    }

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
        //console.log(sameCategory);
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

/*
* 内容首页
* */
router.get('/content',function (req, res, next) {

    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    Content.count().then(function(count) {
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page-1)*limit;
        Content.find().sort({addTime: -1}).limit(limit).skip(skip).populate(['category','user']).then(function(contents) {
            //console.log(contents)
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,

                count: count,
                pages: pages,
                page: page,
                limit: limit
            });
        })
    })

});

/*
* 内容添加
* */

router.get('/content/add',function (req, res, next) {
    Category.find().sort({_id: -1}).then(function(categories) {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        })
    })
})

/*
* 内容保存
* */
router.post('/content/add', function (req, res) {
    //console.log(req.body);
    //简单验证不能为空
    if (req.body.category == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }
    if((req.body.title == '') || (req.body.description =='') || (req.body.content == '')) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '标题 简介 内容不能为空'
        })
        return;
    }
    //保存到数据库
    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then(function(rs) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '保存成功!',
            url: '/admin/content'
        })
    })
});

/*
* 修改内容
* */
router.get('/content/edit', function(req, res){
    //获取要修改的分类信息,并用表单的形式表现出来
    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({_id: -1}).then(function(rs) {
        //查询这条数据是否在数据库中存在
        categories = rs;
        return Content.findOne({
            _id: id
        }).populate('category')
    }).then(function(content){
        if(!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '指定内容不存在'
            })
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                content: content,
                categories: categories
            })
        }
    })
})

/*
* 保存修改内容
* */
router.post('/content/edit', function(req, res) {
    var id = req.query.id || '';
    if (req.body.category == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }
    if((req.body.title == '') || (req.body.description =='') || (req.body.content == '')) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '标题 简介 内容不能为空'
        })
        return;
    }
    //保存到数据库
     Content.update({
         _id: id
     },{
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }) .then(function(rs) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '保存成功!',
            url: '/admin/content'
        })
    })
});




/*
 * 删除内容
 * */
router.get('/content/delete', function(req, res){
    var id = req.query.id || '';
    Content.remove({
        _id:id
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url:'/admin/content'
        })
    })
})
module.exports = router;
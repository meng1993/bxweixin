var app = getApp();
Page({
    onLoad(e){
        this.setData({book_dimension_item_id:e.id})

        this.cGetMessage(this.data.currentPage,this.data.pagesize)

        wx.setNavigationBarTitle({
            title: e.name
        })
    },
    onReachBottom(){
        console.log(111)
        this.setData({
            currentPage: this.data.currentPage + 1
        })
        this.cGetMessage(this.data.currentPage,this.data.pagesize)
    },
    data:{
        currentPage: 1,
        pagesize: 10,
        list: [],
        ids: '',        //全部加入书筐中的book_id数组
    },
    getbookids(){
        let json = app.token({ celebrity_id: this.data.id});
        app.request('book/index/celebrity_all_book', 'POST', json, 'bookb', this);
    },
    bookb(data){
        if(data.code!=200){
            return false
        }
        let all = data.data.length
        this.setData({ book_ids:data.data,all: all});
    },
    //加入书架
    inshelf(e) {
        if (app.repeat(e.timeStamp) == false) { return; }
        let token = wx.getStorageSync('token');
        let shelf = e.currentTarget.id;//0未加入书架，1已加入书架
        console.log('shelf-------->'+shelf)
        if (wx.getStorageSync('token') === "") {
            this.login();
            return false;
        }
        if (shelf == 1) {//已加入书架的
            this.outshelf(e);//此时必已登陆
            return false;
        }
        let shelfindex = e.currentTarget.dataset.index;
        console.log('shelfindex----------->'+shelfindex)
        console.log('parent==============》'+e.currentTarget.dataset.parent)
        this.setData({ shelfindex: shelfindex, parent: e.currentTarget.dataset.parent});
        let book_id = e.currentTarget.dataset.book_id;//book_id;
        let user_id = wx.getStorageSync('userdata').user_id;
        let json = { book_ids: [book_id], token: token, user_id: user_id }
        app.request('book/user/addBookshelf', 'POST', json, 'inshelfb', this);
    },
    //加入书架回调
    inshelfb(data) {
        if (data.code == 200) {//加入成功
            wx.showToast({
                title: '加入成功', icon: "none",duration:700
            })
            // let shelfindex = this.data.shelfindex;//下标
            let parent = this.data.parent;
            let param = {};//单个赋值法
            console.log('parent---->'+parent)
            // param['list[' + parent+'].book_list[' + shelfindex + '].is_shelf'] = 1;//加入书架成功后=1
            param['list[' + parent+'].is_shelf'] = 1;//加入书架成功后=1
            this.setData(param);
            app.shelftabbat(1);//更新书架tabbar数量
        }
    },
    //移出书架
    outshelf(e) {
        if (wx.getStorageSync('token') === "") {
            this.login();
            return false;
        }
        let token = wx.getStorageSync('token');
        let shelfindex = e.currentTarget.dataset.index;
        this.setData({ shelfindex: shelfindex, parent: e.currentTarget.dataset.parent});
        let book_id = e.currentTarget.dataset.book_id;//book_id;
        let user_id = wx.getStorageSync('userdata').user_id;
        let json = { book_ids: book_id, token: token, user_id: user_id }
        app.request('book/user/delBookshelf', 'POST', json, 'outshelfb', this);
    },
    //移除回调
    outshelfb(data) {
        if (data.code == 200) {
            wx.showToast({ title: '移除成功', icon: 'none',duration:700});
            let shelfindex = this.data.shelfindex;//下标
            let parent = this.data.parent;
            let param = {};//单个赋值法
            // param['list[' + parent + '].book_list[' + shelfindex + '].is_shelf'] = 0;//移出书架成功后=0
            param['list[' + parent+'].is_shelf'] = 0;//加入书架成功后=1
            this.setData(param);
            app.shelftabbat(-1);//更新书架tabbar数量
        }
    },
    inshujia(e){
        if (wx.getStorageSync('token') === "") {
            this.login();
            return false;
        }
        let blist = this.data.list[e.currentTarget.id].book_list;
        let book_ids = [];
        blist.forEach((item)=>{
            book_ids.push(item.book_id);
        })
        let json = app.token({ book_ids: book_ids});
        app.request('book/user/addBookshelf', 'POST', json, 'inshujiab', this);
        this.setData({ parent: e.currentTarget.id});
    },
    inshujiab(data){
        wx.showToast({ title: data.msg, icon: 'none', duration: 700 });
        if(data.code===200){
            let blist = this.data.list[this.data.parent].book_list;
            let parent = this.data.parent;
            blist.forEach((item) => {
                item.is_shelf = 1;
            })
            let params ={};
            params['list[' + parent + '].book_list'] = blist;
            this.setData(params);
        }
    },
    //去绘本详情页
    getdetail(e) {
        if (app.repeat(e.timeStamp) == false) { return; }
        let bookid = e.currentTarget.id;
        let date = this.data.date;
        wx.navigateTo({ url: '../detail/detail?bookid=' + bookid  });
    },
    login(){
        wx.navigateTo({url:'/pages/login/login'});
    },
    //jjjjjjjjjjjjjjjjjjjjjjjjjjj新增
    cGetMessage(currentPage,pagesize){
        let token = wx.getStorageSync('token');
        let user_id = wx.getStorageSync('userdata').user_id;
        let json = {page: currentPage, pagesize: pagesize, book_dimension_item_id: this.data.book_dimension_item_id, user_id: user_id, token: token}
        app.request('book/index/dimension_list_second_detail','POST',json,'cGetMessageSuccess',this);
    },
    cGetMessageSuccess(data){
        console.log('333333333333330------------>'+JSON.stringify(data));
        if(data.code!=200){
            return false
        }
        this.setData({
            celebrity_info: data.data.item_info,
            list: this.data.list.concat(data.data.book_list),
            ids: data.data.book_ids
        });

        console.log('jjjjjjjjjj------------>'+this.data.list)


    },
    //  全部加入书筐
    addBoxAll(e){
        if(wx.getStorageSync('token')===""){
            this.login();
            return false;
        }
        let book_id = e.currentTarget.dataset.ids;//book_ids;
        let user_id = wx.getStorageSync('userdata').user_id;
        let token=wx.getStorageSync('token');
        let json = { book_ids: book_id, token: token, user_id: user_id }
        app.request('book/user/addBookshelf', 'POST', json, 'addBoxAllSuccess', this);
    },
    addBoxAllSuccess(res){
        wx.showToast({
            title: res.msg, icon: "none",duration:700
        })
        this.setData({
            allin: 1
        })
        if(res.code == 200){
            var list = this.data.list
            var hasList = []

            for(var i=0;i<list.length;i++){
                if(list[i].is_shelf == 1){
                    hasList.push(list[i])
                }
                list[i]['is_shelf'] = 1
            }
            console.log(list)
            this.setData({
                list: list
            })
        }
        console.log('666666666-------------->'+JSON.stringify(res))
    },
})
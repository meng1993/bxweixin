let app=getApp();
Page({
  onLoad(e){
    //关键词、搜索类型数组下标
    this.setData({ typearrindex: parseInt(e.typearrindex), _typearrindex:parseInt(e.typearrindex),
      keywords: e.keywords, e: e, pla: e.keywords});   
    if (this.data.typearr[this.data.typearrindex].index==2){
      this.setData({ book: "seriesbook"})
    }
    
    this.req(e.keywords);  //关键词
    wx.showLoading({ title: '加载中...', })
  },
  onPullDownRefresh() {//下拉
    wx.stopPullDownRefresh();
    let e=this.data.e;
    this.setData({
      typearrindex: 0,//页面上显示的，input搜索时赋值给_typearrindex
      _typearrindex: 0,//下拉||条件搜索时用旧类型，input搜索时会被typearrindex更新
      // typecheck: { name: '书名', index: 1 }
      keywords: '',
      page: 0,
      book: "book", //模版类型，类型为'系列'时换成seriesbook模版
      lists: [],
      bottomload: true, //loading图标,默认不显示
      bottomend: false, //某一类搜索到最后了 默认不显示
      condition: '0',   //条件(综合，销量，最新),默认综合
      nobook: false,   //没有结果？  默认false(有结果);
    })
    this.onLoad(e);
  },
  data:{
    typearr: [{ name: '书名', index: 1 }, { name: '系列', index: 2 },
    { name: '作者', index: 3 }, { name: '出版社', index: 4 }],
    typearrindex: 0,//页面上显示的，input搜索时赋值给_typearrindex
    _typearrindex: 0,//下拉||条件搜索时用旧类型，input搜索时会被typearrindex更新
    // typecheck: { name: '书名', index: 1 }
    keywords: '',
    page:0,
    book: "book", //模版类型，类型为'系列'时换成seriesbook模版
    lists:[],
    bottomload:true, //loading图标,默认不显示
    bottomend:false, //某一类搜索到最后了 默认不显示
    condition:'0',   //条件(综合，销量，最新),默认综合
    nobook:false,   //没有结果？  默认false(有结果);
  },
  onReachBottom(){
    if (this.data.reqing != false) {//请求中
      return false;
    }
    if (this.data.bottomend==false){
      this.setData({ bottomload: false, reqing:true});//显示loading图,请求中
       let keywords = this.data.keywords;
       this.req(this.data.keywords);//当前关键字的下一页
    }
  },
  Sbooktypechange(e) {//修改搜索类型
    this.setData({ typearrindex: e.detail.value })
  },
  Ssearchconfirm(e) {//点击搜索
    if(e.detail.value===""){
      return false;
    }
    //关键字&清空input&page归0&隐藏到底提示&清空列表 --重新搜索
    this.setData({ keywords: e.detail.value, novalue: "", page: 0, lists: [], bottomend: false,
      _typearrindex: this.data.typearrindex, pla: e.detail.value});//更换为最新搜索条件
    let typecheck = this.data.typearr[this.data.typearrindex].index;//类型
    if (typecheck==2){//类型=系列
      this.setData({ book:"seriesbook"});
    }else{
      this.setData({ book: "book" });
    }
    this.req(e.detail.value);//请求
  },
  changecondition(e){//更换搜索条件(0综合，1销量，2最新)
    if (e.currentTarget.id != this.data.condition){//更换了条件
      //设置条件，重新搜索(page归0，清空列表，隐藏到底提示)
      this.setData({ condition: e.currentTarget.id, page: 0, lists: [], bottomend: false,bottomload:false });
      this.req(this.data.keywords);//搜索
    }
  },
  inshelf(e) {//加入书架
    if (app.repeat(e.timeStamp) == false) { return; }
    let token = wx.getStorageSync('token');
    let shelf = e.currentTarget.id;//0未加入书架，1已加入书架  
    if (token === "") {//没登陆的
      wx.navigateTo({url: '/pages/login/login'})
      return false;
    }
    if (shelf == 1) {//已加入书架的
      this.outshelf(e);//此时必已登陆
      return false;
    }
    let shelfindex = e.currentTarget.dataset.index;
    this.setData({ shelfindex: shelfindex });//下标，加入书架成功后修改对应图标
    let book_id = e.currentTarget.dataset.book_id;//book_id;
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { book_ids: [book_id], token: token, user_id: user_id }
    app.request('book/user/addBookshelf', 'POST', json, 'inshelfb', this);
  },
  inshelfb(data) {//加入书架回调
    if (data.code == 200) {//加入成功
      wx.showToast({
        title: '加入成功', icon: "none"
      })
      let shelfindex = this.data.shelfindex;//下标
      let param = {};//单个赋值法
      param['lists[' + shelfindex + '].is_shelf'] = 1;//加入书架成功后=1
      this.setData(param);
      app.shelftabbat(1);//更新书架tabbar数量
    }
  },
  outshelf(e) {//移出书架
    let token = wx.getStorageSync('token');
    let shelfindex = e.currentTarget.dataset.index;
    this.setData({ shelfindex: shelfindex });//下标，移出书架成功后修改对应图标
    let book_id = e.currentTarget.dataset.book_id;//book_id;
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { book_ids: book_id, token: token, user_id: user_id }
    app.request('book/user/delBookshelf', 'POST', json, 'outshelfb', this);
  },
  outshelfb(data) {//移除回调
    if (data.code == 200) {
      wx.showToast({ title: '移除成功', icon: 'none' });
      let shelfindex = this.data.shelfindex;//下标
      let param = {};//单个赋值法
      param['lists[' + shelfindex + '].is_shelf'] = 0;//移出书架成功后=0
      this.setData(param);
      app.shelftabbat(-1);//更新书架tabbar数量
    }
  },
  getdetail(e) {//去绘本详情页
    if (app.repeat(e.timeStamp) == false) { return; }
    let bookid = e.currentTarget.id;
    wx.navigateTo({ url: '../detail/detail?bookid=' + bookid});
  },
  req(keywords, condition=''){//请求   
    let typecheck = this.data.typearr[this.data._typearrindex].index;   //搜索类型
    this.setData({ page: this.data.page + 1 });
    let _this = this;

    app.request('book/index/classifiedSearch', 'get', {user_id:wx.getStorageSync('userdata').user_id || "","type": typecheck,"keywords": keywords,"page": _this.data.page,"order_method": _this.data.condition},
        'reqSuccess', _this);
//     wx.request({
//       url: app.data.http + 'book/index/classifiedSearch',
//       data: {
//         user_id:wx.getStorageSync('userdata').user_id || "",
//         "type": typecheck,
//         "keywords": keywords,
//         "page": _this.data.page,
//         "order_method": _this.data.condition
//       },
//       success: function (res) {
//         let data = res.data;
//         if (data.code == "200") {
//           if (data.data.length == 0) {//当前page没有结果
//             _this.setData({ bottomend: true});//显示到底了
//             if(_this.data.page==1){//第一页就没有结果(page==1)
//               _this.setData({ nobook:true});//隐藏搜索条件、到底提示，显示无结果提示
//             }
//           } else {//有结果
//             if (_this.data.page == 1) {//第一页就有结果(page==1)
//               _this.setData({ nobook: false });//显示搜索条件、到底提示，隐藏无结果提示
//             }
//             if (data.data.length<10){//小于10条，下一页没有了
//               _this.setData({ bottomend:true});//显示到底了
//             }
//             let _lists=_this.data.lists;
//             data.data.forEach((item, index) => [
//               item.img_medium = item.img_medium.split('@')[0]
//             ])
//             _lists=_lists.concat(data.data);//数组合并
// //            console.log(_lists);
//             _this.setData({ lists: _lists});
//           }
//           wx.hideLoading();
//           _this.setData({ bottomload: true, reqing: false})//隐藏loading,请求结束
//         }
//       }
//     })
  },
  reqSuccess(res){
    console.log('说好的幸福呢！！！111111111111')
    console.log(JSON.stringify(res))
    let data = res.data;
    if (res.code == "200") {
        if (data.length == 0) {//当前page没有结果
            this.setData({ bottomend: true});//显示到底了
            if(this.data.page==1){//第一页就没有结果(page==1)
                this.setData({ nobook:true});//隐藏搜索条件、到底提示，显示无结果提示
            }
        } else {//有结果
            if (this.data.page == 1) {//第一页就有结果(page==1)
                this.setData({ nobook: false });//显示搜索条件、到底提示，隐藏无结果提示
            }
            if (data.length<10){//小于10条，下一页没有了
                this.setData({ bottomend:true});//显示到底了
            }
            let _lists=this.data.lists;
            data.forEach((item, index) => [
                item.img_medium = item.img_medium.split('@')[0]
            ])
            _lists=_lists.concat(data);//数组合并
//            console.log(_lists);
            this.setData({ lists: _lists});
        }
        wx.hideLoading();
        this.setData({ bottomload: true, reqing: false})//隐藏loading,请求结束
    }
  },
  series(e) {
    let series = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/index/series/series?series=' + series, })
  }
})
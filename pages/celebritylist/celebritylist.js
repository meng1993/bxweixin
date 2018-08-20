var app = getApp();
Page({
  onLoad(e){
    this.setData({id:e.id})
    this.getlist();
    this.getbookids();
  },
  onReachBottom(){
    if (this.data.page> this.data.page_max){
      return false
    }
    this.setData({ mofenti: this.data.mofenti+1 , bottomload:false});
    this.getlist();
  },
  data:{
    allin:0,
    page:1,
    mofenti:1,
    all:0,
    num:0
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
  getlist(){
    let json = app.token({ celebrity_id: this.data.id, page: this.data.page, page2: this.data.mofenti});
    app.request('book/index/celebrity_book_list','POST',json,'listb',this);
  },
  listb(data){
    this.setData({ bottomload: true})
    if(data.code!=200){
      return false
    }   
    let list = this.data.list || [];    
    let index = this.data.page-1;//书单数组下标
    list[index] = (list[index] || {});
    list[index].book_list = (list[index].book_list || []).concat(data.data.celebrity_book_list[0].book_list);
    list[index].summary = data.data.celebrity_book_list[0].summary;
    list[index].title = data.data.celebrity_book_list[0].title;
    list[index].book_num = data.data.celebrity_book_list[0].book_num;
    if (this.data.page === 1 && this.data.mofenti === 1){
      this.setData({ page_max: data.data.page_max, celebrity_info: data.data.celebrity_info });
    }  
    if (data.data.celebrity_book_list[0].book_list.length<10){//下一个书单
      this.setData({ page: this.data.page + 1, mofenti: 0 })
    }
    let params = {};
    params['list[' + index + ']'] = list[index];
    this.setData(params);
  },
  inshelf(e) {//加入书架
    if (app.repeat(e.timeStamp) == false) { return; }
    let token = wx.getStorageSync('token');
    let shelf = e.currentTarget.id;//0未加入书架，1已加入书架  
    if (wx.getStorageSync('token') === "") {
      this.login();
      return false;
    }
    if (shelf == 1) {//已加入书架的
      this.outshelf(e);//此时必已登陆
      return false;
    }
    let shelfindex = e.currentTarget.dataset.index;
    this.setData({ shelfindex: shelfindex, parent: e.currentTarget.dataset.parent});
    let book_id = e.currentTarget.dataset.book_id;//book_id;
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { book_ids: [book_id], token: token, user_id: user_id }
    app.request('book/user/addBookshelf', 'POST', json, 'inshelfb', this);
  },
  inshelfb(data) {//加入书架回调
    if (data.code == 200) {//加入成功
      wx.showToast({
        title: '加入成功', icon: "none",duration:700
      })
      let shelfindex = this.data.shelfindex;//下标
      let parent = this.data.parent;
      let param = {};//单个赋值法
      param['list[' + parent+'].book_list[' + shelfindex + '].is_shelf'] = 1;//加入书架成功后=1
      this.setData(param);
      app.shelftabbat(1);//更新书架tabbar数量
    }
  },
  outshelf(e) {//移出书架
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
  outshelfb(data) {//移除回调
    if (data.code == 200) {
      wx.showToast({ title: '移除成功', icon: 'none',duration:700});
      let shelfindex = this.data.shelfindex;//下标
      let parent = this.data.parent;
      let param = {};//单个赋值法
      param['list[' + parent + '].book_list[' + shelfindex + '].is_shelf'] = 0;//移出书架成功后=0
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
  allin(e){
    if(wx.getStorageSync('token')===""){
      this.login();
      return false;
    }
    wx.showLoading({});
    let allin = e.currentTarget.id;
    let jiekou = "book/user/addBookshelf"
    if(allin==1){
      jiekou = "book/user/delBookshelf"
    }
    let json = app.token({ book_ids: this.data.book_ids });
    app.request(jiekou, 'POST', json, 'allinb', this);
  },
  allinb(data){
    wx.hideLoading();
    let is_shelf = 1-this.data.allin;
    wx.showToast({ title: data.msg, icon: 'none', duration: 700 });
    if (data.code === 200) {
      let list = this.data.list;
      list.forEach((res) => {
        res.book_list.forEach((item) => {
          item.is_shelf = is_shelf;
        })
      })
      let params = {}
      params['list'] = list;
      this.setData(params);
      this.setData({allin:1-this.data.allin});
    }
    if (data.code === 300 && data.msg ==="已在书架"){
      this.setData({ allin: 1 - this.data.allin });
    }
  },
  getdetail(e) {//去绘本详情页
    if (app.repeat(e.timeStamp) == false) { return; }
    let bookid = e.currentTarget.id;
    let date = this.data.date;
    wx.navigateTo({ url: '../detail/detail?bookid=' + bookid  });
  },
  login(){
    wx.navigateTo({url:'/pages/login/login'});
  }
})
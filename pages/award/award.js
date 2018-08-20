var app = getApp();
Page({
  onLoad(e) {
    this.setData({ id: e.award_id })
    this.getinfo();
  },
  onReachBottom() {
    console.log(this.data.nomore)
    if (this.data.nomore===true) {
      return false
    }
    this.setData({ page:this.data.page+1,bottomload: false });
    this.getlist();
  },
  data: {
    allin: 0,
    page: 1,
    mofenti: 1
  },
  getinfo(){
    let json = app.token({ award_id: this.data.id });
    app.request('book/index/award_info', 'POST', json, 'getinfob', this);
  },
  getinfob(data){
    this.setData({ info: data.data, language: data.data.language == 'all' ? 'ch' : data.data.language});
    this.getlist();
  },
  getlist() {
    console.log('award------------->'+this.data.id)
    console.log('page------------->'+this.data.page)
    console.log('language------------->'+this.data.language)
    let json = app.token({ award_id: this.data.id, page: this.data.page, language: this.data.language});
    app.request('book/index/award_book_list', 'POST', json, 'listb', this);
  },
  listb(data) {
    this.setData({ bottomload: true })
    if (data.code != 200) {
      return false
    }
    if (data.data.length<10){
      this.setData({ nomore:true});
    }
    let list = (this.data.list || []).concat(data.data);
    this.setData({ list: list })
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
    this.setData({ shelfindex: shelfindex });
    let book_id = e.currentTarget.dataset.book_id;//book_id;
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { book_ids: [book_id], token: token, user_id: user_id }
    app.request('book/user/addBookshelf', 'POST', json, 'inshelfb', this);
  },
  inshelfb(data) {//加入书架回调
    if (data.code == 200) {//加入成功
      wx.showToast({
        title: '加入成功', icon: "none", duration: 700
      })
      let shelfindex = this.data.shelfindex;//下标
      let param = {};//单个赋值法
      param['list[' + shelfindex + '].is_shelf'] = 1;//加入书架成功后=1
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
    this.setData({ shelfindex: shelfindex });
    let book_id = e.currentTarget.dataset.book_id;//book_id;
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { book_ids: book_id, token: token, user_id: user_id }
    app.request('book/user/delBookshelf', 'POST', json, 'outshelfb', this);
  },
  outshelfb(data) {//移除回调
    if (data.code == 200) {
      wx.showToast({ title: '移除成功', icon: 'none', duration: 700 });
      let shelfindex = this.data.shelfindex;//下标
      let param = {};//单个赋值法
      param['list[' + shelfindex + '].is_shelf'] = 0;//移出书架成功后=0
      this.setData(param);
      app.shelftabbat(-1);//更新书架tabbar数量
    }
  },
  allin(e) {
    if (wx.getStorageSync('token') === "") {
      this.login();
      return false;
    }
    wx.showLoading({});
    let allin = e.currentTarget.id;
    let jiekou = "book/user/addBookshelf"
    if (allin == 1) {
      jiekou = "book/user/delBookshelf"
    }
    let json = app.token({ book_ids: this.data.info.book_id_list });
    app.request(jiekou, 'POST', json, 'allinb', this);
  },
  allinb(data) {
    wx.hideLoading();
    let is_shelf = 1 - this.data.allin;
    wx.showToast({ title: data.msg, icon: 'none', duration: 700 });
    if (data.code === 200) {
      let list = this.data.list;
      list.forEach((res) => {
          res.is_shelf = is_shelf;
      })
      this.setData({list:list});
      this.setData({ allin: 1 - this.data.allin });
    }
    if (data.code === 300 && data.msg === "已在书架") {
      this.setData({ allin: 1 - this.data.allin });
    }
  },
  getdetail(e) {//去绘本详情页
    if (app.repeat(e.timeStamp) == false) { return; }
    let bookid = e.currentTarget.id;
    let date = this.data.date;
    wx.navigateTo({ url: '../detail/detail?bookid=' + bookid });
  },
  login() {
    wx.navigateTo({ url: '/pages/login/login' });
  },
  language(e){
    this.setData({
      language: e.target.id,
      page: 1, list:[],
      nomore: false
    });
    this.getlist();
  }
})
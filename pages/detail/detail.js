var app=getApp();
var formData = require('../../utils/util.js');
Page({
  onLoad(e){
    let pages = getCurrentPages();//页面栈
    if (pages.length === 1) {//分享进入
      this.setData({ _from: "2" })
    }
    this.setData({bookid:e.bookid});
    this.getdetail();
    app.getshelfnum(this);//借书架数量
    wx.showShareMenu({
      withShareTicket: true
    });
  },
  onShow(){
    this.leaveMessageList()
  },
  data:{
    currshelfnum:0,
    messageType: 0,       //留言类型，传给模板bookDetail
    leaveMessageList: [], //留言列表
  },
  getdetail(){
    let token = wx.getStorageSync('token');
    let user_id = "";
    if (token !== "") {//判断登陆状态
      user_id = wx.getStorageSync('userdata').user_id;
    }
    let _this = this;
    let bookid=this.data.bookid;
    app.request('book/index/detail', 'get', { token: token, user_id: user_id, book_id: bookid },
        'getDetailSuccess', _this);
  },
  getDetailSuccess(e) {
    let data=e.data;
//        console.log(data);
    if(e.code=='200'){
        data.img_main[0] = data.img_main[0].split('@')[0];
        for (let i = 0; i < data.imgs.length;i++){
            data.imgs[i] = data.imgs[i].split('@')[0];
        }
        //作者修改
        data.author=data.author.split(/;/i);
        this.setData({detail:data});
    }
  },
  add(e){   
    if (app.repeat(e.timeStamp) == false) { return; }
    let token = wx.getStorageSync('token');
    if (token===''){
      wx.navigateTo({url: '/pages/login/login'});
      return false;
    }
    let book_ids = [this.data.detail.book_id];
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('book/user/addBookshelf', 'POST', { token: token, user_id: user_id, book_ids: book_ids },
      'addb', this);
  },
  addb(data){
    if(data.code!=200){
      wx.showToast({ title: data.msg, icon: 'none', duration: 800 });
      return false;
    }
    wx.showToast({ title: '加入成功~', icon: 'none', duration: 800 });
    this.setData({ currshelfnum: parseInt(this.data.currshelfnum)+1});
    app.shelftabbat(1);
  },
  jieshujia(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.switchTab({ url: '/pages/shujia/shujia' })
  },
  kefu(){
    wx.showToast({ title: '频道暂未开通~',icon:'none'});
  },
  xilie(e){
    wx.redirectTo({ url: '/pages/index/series/series?series='+e.currentTarget.id})
  },
  onShareAppMessage: function () {
    return {
      title: "博鸟绘本，最新最全的儿童绘本租赁平台~",
      path: '/pages/detail/detail?bookid='+ this.data.bookid,
      success: function () {
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function () {
        wx.showToast({
          title: '转发失败',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  goshouye() {
    wx.reLaunch({
      url: '/pages/shouye/shouye',
    })
  },
  search(e){
    wx.navigateTo({//跳转到搜索结果页面
      url: '/pages/searchres/searchres?typearrindex=2&keywords=' + this.data.detail.author[e.currentTarget.id]
    })
  },
  //  查看全部评价
  lookAllMessage(e){
    console.log(e)
      let bookid = e.currentTarget.dataset.bookid
      wx.navigateTo({
          url: '/pages/detail/leaveMessage/leaveMessage?bookid=' + bookid
      })
  },
  //评价列表
  leaveMessageList(){
    let book_id = this.data.bookid;
    app.request('book/index/comment', 'get', { book_id: book_id },
        'leaveMessageListSuccess', this);
  },
  leaveMessageListSuccess(res){
    var data = res.data
    for(var i=0;i<data.length;i++){
        data[i]['czyTime'] = formData.dateTime2(data[i].comment_create_time*1000)
    }
    this.setData({
      leaveMessageList: data
    })
    console.log(JSON.stringify(this.data.leaveMessageList));
  },
})
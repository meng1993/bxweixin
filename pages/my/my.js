var json2 = require('../../json/json2.js');
var app=getApp();
Page({
  onLoad(){
    this.setData({ myicons: json2.myicons, mylists: json2.mylists, myactive: json2.myactive,});
    //this.setData({ 'mylists[1].text': '3张可用', 'mylists[2].text':'已认证'})//设置数组内部数据
  },
  onShow(){
    let token = wx.getStorageSync('token');
    if (token === ""){//判断登陆状态
      this.setData({ login: false, index: this.data.index + 1});
      if (this.data.index == 1) {
        wx.navigateTo({ url: '/pages/login/login' })
      }
    }else{
      this.setData({ login:true });
      this.zhima();
      app.getshelfnum();
      this.orderstatus();
      this.info();
      this.getEggNum();
      this.mycoupon();
    }
  },
  data:{
    login:false,
    avatarurl:"/img/shouye/logo.png",
    myicons:[],
    mylists:[],
    myactive:[],
    index:0,
    eggNum: 0,
    mycouponNum: 0
  },
  info(){
    let userdata = wx.getStorageSync('userdata');
    this.setData({ avatarurl: userdata.face, nickname: userdata.nickname});
  },
  login(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({ url: '../login/login'})
  },
  remove(){
    let _this=this;
    wx.showModal({
      title: '提示',
      content: '退出登录?',
      success(res){
        if(res.confirm){
          wx.removeStorageSync('token');
          wx.removeStorageSync('userdata');
          _this.onShow();
        }
      }
    })
  },
  list2(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    let id=e.currentTarget.id;
    if(id=='我的会员'){
      wx.navigateTo({ url: '/pages/home/mycard/mycard' })
    } else if (id == '优惠券'){
      wx.navigateTo({ url: '/pages/home/coupon/coupon' })
    } else if(id=='芝麻信用'){
      wx.navigateTo({ url: '/pages/home/zhima/zhima' })
    } else if (id == '收货地址') {
      wx.navigateTo({ url: '/pages/home/addresslist/addresslist?from=set' })
    } else if(id=='设置'){
      wx.navigateTo({ url: '/pages/set/set'})
    } else if (id == '宝贝书屋') {
      wx.navigateTo({ url: '/pages/shuwu/shuwu?from=my' })
    } else if (id == '砍价列表') {
      wx.navigateTo({ url: '/pages/kanjia/kanjiarecord/kanjiarecord' })
    }
    else if (id == '会员卡订单') {
      wx.navigateTo({ url: '/pages/cardorder/cardorder?id=wait&s=0' })
    }
    else if(id == '购买订单'){
        wx.navigateTo({ url: '/pages/diandu/order/order' })
    }
    else if(id == '共享图书订单'){
        wx.navigateTo({ url: '/pages/oldBookRecycling/orderList/orderList' })
    }
    else if(id == '赔偿订单') {
        wx.navigateTo({ url: '/pages/home/buyone/buyoneList/buyoneList' })
    }
  },
  orderstatus(){//获取订单状态
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('book/order/getOrderCount', 'POST', { token: token, user_id: user_id },'orderstatusb',this)
  },
  orderstatusb(data){
    if(data.code!=200){return}
    let myicons = this.data.myicons;
    data.data.forEach((item,index)=>{
      myicons[index + 1].num = item;
    })
    this.setData({ myicons: myicons})
  },
  order(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    let id=e.currentTarget.id;
    wx.navigateTo({url: '/pages/order/order?id='+id})
  },
  zhima(){//芝麻是否授权
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('index/zhima/getUserZMScore', 'POST', { user_id: user_id }, 'zhimab', this)
  },
  zhimab(data){
    let param = new Object();
    if (data.data.status && (data.data.status == "0" || data.data.status == "2")) {
      param['mylists[5].text'] = '去授权';
    } 
    else if (data.data.status && (data.data.status == "1")){
      param['mylists[5].text'] = '已授权'
    }
    this.setData(param);
  },
  babyinfo(){
    wx.navigateTo({url:'/pages/babyinfo/babyinfo'})
  },
  news(){
    wx.navigateTo({ url: '/pages/news/news' })
  }, 
  myactive(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    let id = e.currentTarget.id;
    if (id == '砍价') {
      wx.navigateTo({ url: '/pages/kanjia/kanjiarecord/kanjiarecord' })
    } else if (id == '拼团') {
      wx.navigateTo({ url: '/pages/pintuan/mylist/mylist' })
    } else if (id == '助力') {
      wx.navigateTo({ url: '/pages/zhuli/mylist/mylist' })
    } else if (id == '宝贝书屋') {
      // wx.navigateTo({ url: '/pages/home/coupon/coupon' })
      wx.navigateTo({ url: '/pages/shuwu/shuwu?from=my' })
    }
  },
  myinfo(){
    wx.navigateTo({url:"/pages/myinfo/myinfo"})
  },
  toEggs(){
    wx.navigateTo({
        url: '/pages/oldBookRecycling/wallet/wallet'
    })
  },
  toDiscount(){
    wx.navigateTo({
        url: '/pages/home/coupon/coupon'
    })
  },
  getEggNum(){
      let token=wx.getStorageSync('token');
      let user_id=wx.getStorageSync('userdata').user_id;
      //书筐中书的总数
      app.request('book/reclaim/my_reclaim_record', 'POST', { token: token,user_id:user_id, page: 1, pagesize: 1 },
          'getEggNumSuccess', this);
  },
  getEggNumSuccess(res){
    console.log('1111111111111111------------->'+JSON.stringify(res))
      this.setData({
          eggNum: res.data.user_info.score
      })
  },


  mycoupon(e){//获取优惠卷
      let token = wx.getStorageSync('token');
      let user_id = wx.getStorageSync('userdata').user_id;
      app.request('index/coupon/coupon_num', 'POST', { token: token, userId: user_id },'mycouponSuccess',this)
  },
  mycouponSuccess(res){
    console.log('优惠券-----------》'+JSON.stringify(res))
    this.setData({
      mycouponNum: res.data.coupon_num
    })
  }
})
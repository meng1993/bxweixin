var app=getApp();
Page({
  onLoad(e){
    this.setData({ order_id:e.order_id});
    this.detail();
  },
  data:{

  },
  detail(){
    let token=wx.getStorageSync('token');
    let user_id=wx.getStorageSync('userdata').user_id;
    let order_id = this.data.order_id;
    let json = { token: token, user_id: user_id, order_id: order_id}
//    console.log(json)
    app.request('book/order/orderDetail','GET',json,'detailb',this);
  },
  detailb(data){
   console.log('7777777777777------------->'+JSON.stringify(data));
    data=data.data;
    data.rent_start_time = app.shijianchuo(data.rent_start_time);
    data.rent_end_time = app.shijianchuo(data.rent_end_time);
    data.order_generation_time = app.shijianchuo2(data.order_generation_time);
    data.order_pay_time = app.shijianchuo2(data.order_pay_time);
    data.order_shipping_time = app.shijianchuo2(data.order_shipping_time);
    data.order_delivery_time = app.shijianchuo2(data.order_delivery_time);
    data.books.forEach((item2, index) => {//图片地址
      item2.img_medium = item2.img_medium.split('@')[0];
    })
    this.setData({data:data})
  },
  gozhanshi(e) {//展示列表
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.setStorageSync('bookorder',this.data.data.books);
    wx.navigateTo({ url: '/pages/shelf/zhanshi/zhanshi' })
  },
  pay(e) {//待付款=>支付
    wx.showLoading();
    let order_sn = e.currentTarget.id;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let openid = wx.getStorageSync('openid')
    let json = { userId: user_id, token: token, orderSn: order_sn, payMethod: 5, openId: openid, "type": 1 }
    app.request('pay/jsapi/cardPay', 'POST', json, 'payb', this)
    //    console.log(json);
  },
  payb(data) {
    wx.hideLoading();
    if (data.code && data.code == 300) {
      wx.showToast({ title: data.msg, mask: true, duration: 1000, icon: 'none' });
      return false
    }
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': data.signType,
      'paySign': data.paySign,
      success(e) {
        wx.hideLoading();
        wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
        setTimeout(() => {
          wx.navigateBack({ delta: 1 })
        }, 1000)
      },
      fail(e) {
        //        console.log(e);
        wx.hideLoading();
        wx.showToast({ title: '支付取消', mask: true, duration: 1000, icon: 'none' });
        setTimeout(() => {
          wx.navigateBack({ delta: 1 })
        }, 1000)
      }
    })
  },
  tixingfahuo(e) {//提醒发货
    wx.showLoading();
    let order_id = e.currentTarget.id;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { order_id: order_id, token: token, user_id: user_id, "type": 1 }
    app.request('book/message/subOrderMsg', 'POST', json, 'tixingfahuob', this)
  },
  tixingfahuob(data) {
    wx.hideLoading();
    app.tishi('提醒发货', '提醒成功，会尽快为您发货~')
  },
  querenshouhuo(e) {//确认收货
    let _this = this;
    wx.showModal({
      title: '收货',
      content: '确认已收到绘本？',
      cancelText: '还没有',
      confirmText: '已收到',
      success(res) {
        if (res.confirm) {
          wx.showLoading();
          let order_id = e.currentTarget.id;
          let token = wx.getStorageSync('token');
          let user_id = wx.getStorageSync('userdata').user_id;
          let json = { order_id: order_id, token: token, user_id: user_id }
          app.request('book/order/orderreceipt', 'POST', json, 'querenshouhuob', _this)
        }
      }
    })
  },
  querenshouhuob(data) {
    wx.hideLoading();
    if (data.code != 200) {
      return false;
    }
    wx.showToast({ title: data.msg, icon: 'success', mask: true, duration: 1000 });
    this.houtui('7','5','6');
  },
  wuliu(e) {//去查看物流
//    console.log(e);
    if (app.repeat(e.timeStamp) == false) { return; }
    let a = e.currentTarget.dataset.a;
    let b = e.currentTarget.dataset.b;
    let c = e.currentTarget.dataset.c;
    let d = e.currentTarget.dataset.d;
    wx.navigateTo({ url: '/pages/home/getwuliu/getwuliu?a=' + a + '&b=' + b + '&c=' + c +'&d='+d})
  },
  guihuan(e) {//去预约快递页面
    if (app.repeat(e.timeStamp) == false) { return; }
    let order_id = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/index/yuyue/yuyue?order_id=' + order_id })
  },
  guihuanzhong(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    let order_id = e.currentTarget.id;
    let index = e.currentTarget.dataset.index;
    wx.setStorageSync('guihuanzhong', this.data.lists[index].express_order.start_time)
    wx.navigateTo({ url: '/pages/index/yuyue/yuyue?order_id=' + order_id + '&from=zhong' })
  },
  tixingjiesuan(e) {//提示结算
    wx.showLoading();
    let order_id = e.currentTarget.id;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { order_id: order_id, token: token, user_id: user_id, "type": 2 }
    app.request('book/message/subOrderMsg', 'POST', json, 'tixingjiesuanb', this)
  },
  tixingjiesuanb(data) {
    wx.hideLoading();
    app.tishi('提醒结算', '提醒成功，会尽快为您结算~')
  },
  deleteorder(e) {//删除未支付订单
    wx.showLoading();
    let order_id = e.currentTarget.id;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { order_id: order_id, token: token, user_id: user_id }
    app.request('book/order/orderDel', 'POST', json, 'deleteorderb', this)
  },
  deleteorderb(data) {
    wx.hideLoading();
    if (data.code != 200) { return false }
    wx.showToast({title: data.msg,icon:'success',mask:true,duration:1000});
   // this.setData({ lists: [], page: 1 })
    this.houtui();
  },
  houtui(index = '', swiperindex='',_index=''){//订单状态，swiper位置，高亮下标
    let pages = getCurrentPages();//页面栈
    var prevPage = pages[pages.length - 2];//上一页Page对象
    prevPage.setData({ lists: [], page: 1 });
    if(index!=''){
      prevPage.setData({ checked:index });
    }
    if (swiperindex!=''){
      prevPage.setData({ swiperindex: swiperindex });
    }
    if (_index!=''){
      prevPage.setData({ _index: _index });
    }
//    console.log(index)
    prevPage.getorder();
    setTimeout(() => {   
      wx.navigateBack({ delta: 1 })
    }, 1000)  
  },
  quxiaoorder(e) {//取消已生效的订单
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '您确定要取消该订单吗？',
      cancelText: '再想想',
      success(res) {
        if (res.confirm) {
          wx.showLoading();
          let order_id = e.currentTarget.id;
          let token = wx.getStorageSync('token');
          let user_id = wx.getStorageSync('userdata').user_id;
          let json = { order_id: order_id, token: token, user_id: user_id }
          app.request('book/order/orderCancel', 'POST', json, 'quxiaoorderb', _this)
        }
      }
    })
  },
  quxiaoorderb(data) {//取消订单
    wx.hideLoading();
//    console.log(data)
    if (data.code != 200) {
      app.tishi('提示', data.msg)
      return false
    }
    wx.showToast({ title: data.msg, icon: 'success', mask: true, duration: 1000 });
    // this.setData({ lists: [], page: 1 })
    this.houtui('0','0','0');
  },
  tuikuai(e){//退款
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '您确定要退款吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading();
          let order_id = e.currentTarget.id;
          let token = wx.getStorageSync('token');
          let user_id = wx.getStorageSync('userdata').user_id;
          let json = { order_id: order_id, token: token, user_id: user_id,reason: '排错/多拍/不想要'}
          app.request('book/order/refund', 'POST', json, 'tuikuaib', _this)
        }
      }
    })
  },
  tuikuaib(data){//退款回调
    wx.hideLoading();
    if (data.code != 200) {
      app.tishi('提示', data.msg)
      return false
    }
    wx.showToast({ title: data.msg, icon: 'success', mask: true, duration: 1000 });
    // this.setData({ lists: [], page: 1 })
    this.houtui('11','5','7');
  },
  pingjia(){
    let order_id = this.data.data.order_id;
    wx.redirectTo({ url: '/pages/home/pingjia/pingjia?order_id=' + order_id});
  },
  buyone(e){
    let order_id = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/home/buyone/buyone?order_id=' + order_id });
  },
  phone(){
    wx.makePhoneCall({
      phoneNumber: '0571-86113050' 
    })
  },
  toOrderDetail(e){
    console.log(e)
      let id = e.currentTarget.dataset.id
      wx.navigateTo({
          url: '/pages/oldBookRecycling/orderDetail/orderDetail?id='+id
      })
  },
})
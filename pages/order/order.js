var app=getApp();
Page({
  onLoad(e){   
    app.judgelogin();
//    console.log(e);
    let swiperindex=e.id;
    let _index=e.id//滑动块下标
    if (swiperindex>5){//swiper移动,超过5移动到5
      swiperindex=5;
    }
    if(e.id==6){//status
      e.id=7;
    }
    else if(e.id==7){//status
      e.id=11;
    }
    this.setData({ checked: e.id, swiperindex: swiperindex, _index: _index});
    this.getorder(); 
  },
  onPullDownRefresh(){
    wx.stopPullDownRefresh();
    this.setData({ page: 1,lists:[]});
    this.getorder();
  },
  onReachBottom(){
    if (this.data.havemore==false||this.data.loading==true){//没有更多了|请求中
      return false
    }
    this.setData({page:this.data.page+1});
    this.getorder();
  },
  data:{
    page:1,
    checked:0,
    titles: [{ a: '全部订单', b: "0" }, { a: '待付款', b: "1" }, { a: '待发货', b: "2" }, { a: '待收货', b: "3" }, { a: '待归还', b: "4" }, { a: '待结算', b: "5" }, { a: '待评价', b: "7" }, { a: '退款/退货', b: "11"}],
    lists:[],
    emptyContent: '该数据为空'
  },
  getorder(){
    this.setData({loading:true});//请求中
    let order_status = this.data.checked;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let page = this.data.page;
    let json = {
      token: token, user_id: user_id, page: page, order_status: order_status
    }
    wx.showLoading({title:'加载中...'});
    app.request('book/order/orderList', 'GET', json, 'getb', this)
  },
  getb(data){
    //console.log(data)
    wx.hideLoading();
    this.setData({loading:false});//请求完成
    if(data.code!=200){
      return false;
    }
    if(data.data.length==0){
      wx.showToast({title: '暂无记录',duration:1500,icon:'none'})
      return false;
    }else if(data.data.length<10){
      this.setData({havemore:false})
    }
    let lists=this.data.lists;
    data.data.forEach((item,index)=>{//解时间戳
      item.rent_start_time = app.shijianchuo(item.rent_start_time);
      item.rent_end_time = app.shijianchuo(item.rent_end_time);
      if (item.invalid_time){
        item.invalid_time = app.shijianchuo(item.invalid_time);
      }
      item.books.forEach((item2, index) => {//图片地址
        item2.img_medium = item2.img_medium.split('@')[0];
      })
    })
//    console.log(data.data);
    lists=lists.concat(data.data);   
    this.setData({lists:lists});
  },
  change(e){//换状态搜索
    this.setData({ checked: e.currentTarget.id, lists: [], page: 1, _index: e.currentTarget.dataset.index})
    this.getorder();
  },
  pay(e){//待付款=>支付
    wx.showLoading();
    let order_sn=e.currentTarget.id;
    let token=wx.getStorageSync('token');
    let user_id=wx.getStorageSync('userdata').user_id;
    let openid=wx.getStorageSync('openid')
    let json = { userId: user_id, token: token, orderSn: order_sn, payMethod: 5, openId:openid,"type":1}
    app.request('pay/jsapi/cardPay', 'POST', json,'payb',this)
//    console.log(json);
  },
  payb(data){
    wx.hideLoading();
    if(data.code&&data.code==300){
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
        wx.showToast({ title: '支付取消', mask: true, duration: 1000,icon:'none'});
        setTimeout(() => {
          wx.navigateBack({ delta: 1 })
        }, 1000)
      }
    })
  },
  tixingfahuo(e){//提醒发货
    wx.showLoading();
    let order_id = e.currentTarget.id;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { order_id: order_id, token: token, user_id: user_id,"type":1 }
    app.request('book/message/subOrderMsg', 'POST', json, 'tixingfahuob', this)
  },
  tixingfahuob(data){
    wx.hideLoading();
    app.tishi('提醒发货','提醒成功，会尽快为您发货~')
  },
  querenshouhuo(e){//确认收货
    let _this=this; 
    wx.showModal({
      title: '收货',
      content: '确认已收到绘本？',
      cancelText:'还没有',
      confirmText:'已收到',
      success(res){
        if(res.confirm){
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
  querenshouhuob(data){
    wx.hideLoading();
    if(data.code!=200){
      return false;
    }
    wx.showToast({title: '收货成功',icon:'none'});
    this.setData({lists: [], page: 1})
    this.getorder();
  },
  wuliu(e){//去查看物流
    if (app.repeat(e.timeStamp) == false) { return; }
    let a=e.currentTarget.dataset.a;
    let b = e.currentTarget.dataset.b;
    let c = e.currentTarget.dataset.c;
    let d = e.currentTarget.dataset.d;
    wx.navigateTo({url: '/pages/home/getwuliu/getwuliu?a='+a+'&b='+b+'&c='+c+'&d='+d})
  },
  guihuan(e){//去预约快递页面
    if (app.repeat(e.timeStamp) == false) { return; }
    let order_id=e.currentTarget.id;
    wx.navigateTo({ url: '/pages/index/yuyue/yuyue?order_id=' + order_id})
  },
  guihuanzhong(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    let order_id = e.currentTarget.id;
    let index = e.currentTarget.dataset.index;
   console.log(this.data.lists[index]);
    wx.setStorageSync('guihuanzhong', this.data.lists[index].express_order.start_time)
    wx.navigateTo({ url: '/pages/index/yuyue/yuyue?order_id=' + order_id+'&from=zhong' })
  },
  tixingjiesuan(e){//提示结算
    wx.showLoading();
    let order_id = e.currentTarget.id;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { order_id: order_id, token: token, user_id: user_id, "type": 2 }
    app.request('book/message/subOrderMsg', 'POST', json, 'tixingjiesuanb', this)
  },
  tixingjiesuanb(data){
    wx.hideLoading();
    app.tishi('提醒结算', '提醒成功，会尽快为您结算~')
  },
  deleteorder(e){//删除未支付订单
    wx.showLoading();
    let order_id = e.currentTarget.id;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { order_id: order_id, token: token, user_id: user_id}
    app.request('book/order/orderDel', 'POST', json, 'deleteorderb', this)
  },
  deleteorderb(data){
    wx.hideLoading();
    if(data.code!=200){return false}
    app.tishi('提示','订单删除成功!');
    this.setData({ lists: [], page: 1 })
    this.getorder();
  },
  quxiaoorder(e){//取消已生效的订单
    let _this=this;
    wx.showModal({
      title: '提示',
      content: '您确定要取消该订单吗？',
      cancelText:'再想想',
      success(res){
        if(res.confirm){
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
  quxiaoorderb(data){
    wx.hideLoading();
    if (data.code != 200) { 
      app.tishi('提示',data.msg)
      return false 
    }
    app.tishi('提示', '取消订单成功!');
    this.setData({ lists: [], page: 1 })
    this.getorder();
  },
  orderd(e){
    let order_id=e.currentTarget.id;
    wx.navigateTo({ url: '/pages/orderd/orderd?order_id=' + order_id});
  },
  pingjia(e) {
    let order_id = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/home/pingjia/pingjia?order_id=' + order_id });
  },
  xuzu(e){
    let order_id = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/home/xuzu/xuzu?order_id=' + order_id });
  },
  buyone(e) {
    let order_id = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/home/buyone/buyone?order_id=' + order_id });
  }
})
var app = getApp();
Page({
  onLoad(e) {
    app.judgelogin();
    let _index = e.s//滑动块下标
    this.setData({ checked: e.id || "wait", swiperindex: 0, _index: _index || 0 });
  },
  onShow(){
    this.setData({ lists: [], page: 1 })
    this.getorder();
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
    this.setData({ page: 1, lists: [] });
    this.getorder();
  },
  onReachBottom() {
    if (this.data.havemore == false || this.data.loading == true) {//没有更多了|请求中
      return false
    }
    this.setData({ page: this.data.page + 1 });
    this.getorder();
  },
  data: {
    page: 1,
    checked: "wait",
    titles: [{ a: '待付款', b: "wait" }, { a: '已支付', b: "payed" }, { a: '已取消', b: "cancel" }],
    lists: []
  },
  refresh(checked = 0){
    if (checked!==0){
      this.setData({ checked: checked})
    }
    this.setData({ page: 1, lists: [], havemore :true});
    this.getorder();
  },
  getorder() {
    this.setData({ loading: true });//请求中
    let status = this.data.checked;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let page = this.data.page;
    let json = {
      token: token, user_id: user_id, page: page, status: status
    }
    wx.showLoading({ title: '加载中...' });
    app.request('book/card/card_order_list', 'POST', json, 'getb', this)
  },
  getb(data) {
    //console.log(data)
    wx.hideLoading();
    this.setData({ loading: false });//请求完成
    if (data.code != 200) {
      return false;
    }
    if (data.data.length == 0) {
      wx.showToast({ title: '暂无记录', duration: 1500, icon: 'none' })
      return false;
    } else if (data.data.length < 10) {
      this.setData({ havemore: false })
    }
    let lists = this.data.lists;
    data.data.forEach((item, index) => {//解时间戳
      item.create_time = app.shijianchuo3(item.create_time);
      item.effect_time = app.shijianchuo(item.effect_time);
      if (item.invalid_time) {
        item.invalid_time = app.shijianchuo(item.invalid_time);
      }
    })
    //    console.log(data.data);
    lists = lists.concat(data.data);
    this.setData({ lists: lists });
  },
  change(e) {//换状态搜索
    this.setData({ checked: e.currentTarget.id, lists: [], page: 1, _index: e.currentTarget.dataset.index,
      havemore:true})
    this.getorder();
  },
  pay(e) {//待付款=>支付
    wx.showLoading();
    let order_sn = e.currentTarget.id;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let openid = wx.getStorageSync('openid')
    let json = { userId: user_id, token: token, orderSn: order_sn, payMethod: 5, openId: openid, "type": 2 }
    app.request('pay/jsapi/cardPay', 'POST', json, 'payb', this)
    let group_id = e.currentTarget.dataset.group_id;
    let card_id = e.currentTarget.dataset.card_id;
    this.setData({ group_id: group_id, order_sn: order_sn, card_id: card_id});
  },
  payb(data) {
    wx.hideLoading();
    if (data.code && data.code == 300) {
      wx.showToast({ title: data.msg, mask: true, duration: 1000, icon: 'none' });
      return false
    }
    let _this = this;
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': data.signType,
      'paySign': data.paySign,
      success(e) {
        wx.hideLoading();
        wx.showToast({ title: '购买成功！', icon: 'success', mask: true, duration: 1000 });
        _this.setData({ checked: "payed", _index:1});
        if (_this.data.group_id === "" || _this.data.group_id === null) {//不是拼团，模板消息
          app.formid(_this.data.form_id, _this.data.order_sn, "form", "card", _this.data.card_id);
        } else {//拼团
          app.formid(data.package, _this.data.order_sn, "pay", "card", _this.data.card_id);
        }
      },
      fail(e) {
        //        console.log(e);
        wx.hideLoading();
        wx.showToast({ title: '支付取消', mask: true, duration: 1000, icon: 'none' });
      }
    })
  },
  formid(e) {
    this.setData({ form_id: e.detail.formId })
  },
  deleteorder(e) {//删除未支付订单
    wx.showLoading();
    let id = e.currentTarget.id;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { user_card_id: id, token: token, user_id: user_id }
    app.request('book/card/card_order_delete', 'POST', json, 'deleteorderb', this)
  },
  deleteorderb(data) {
    wx.hideLoading();
    if (data.code != 200) { return false }
    app.tishi('提示', '订单删除成功!');
    this.refresh();
  },
  orderd(e) {
    let order_id = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/cardorderd/cardorderd?order_id=' + order_id });
  },
})
var app = getApp();
var Interval;
Page({
  onLoad(e) {
    wx.showLoading({ mask: true });
    this.setData({ e: e });
    //  e.from = 'share';
    //  e.user_bargain_id = '157';
    if (e.from === "my") {
      this.setData({ user_bargain_id: e.user_bargain_id });
      this.detail2();
    }
    else if (e.from === "share") {
      this.setData({ user_bargain_id: e.user_bargain_id });
      this.detail2();
    }
    let pages = getCurrentPages();//页面栈
    if (pages.length === 1) {//分享进入
      this.setData({ xcxpages1: true })
    }
  },
  onShow() {
    if (this.data.onshow == 1 && this.data.from != "list") {//刷新页面
      this.onLoad(this.data.e);
    }
    this.setData({ onshow: 1, user_id: wx.getStorageSync('userdata').user_id || ""});
  },
  data: {
    onshow: 0,
    list1: [{ t: "助砍好友", v: "1" }, { t: "奖品说明", v: "2" }, { t: "活动规则", v: "3" }],
    list1c: "1",
  },
  onShareAppMessage() {
    let id = this.data.user_bargain_id;
    return {
      title: this.data.items.title,
      imageUrl: 'https://m.zujiekeji.cn/xcximg/xcxkanjia/kanjiashare.png?a=3',
      path: '/pages/kanjia/info/info?user_bargain_id=' + id + '&from=share',
    }
  },
  detail() {//未开单
    let json = {
      user_id: wx.getStorageSync('userdata').user_id || "",
      token: wx.getStorageSync('token'),
      bargain_id: this.data.bargain_id
    }
    app.request('book/bargain/bargain_initiate', 'POST', json, 'detailb', this)
  },
  detailb(data) {
    if (data.code != 200) {
      wx.hideLoading();
      app.tishi('提示', data.msg);
      return false
    }
    let daojishi = data.data.surplus_time >= 0 ? data.data.surplus_time : 0;
    this.setData({
      items: data.data, daojishi: daojishi,
      yuanjia: parseFloat(data.data.old_price),
      dijia: parseFloat(data.data.floor_price) || 0,
      card: data.data.card
    });
    if (daojishi > 0 && this.data.startjishi != 1) {
      this.setData({ startjishi: 1 });
      this.daojishi();
    }
    //if (data.data.judge.is_enjoy=="0"){
    this.getlist();
    //}
    wx.hideLoading();
  },
  detail2() {//从我的记录里来
    let json = {
      user_id: wx.getStorageSync('userdata').user_id || "",
      token: wx.getStorageSync('token') || "",
      user_bargain_id: this.data.user_bargain_id
    }
    app.request('book/bargain/bargain_link', 'POST', json, 'detail2b', this);
  },
  detail2b(data) {//从我的记录里来 回调
    if (data.code != 200) {
      wx.hideLoading();
      app.tishi('提示', data.msg);
      return false
    }
    if (data.data.judge.is_owner == 1) {
      this.setData({ "from": "my" })
      this.getlist();
    } else {
      this.setData({ "from": "share" })
    }
    let show = data.data.bargain_show;//展示信息
    show.start_time = app.shijianchuo2(show.start_time);
    let daojishi = show.surplus_time >= 0 ? show.surplus_time : 0;
    this.setData({
      items: show, daojishi: daojishi,
      yuanjia: parseFloat(show.old_price), dangqianjia: parseFloat(show.price) || 0,
      dijia: parseFloat(show.floor_price) || 0, owner_phone: data.data.owner_phone || ""
    })
    if (daojishi > 0 && this.data.startjishi != 1) {
      this.setData({ startjishi: 1 });
      this.daojishi();
    } else {
      this.setData({ day: 0, hours: 0, minute: 0, time: 0 });
    }
    let hot_bargain = data.data.hot_bargain;
    for (let i = 0; i < hot_bargain.length; i++) {
      hot_bargain[i].floor_price = parseInt(hot_bargain[i].floor_price)
    }
    this.setData({
      bangkanlist: data.data.bargain_aid, judge: data.data.judge,
      hot_bargain: hot_bargain, card: data.data.card
    })//帮砍列表,推荐
    wx.hideLoading();
  },
  getlist() {//我的当前类其它砍价单
    let user_id = wx.getStorageSync('userdata').user_id || "";
    let token = wx.getStorageSync('token') || "";
    let id = this.data.user_bargain_id || "";
    let bargain_id = this.data.bargain_id || "";
    app.request('book/bargain/detail_for_owner', 'POST', {
      user_id: user_id, token: token, user_bargain_id: id,
      bargain_id: bargain_id
    }, 'getlistb', this)
  },
  getlistb(data) {
    for (let i = 0; i < data.data.length; i++) {
      let h = Math.floor(data.data[i].surplus_time / 3600);
      let m = Math.floor((data.data[i].surplus_time % 3600) / 60);
      data.data[i].shengyu = h + '小时' + m + '分';
      data.data[i].floor_price = parseInt(data.data[i].floor_price)
    }
    this.setData({ list: data.data });
  },
  daojishi() {//倒计时
    let _this = this;
    Interval = setInterval(() => {
      if (_this.data.daojishi <= 0) {
        clearInterval(Interval);
      }
      _this.setData({
        hours: Math.floor(_this.data.daojishi / 3600),
        minute: Math.floor((_this.data.daojishi % (3600)) / 60),
        time: Math.floor(_this.data.daojishi % (60)),
        daojishi: _this.data.daojishi - 1
      })
    }, 1000)
  },
  kanjia() {//发起新单
    let token = wx.getStorageSync('token');
    if (token === "") {
      wx.navigateTo({ url: '/pages/login/login' });
      return false
    }
    let json = {
      token: token,
      user_id: wx.getStorageSync('userdata').user_id,
      bargain_id: this.data.bargain_id
    }
    app.request('book/bargain/create_user_bargain', 'POST', json, 'kanjiab', this)
  },
  kanjiab(data) {//发起新单回调
    if (data.code == 400) {
      wx.showModal({
        title: '提示',
        content: data.msg,
        showCancel: false,
        success(res) {
          wx.redirectTo({ url: '/pages/kanjia/kanjiarecord/kanjiarecord' })
        }
      })
    } else if (data.code == 200) {
      wx.showToast({
        title: data.msg, icon: 'success', duration: 800, mask: true
      })
      let user_bargain_id = data.data.user_bargain_id;
      setTimeout(() => {
//        wx.redirectTo({ url: '/pages/kanjia/detail/detail?bargain_id=' + user_bargain_id + '&from=my' })
      }, 800)
    } else {
      app.tishi('提示', data.msg);
    }

  },
  share() {//分享按钮
    this.setData({ share: true, otherid: 0 });
  },
  othershare(e) {//其它条分享按钮
    this.setData({ share: true, otherid: e.currentTarget.id });
  },
  closeshare() {
    this.setData({ share: false })
  },
  tuijianwei(e) {//推荐列表
    let bargain_id = e.currentTarget.id;
    wx.redirectTo({ url: '/pages/kanjia/detail/detail?user_bargain_id=' + bargain_id + '&from=list' })
  },
  getPhoneNumber(e) {//帮朋友砍价
    let token = wx.getStorageSync('token');
    if (!e.detail.iv) {//点了拒绝，无操作
      return false;
    }
    if (token === "") {//没登陆的      
      let json = {
        iv: e.detail.iv, encryptedData: e.detail.encryptedData,
        session_key: wx.getStorageSync('session_key')
      }
      app.request('index/user/show_user_phone', 'POST', json, 'getPhoneNumberb', this);
    } else {//已登陆的
      this.bangkanjia();//帮砍价
    }
  },
  getPhoneNumberb(data) {//获取手机号回调
    let json = {
      user_phone: JSON.parse(data.data).phoneNumber,
      openid: wx.getStorageSync('openid'),
      form_id: this.data.form_id||""
    }
    app.request('index/user/wx_accredit_login', 'POST', json, 'denglub', this);
  },
  denglub(data) {//登录||注册并登录
//    console.log(data);
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    wx.setStorageSync('userdata', data.data);
    wx.setStorageSync('token', data.data.token);
    this.setData({ user_id: data.data.user_id});
    this.detail2();//刷新
    this.bangkanjia();//登录成功，帮砍价
  },
  bangkanjia() {//点击帮砍价
    let json = {
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id,
      user_bargain_id: this.data.user_bargain_id
    }
    app.request('book/bargain/let_us_bargain', 'POST', json, 'bangkanjiab', this);
  },
  bangkanjiab(data) {//帮砍回调
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false;
    }
    this.setData({ kanchenggong: true, kanprice: data.data.price });
    this.detail2();//刷新
    let _this = this;
    setTimeout(() => {
      _this.setData({ kanchenggong: false });
    }, 1000)
  },
  goshouye() {
    wx.reLaunch({
      url: '/pages/shouye/shouye',
    })
  },
  buy() {//优惠||底价买
    let card = this.data.card;
    card.price = this.data.dangqianjia;
    card.olddeposit = card.deposit;
    wx.setStorageSync('buycard', card);
    wx.navigateTo({ url: '/pages/home/paycard/paycard?from=kanjia&user_bargain_id=' + this.data.user_bargain_id })
  },
  buy2(e) {
    let index = e.currentTarget.id;
    let card = this.data.list[index].card_info;
    card.olddeposit = card.deposit;
    card.price = this.data.list[index].price;
    let user_bargain_id = this.data.list[index].user_bargain_id;
    wx.setStorageSync('buycard', card);
    wx.navigateTo({ url: '/pages/home/paycard/paycard?from=kanjia&user_bargain_id=' + user_bargain_id })
  },
  yuanjiabuy() {//原价买
    let card = this.data.card;
    card.olddeposit = card.deposit;
    wx.setStorageSync('buycard', card);
    wx.navigateTo({ url: '/pages/home/paycard/paycard?from=kanjia' })
  },
  yuanjiabuy2(e) {//原价买
    let index = e.currentTarget.id;
    let card = this.data.list[index].card_info;
    card.olddeposit = card.deposit;
    wx.setStorageSync('buycard', card);
    wx.navigateTo({ url: '/pages/home/paycard/paycard?from=kanjia' })
  },
  savephoto() {//存图
    let id = this.data.user_bargain_id;
    if (this.data.otherid != 0) {//其它单分享
      id = this.data.otherid;
    }
    wx.navigateTo({
      url: '/pages/group/savephoto/savephoto?from=kanjia&id=' + id,
    })
  },
  wanfa() {
    wx.navigateTo({ url: '/pages/kanjia/wanfa/wanfa' })
  },
  elsekanjia(e) {//我的其它砍价单
    let id = e.currentTarget.id;
    wx.redirectTo({ url: '/pages/kanjia/info/info?from=my&user_bargain_id=' + id })
  },
  bangkanchuang(e) {//帮砍窗
    let index = e.currentTarget.id;
    let blist = this.data.list[index].aid_list;
    if (blist.length == 0) {
      wx.showToast({ title: '暂无帮砍记录', icon: 'none', duration: 800 });
      return false
    }
    this.setData({ blist: blist, showblist: true });
  },
  zudang() { },
  closeblist() {
    this.setData({ showblist: false });
  },
  record() {
    wx.navigateTo({ url: '/pages/kanjia/kanjiarecord/kanjiarecord' })
  },
  list1(e){
    this.setData({list1c:e.currentTarget.id});
  },
  otherfaqi(){
    wx.navigateTo({ url: '/pages/kanjia/detail/detail?from=list&bargain_id=' + this.data.items.bargain_id})
  },
  formid(e) {
    this.setData({ form_id: e.detail.formId })
  }
})
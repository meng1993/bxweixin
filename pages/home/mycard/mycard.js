var app = getApp();
Page({
  onLoad(e) {
    this.setData({ e: e });
    app.judgelogin();
    let token = wx.getStorageSync('token');
    wx.showLoading();
    if (e.from && e.from == 'orderinfo') {//订单来看我的可用计划
      if (e.num) {
        this.setData({ num: e.num });
      }
      this.setData({ _from: 'orderinfo' })
      this.getcard2();
    } else {//正常看我的计划
      this.getcard();
    }
  },
  buynewcard() {//买卡成功刷新本页
    this.setData({ _from: "" })
    this.onLoad(this.data.e);
  },
  data: {
    _from: "",
    num: 0
  },
  getcard() {
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('book/user/myPlan', 'GET', { token: token, user_id: user_id, version: '2.1.0' }, 'getcardb', this)
  },
  getcard2() {
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let book_num = 0;
    if (this.data.num === 0) {//orderinfo
      book_num = wx.getStorageSync('bookorder').length;
    } else {//xuzu
      book_num = this.data.num;
    }
    app.request('book/user/myValidCards', 'GET', {
      token: token, user_id: user_id
      , book_num: book_num, version: '2.0.1'
    }, 'getcardb', this)
  },
  getcardb(data) {
    console.log(JSON.stringify(data));
    wx.hideLoading();
    if (data.code != 200) {
      return false;
    }
    if (this.data._from == 'orderinfo') {
      data.data = data.data.cards;
    }
    if (data.data.length == 0) {//没有计划
      this.setData({ wujihua: true })
      return false;
    }
    let lists1 = new Array();
    let lists2 = new Array();
    data.data.forEach((item, index) => {
      // item.keyongtian = Math.ceil((item.invalid_time - item.effect_time)/3600/24);
      item.daoqi = app.shijianchuo(item.invalid_time)
      if (item.status == 1 || item.status == 11) {
        lists1.push(item);
      } else {
        lists2.push(item);
      }
    })
    this.setData({ lists1: lists1, lists2: lists2, wujihua: false })
  },
  chosecard(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    if (this.data._from != 'orderinfo') {//查看卡详情,不是订单中选卡
      this.gocarddetail(e.currentTarget.id);
      return false;
    }
    let index = e.currentTarget.id;
    let cardid = 0;
    let name = '';
    let leaseday = 30;
    let leaseDayText = "共计30天"
    if (index == 'no') {//不使用会员计划，
      name = '不使用会员计划';
    } else {
      //无限次卡已买两单
      if (this.data.lists1[index].use_status != undefined && this.data.lists1[index].use_status == 0) {
        let starttime = this.data.lists1[index].effect_time;
        let nowtime = new Date().getTime() / 1000;
        if (nowtime < starttime) { //未到开卡时间
          app.tishi('提示', '未到生效日期')
        } else {
          app.tishi('提示', '该卡最多同时有' + this.data.lists1[index].parallel + '单,请先归还一单再使用')
        }
        return false
      }
      cardid = this.data.lists1[index].user_card_id;//会员卡id
      name = this.data.lists1[index].name;//计划名
      leaseday = this.data.lists1[index].lease_day;      //会员卡租期
      leaseDayText = "共计" + this.data.lists1[index].lease_day + "天"
    }
    let pages = getCurrentPages();//页面栈
    var prevPage = pages[pages.length - 2];//上一页Page对象
    prevPage.chosecardb(cardid, name, leaseday, leaseDayText);
    prevPage.setData({
        checkCardMessage: {cardid: cardid, name: name, leaseday: leaseday, leaseDayText: leaseDayText},
        hasCheck: true
    })
    wx.showLoading();
    setTimeout(() => {
      wx.hideLoading();
      wx.navigateBack({ delta: 1 })
    }, 500)
  },
  buycard(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({ url: '/pages/home/buycard/buycard' })
  },
  gocarddetail(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    let card = this.data.lists1[e];
    card = JSON.stringify(card);
    wx.navigateTo({ url: '/pages/home/mycarddetail/mycarddetail?card=' + card, })
  }
})
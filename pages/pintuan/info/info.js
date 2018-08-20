var app = getApp();
var Interval;
Page({
  onLoad(e){
    this.setData({ group_id: e.group_id, group_type: e.group_type});
    let pages = getCurrentPages();//页面栈
    if (pages.length === 1) {//分享进入
      this.setData({ xcxpages1: true })
    }
  },
  onShow(){
    this.setData({user_id : wx.getStorageSync('userdata').user_id || ""})
    this.info();
    wx.showLoading({mask:true});
    setTimeout(()=>{
      wx.hideLoading();
    },700)
  },
  onReachBottom(){
    if (this.data.list1c==="3"){
      this.launch_list();
    }  
  },
  data: {
    list1: [{ t: "拼团好友", v: "1" }, { t: "拼团说明", v: "2" }, { t: "正在拼的团", v: "3" }],
    list1c: "1",
    page:0,
    launch_list:[]
  }, 
  onShareAppMessage() {
    let group_id = this.data.group_id;
    let group_type = this.data.group_type;
    let title = this.data.group.name;
    return {
      title: title,
      imageUrl: 'https://m.zujiekeji.cn/xcximg/xcxpintuan/pintuanshare.png?a=3',
      path: '/pages/pintuan/info/info?group_type=' + group_type + '&group_id=' + group_id,
    }
  },
  info(){
    let user_id = wx.getStorageSync('userdata').user_id || "";
    let group_id = this.data.group_id;
    let group_type = this.data.group_type;
    let json = { group_id: group_id, user_id: user_id, group_type: group_type}
    app.request('book/group/group_info','POST',json,'infob',this);
  },
  infob(data){
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    data.data.show_group.start_time = app.shijianchuo3(data.data.show_group.start_time);  
    data.data.show_group.aid_list.forEach((item)=>{
      item.create_time=app.shijianchuo2(item.create_time);
    })
    this.setData({
      card: data.data.card_info, group: data.data.group_info,
      show: data.data.show_group,
      daojishi: data.data.show_group.surplus_time > 0 ? data.data.show_group.surplus_time : 0,
      is_join_group: data.data.is_join_group,
      is_start_launch: data.data.is_start_launch,//能否发起拼团
      pay_status: data.data.pay_status,//能否付款
      ptlist: data.data.show_group.aid_list,
      show_group_status: data.data.show_group_status
    });
    if (data.data.show_group.surplus_time > 0 && this.data.startdaojishi != 1) {//倒计时
      this.daojishi();
      this.setData({ startdaojishi: 1 })
    }
    else if (data.data.show_group.surplus_time <= 0){
      this.setData({
        hours: 0, minute: 0,time: 0,
      })
    }
    this.launch_list();
  },
  launch_list() {
    this.setData({ page: this.data.page + 1 });
    let group_type = parseInt(this.data.group_type);   
    let json = { group_type: group_type,page:this.data.page};
    app.request('book/group/launch_list', 'POST', json, 'launch_listb', this);
  },
  launch_listb(data) {
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    if (data.data.length == 0) {
      return false;
    }
    data.data.forEach((item) => {
      item.end_time = app.shijianchuo2(item.end_time);
    })   
    data.data = this.data.launch_list.concat(data.data);
    this.setData({ launch_list: data.data });
  },
  buy() {//发起拼团
    let card = this.data.card;
    card.price = this.data.group.price;
    card.olddeposit = card.deposit;
    wx.setStorageSync('buycard', card);
    let params = [];
    params.push("type=group");
    params.push("group_type=" + this.data.group_type);
    params.push("group_id=" + this.data.group_id);
    wx.navigateTo({ url: '/pages/home/paycard/paycard?from=pintuan&' + params.join('&') });
  },
  share() {//分享按钮
    this.setData({ share: true});
  },
  closeshare() {//关闭分享
    this.setData({ share: false })
  },
  list1(e) {//3选切换
    this.setData({ list1c: e.currentTarget.id });
  },
  nologin(){
    let card = this.data.card;
    card.olddeposit = card.deposit;
    wx.setStorageSync('buycard', card);
    wx.navigateTo({url:'/pages/home/paycard/paycard?from=pintuan'});
  },
  daojishi() {//倒计时
    let _this = this;
    Interval = setInterval(() => {
      if (_this.data.daojishi <= 0) {
        clearInterval(Interval);
      }
      _this.setData({
        hours: Math.floor(_this.data.daojishi / 3600),
        minute: Math.floor(_this.data.daojishi % 3600 / 60),
        time: Math.floor(_this.data.daojishi % 60),
        daojishi: _this.data.daojishi - 1
      })
    }, 1000)
  },
  wanfa() {
    wx.navigateTo({ url: '/pages/pintuan/guize/guize' })
  },
  goshouye() {
    wx.reLaunch({
      url: '/pages/shouye/shouye',
    })
  }, 
  groupinfo(e) {
    wx.redirectTo({
      url: "/pages/pintuan/info/info?from=share&group_type=" + e.currentTarget.dataset.type + "&group_id="
      + e.currentTarget.id
    })
  },
  savephoto() {
    let group_id = this.data.group_id;
    wx.navigateTo({
      url: '/pages/group/savephoto/savephoto?from=pintuan&group_id=' + group_id,
    })
  },
})
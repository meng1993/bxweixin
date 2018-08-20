var app = getApp();
var Interval;
Page({
  onLoad(e){
    this.setData({ group_type: e.group_type});   
  },
  onShow(){
    this.setData({user_id:wx.getStorageSync('userdata').user_id || ""});
    this.detail();
  },
  onShareAppMessage(res) {
    let id = this.data.share_id;//group_id;
    let url = "/pages/pintuan/info/info?from=share&group_type=" + this.data.group_type+"&group_id="
    if (res.from === 'menu') {//右上角本页分享
      id = this.data.group_type;
      url = "/pages/pintuan/detail/detail?from=list&group_type="
    }
    return {
      title: this.data.group.name,
      imageUrl: 'https://m.zujiekeji.cn/xcximg/xcxpintuan/pintuanshare.png?a=3',
      path: url + id,
    }
  },
  data:{

  },
  detail(){
    let group_type = this.data.group_type;
    let user_id = wx.getStorageSync('userdata').user_id || "";
    let json = { group_type: group_type, user_id: user_id}
    app.request('book/group/group_info','POST',json,'detailb',this);
  },
  detailb(data){
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    this.setData({
      card:data.data.card_info,group:data.data.group_info,
      daojishi: data.data.group_info.surplus_time > 0 ? data.data.group_info.surplus_time:0,
      is_join_group: data.data.is_join_group,
      is_start_launch: data.data.is_start_launch,//能否发起拼团
      pay_status: data.data.pay_status,//能否付款
      });
    if (data.data.is_start_launch===0){
      this.launch_list()
    }
    if (data.data.group_info.surplus_time>0&&this.data.startdaojishi!=1){//倒计时
      this.daojishi();
      this.setData({ startdaojishi:1})
    }
    else if (data.data.group_info.surplus_time <= 0) {
      this.setData({
        hours: 0, minute: 0, time: 0,
      })
    }
  },
  launch_list(){
    let group_type = parseInt(this.data.group_type);
    let user_id = wx.getStorageSync('userdata').user_id || "";
    let json = { group_type: group_type, user_id: user_id}
    app.request('book/group/launch_list', 'POST', json,'launch_listb',this);
  },
  launch_listb(data){
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    data.data.forEach((item)=>{
      item.surplus_pay_time = item.surplus_pay_time>0? Math.floor(item.surplus_pay_time / 60) + '分钟':0;
      if (item.surplus_time>0){
        item.surplus_time = Math.floor(item.surplus_time / 3600) + '时'
          + Math.floor(item.surplus_time % 3600 / 60) + "分钟"
      }else{
        item.surplus_time = "0时0分"
      }      
    })
    this.setData({ launch_list: data.data});
  },
  share(e){//分享
    this.setData({share_id:e.currentTarget.id, share:true});
  },
  closeshare(e){//关闭分享
    this.setData({ share: false})
  },
  danmai(){//单买
    let card = this.data.card;
    card.olddeposit = card.deposit;
    wx.setStorageSync('buycard', card);
    wx.navigateTo({url:'/pages/home/paycard/paycard?from=pintuan'});
  },
  buy(){//发起拼团
    let card = this.data.card;
    card.price = this.data.group.captain_price;
    card.olddeposit = card.deposit;
    wx.setStorageSync('buycard', card);
    let params = [];
    params.push("type=group");
    params.push("group_type="+this.data.group_type);
    wx.navigateTo({ url: '/pages/home/paycard/paycard?from=pintuan&' + params.join('&') });
  },
  buy2(e){
    let index = e.currentTarget.id;
    let card = this.data.launch_list[index].card_info;
    card.price =  this.data.launch_list[index].captain_price;
    card.olddeposit = card.deposit;
    wx.setStorageSync('buycard', card);
    let params = [];
    params.push("type=group");
    params.push("group_type=" + this.data.launch_list[index].group_type);
    params.push("group_id=" + this.data.launch_list[index].group_id);
    wx.navigateTo({ url: '/pages/home/paycard/paycard?from=pintuan&' + params.join('&') });
  },
  daojishi() {//倒计时
    let _this = this;
    Interval = setInterval(() => {
      if (_this.data.daojishi <= 0) {
        clearInterval(Interval);
      }
      _this.setData({
        day: Math.floor(_this.data.daojishi / 3600 / 24),
        hours: Math.floor((_this.data.daojishi % (3600 * 24)) / 3600),
        minute: Math.floor((_this.data.daojishi % (3600)) / 60),
        time: Math.floor(_this.data.daojishi % (60)),
        daojishi: _this.data.daojishi - 1
      })
    }, 1000)
  },
  groupinfo(e){
    wx.navigateTo({ url: "/pages/pintuan/info/info?from=share&group_type=" + this.data.group_type + "&group_id="
    +e.currentTarget.id})
  },
  wanfa(){
    wx.navigateTo({url:'/pages/pintuan/guize/guize'})
  },
  savephoto(){
    let group_id = this.data.share_id;
    wx.navigateTo({
      url: '/pages/group/savephoto/savephoto?from=pintuan&group_id=' + group_id,
    })
  },
  jilu(e){
    let index = e.currentTarget.id;
    let blist = this.data.launch_list[index].aid_list;
    if (blist.length == 0) {
      wx.showToast({ title: '暂无帮砍记录', icon: 'none', duration: 800 });
      return false
    }
    blist.forEach((item) => {
      item.create_time = app.shijianchuo2(item.create_time);
    })
    this.setData({ blist: blist, showblist: true });
  },
  zudang() { },
  closeblist() {
    this.setData({ showblist: false });
  },
  mypintuan() {
    wx.navigateTo({ url: '/pages/pintuan/mylist/mylist' })
  }
})
var app = getApp();
Page({
  onLoad() {
  },
  data: {
    codestatus: "获取验证码",
    code: "",
    phone:"",
    phone_c:""
  },
  phone(e){
    this.setData({ phone: e.detail.value });
  },
  code(e) {
    this.setData({ code: e.detail.value });
  },
  clearphone(){
    this.setData({ phone: "" });
  },
  getcode() {
    if (this.data.phone===""||this.data.phone.length!=11){
      wx.showToast({ title: '请填写正确手机号', icon: "none", duration: 800 });
      return false;
    }
    if (this.data.codestatus != '获取验证码') {
      return false;
    }
    let json = {
      "user_phone": this.data.phone,
      "type": "change"
    }
    app.request('index/User/send_phone_code', 'POST', json, 'getcodecb', this);
  },
  getcodecb(data) {
    if (data.code != "200") {
      app.tishi('提示', data.msg);
      return false
    }
      this.setData({phone_c:this.data.phone});
      let max = 60;
      this.setData({ codestatus: "重新发送(" + max + ")" });
      let interval = setInterval(() => {
        max--;
        this.setData({ codestatus: "重新发送(" + max + ")" });
        if (max == 0) {
          clearInterval(interval);
          this.setData({ codestatus: '获取验证码' });
        }
      }, 1000)
    
  }, 
  wancheng() {
    if (this.data.code == "") {
      wx.showToast({ title: '请输入验证码', icon: "none", duration: 800 });
      return false;
    }
    if (this.data.phone_c != this.data.phone) {
      wx.showToast({ title: '请使用接收验证码的手机号', icon: "none", duration: 800 });
      return false;
    }   
    if (this.data.phone_c == "" || this.data.phone_c.length != 11) {
      wx.showToast({ title: '请填写正确手机号', icon: "none", duration: 800 });
      return false;
    }   
      
    let json = {
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id,
      userId: wx.getStorageSync('userdata').user_id,
      code: this.data.code,
      new_phone:this.data.phone_c
    }
    
    app.request('index/user/change_phone','POST', json, "saveb", this);
  },
  saveb(data) {
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    let userdata = wx.getStorageSync('userdata');
    userdata.user_phone = this.data.phone_c;
    wx.setStorageSync('userdata', userdata);
    wx.showModal({
      title: '提示',
      content: '更换手机号成功',
      showCancel:false,
      success(res){
        wx.navigateBack({delta:1});
      }
    })
  }
})
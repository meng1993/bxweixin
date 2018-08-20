var app=getApp();
Page({
  onLoad(){
    this.setData({ phone : wx.getStorageSync('userdata').user_phone})
  },
  myaddress(){
    wx.navigateTo({ url: '/pages/home/addresslist/addresslist?from=set' })
  },
  out(){
    wx.removeStorageSync('token');
    wx.removeStorageSync('userdata');
    wx.removeStorageSync('zhimasq');   
    wx.showToast({
      title: '退出登录',
      mask:true,
      icon:'loading',
      duration:1000
    })
    wx.removeTabBarBadge({
      index: 2, 
      fail(e) {
//        console.log(e)
      }
    });
    setTimeout(()=>{
      wx.reLaunch({url: '/pages/shouye/shouye'})
    },1000)
  },
  data:{
    codestatus:"获取验证码",
    code:""
  },
  change(){
    this.setData({change:true});
  },
  quxiao(){
    this.setData({ change: false });
  },
  getcode(){
    if (this.data.codestatus != '获取验证码') {
      return false;
    }
    let json = {
      "user_phone": this.data.phone,
      "type": "replace"
    }
    app.request('index/User/send_phone_code', 'POST', json,'getcodecb',this);
  },  
  getcodecb(data) {
    if (data.code == "200") {
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
    }
    else if (data.code == "300" && this.data.logintype == 2) {//手机号未注册去注册并绑定
      let _this = this;
      wx.showModal({
        title: '提示',
        content: '该手机未注册，请注册并绑定微信',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/account/register/register?phone=' + _this.data.phone })
          }
        }
      })
    }
    else {
      app.tishi('提示', data.msg);
    }
  },
  code(e){
    this.setData({code:e.detail.value});
  },
  save(){
    if(this.data.code==""){
      wx.showToast({title: '请输入验证码',icon:"none",duration:800});
      return false;
    }
    let json = {
      token : wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id,
      userId: wx.getStorageSync('userdata').user_id,
      code : this.data.code
    }
    app.request('index/user/replace_phone','POST',json,"saveb",this);
  },
  saveb(data){
    if(data.code!=200){
      app.tishi('提示',data.msg);
      return false
    }
    wx.redirectTo({url:'/pages/home/phone/phone'});
  },
  mima(){
    wx.navigateTo({ url: '/pages/account/forget/forget'})
  }
})
var app = getApp();
var md5 = require('../../../utils/md5.js')
Page({
  onLoad() {

  },
  data: {
    inputphone: true,
    inputpwd: true,
    phone: '',
    pwd: '',
    logintype:0, //0是密码，1是验证码
    codestatus: '获取验证码',
    code:""
  },
  inputphone(e) {//电话号input
    this.setData({ phone: e.detail.value });//电话号赋值
    if (e.detail.value.length == 11 && this.data.inputphone == false) {//错误格式改正确了
      this.setData({ inputphone: true });
    }
  },
  inputpwd(e) {//密码input
    e.detail.value = e.detail.value.replace(/\s+/g, "");
    this.setData({ pwd: e.detail.value });//密码赋值
    if (e.detail.value.length >= 6 && e.detail.value.length <= 16 && this.data.inputpwd == false) {
      this.setData({ inputpwd: true });    //错误格式改正确了
    }
  }, 
  inputcode(e) {//验证码框
    this.setData({ code: e.detail.value });
  },  
  getcodecb(data) {
    //    console.log(data);
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
    } else if (data.code == '300') {
      app.tishi('提示', data.msg);
    }
  },
  getcode() {
    if (this.data.phone == "") {
      app.tishi('提示', '请输入手机号');
      return false;
    }
    if (this.data.phone.length != 11) {
      app.tishi('提示', '请输入正确的手机号');
      return false;
    }
    if (this.data.codestatus != '获取验证码') {
      return false;
    }
    let _this = this;
    app.request('index/User/send_phone_code', 'POST', {
      "user_phone": _this.data.phone,
      "type": "logo",
      "code_token": 'e76ac360864c0220'
    }, "getcodecb", _this);
  }, 
  login(e) {//登陆
    if (app.repeat(e.timeStamp) == false) { return; }
    if (this.data.phone.length != 11) {
      app.tishi('提示', '请输入正确的手机号');
      return false;
    }
    if (this.data.pwd.length < 6 || this.data.pwd.length > 16) {
      app.tishi('提示', '密码长度为6-16位');
      return false;
    }
    let _this = this;
    let pwd = md5.md5(md5.md5(md5.md5(_this.data.pwd)) + 'boxiang');
    let data = {
      user_phone: _this.data.phone,
      user_password: pwd,
    }
    //    console.log(data);
    app.request('index/user/app_login', 'POST', data, 'logincb', this);
  },
  login2(e) {//登陆
    if (app.repeat(e.timeStamp) == false) { return; }
    if (this.data.phone.length != 11) {
      app.tishi('提示', '请输入正确的手机号');
      return false;
    }
    if (this.data.code=="") {
      app.tishi('提示', '验证码错误');
      return false;
    }
    let _this = this;
    let data = {
      user_phone: _this.data.phone,
      code: this.data.code,
    }
    app.request('index/user/code_login', 'POST', data, 'logincb', this);
  },
  logincb(data) {
    //    console.log(data);
    if (data.code == "200") {//登陆成功
      wx.showToast({
        title: '登录成功',
        icon: "success",
        mask: true,
        duration: 500
      })
      wx.setStorageSync('userdata', data.data);
      wx.setStorageSync('token', data.data.token);
      app.zhima();
      let json = {
        token: data.data.token, user_id: data.data.user_id
      }
      //app.request('book/user/bookShelfNum', 'POST', json, 'shelfnum', app);
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 500)
    } else {
      app.tishi("提示", data.msg);
    }
  },
  register(e) {//
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({ url: '/pages/account/register/register' })
  },
  phonelength() {//离开焦点
    let phonelength = this.data.phone.length;
    if (phonelength != 11 && phonelength > 0) {//有值且不等于11，提示手机号长度错误
      this.setData({ inputphone: false });
      return false;
    }
    this.setData({ inputphone: true })//0或11
  },
  pwdlength() {
    let pwdlength = this.data.pwd.length;
    if ((pwdlength > 0 && pwdlength < 6) || pwdlength > 16) {//有值且<6或>16，提示密码长度错误
      this.setData({ inputpwd: false });
      return false;
    }
    this.setData({ inputpwd: true })//0或6-16之间
  },
  forget(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({ url: '/pages/account/forget/forget' })
  },
  yanzhengma() {
    this.setData({ logintype: 1 - this.data.logintype})
  }
})
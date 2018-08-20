var app = getApp();
Page({
  onLoad() {

  },
  data: {
    inputphone: true,
    inputpwd: true,
    phone: '',
    code: "",
    pwd: '',
    codestatus: '获取验证码'
  },
  inputphone(e) {
    this.setData({ phone: e.detail.value });//
    if (e.detail.value.length == 11 && this.data.inputphone == false) {//错误格式改正确了
      this.setData({ inputphone: true });
    }
  },
  inputcode(e) {
//    console.log(e);
    this.setData({ code: e.detail.value });
  },
  inputpwd(e) {
    e.detail.value = e.detail.value.replace(/\s+/g, "");
//    console.log(e.detail.value);
    this.setData({ pwd: e.detail.value });
    //错误格式改正确了
    if (e.detail.value.length >= 6 && e.detail.value.length <= 16 && this.data.inputpwd == false) {
      this.setData({ inputpwd: true });
    }
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
    // let tel = /^(0|86|17951)?(13[0-9]|15[012356789]|17[13678]|18[0-9]|14[57])[0-9]{8}$/
    // if (!tel.test(this.data.phone)) {
    //   app.tishi('提示', '请输入正确的手机号');
    //   return false;
    // }
    if (this.data.codestatus != '获取验证码') {
      return false;
    }
    let _this = this;
    app.request('index/User/send_phone_code', 'POST', {
      "user_phone": _this.data.phone,
      "type": "back",
      "code_token": 'e76ac360864c0220'
    }, "getcodecb", _this);
    // wx.request({
    //   url: app.data.http + 'index/User/send_phone_code',
    //   method: 'POST',
    //   data: { "user_phone": _this.data.phone,
    //    "type": "register",
    //    "code_token":'e76ac360864c0220',
    //    "source":"4"},
    //   success(e) {
    //     console.log(e.data);
    //     if(e.data.code=="200"){         
    //       let max = 60;
    //       _this.setData({ codestatus: "重新发送(" + max + ")" });
    //       let interval = setInterval(() => {            
    //         max--;
    //         _this.setData({ codestatus: "重新发送(" + max + ")" });
    //         if (max == 0) {
    //           clearInterval(interval);
    //           _this.setData({ codestatus: '获取验证码' });
    //         }
    //       }, 1000)
    //     }      
    //   }
    // })
  },
  register(e) {
    if (app.repeat(e.timeStamp) == false) { return; }
    if (this.data.phone.length != 11) {
      app.tishi('提示', '请输入正确的手机号');
      return false;
    } else if (this.data.code == "") {
      app.tishi('提示', '请输入验证码');
      return false;
    } else if (this.data.pwd.length < 6 && this.data.pwd.length > 16) {
      app.tishi('提示', '密码长度为6-16位');
      return false;
    }
    let data = {
      user_phone: this.data.phone,
      user_password: this.data.pwd,
      code: this.data.code
    }
    app.request('index/User/update_password', 'POST', data, 'registercb', this);
  },
  registercb(data) {
//    console.log(data);
    if (data.code == "200") {
      wx.showToast({
        title: data.msg,
        icon: "success",
        mask: true,
        duration: 1000
      })
      setTimeout(() => {
        wx.navigateBack({delta:1})
      }, 1000)
    }
    else if (data.code == "300") {//验证码已过期
      app.tishi('提示', data.msg);
    }
  },
  phonelength() {//离开焦点
    let phonelength = this.data.phone.length;
    if (phonelength != 11 && phonelength > 0) {//有值且不等于11，提示手机号长度错误
      this.setData({ inputphone: false });
      return false;
    }
    this.setData({ inputphone: true })//0或11
  },
  pwdlength() {//离开焦点
    let pwdlength = this.data.pwd.length;
    if ((pwdlength > 0 && pwdlength < 6) || pwdlength > 16) {//有值且<6或>16，提示密码长度错误
      this.setData({ inputpwd: false });
      return false;
    }
    this.setData({ inputpwd: true })//0或6-16之间
  }
})
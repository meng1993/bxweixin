var app = getApp();
Page({
  onLoad() {
    this.setData({ month: new Date().getMonth() + 1, day: new Date().getDate() })
  },
  data: {
    checkedarr: [],
    uparr: [],
    max: 9,
    upindex: -1,
    beizhu:""
  },
  add() {
    let _this = this;
    wx.scanCode({
      scanType: ['barCode','qrCode'],
      success(res){
        wx.showLoading({ title: '识别中...' });
        app.request('book/Isbn/book', 'POST', { merchant: 90, code: res.result},'addb',_this)
      }
    })
  },
  addb(data){
    wx.hideLoading();
    if(data.code!=200){
      app.tishi('提示',data.msg);
      return false
    }
    let checkedarr = this.data.checkedarr; 
    checkedarr.push({
      img: data.data.img_medium,
      book_id: "",
      "type": "album"
    })
    if (checkedarr.length===1){
      this.setData({ beizhu: this.data.beizhu+'宝贝今天读了:' });
    }
    this.setData({ checkedarr: checkedarr, beizhu:this.data.beizhu+'"'+data.data.title+'",' });
  },
  tijiao() {
    if (this.data.checkedarr.length === 0) {
      wx.showToast({ title: '您未勾选', icon: 'none', duration: 800 })
      return false;
    }
    this.daka();
  },
  beizhu(e) {
    this.setData({ beizhu: e.detail.value });
  },
  daka() {
    let date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();
    let beizhu = this.data.beizhu || "";
    let json = {
      date: date, remark: beizhu, sign_list: this.data.checkedarr,
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id
    }
    app.request('book/communitytwo/baby_sign_in', 'POST', json, "dakab", this)
  },
  dakab(data) {
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    wx.showToast({ title: data.msg, duration: 1000 })
    setTimeout(() => {
      wx.navigateBack({ delta: 1 })
    }, 1000)
  }
})
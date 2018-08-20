var app = getApp();
Page({
  onLoad(e){
    this.setData({add:e.add})
  },
  data:{

  },
  add(e) {
    let id = e.currentTarget.id;
    if (id == 'sao') {
      this.cam();
    } else if (id == 'search') {
      wx.navigateTo({ url: '/pages/shuwu/search/search' })
    } else if (id == 'add') {
      wx.navigateTo({ url: '/pages/shuwu/cam/cam' })
    } else if (id == 'home') {
      let page = getCurrentPages()[getCurrentPages().length - 2];
      wx.navigateTo({ url: '/' + page.route + '?from=' + page.data.from + '&beforefenlei=' + page.data.fenlei + '&copycheckeds=' + encodeURIComponent(JSON.stringify(page.data.checkeds)) + '&fenleititle=' + encodeURIComponent(page.data.fenleititle) });
      
    } else if (id == 'hebin'){
      this.hebin()
    }
  },
  cam() {
    var _this = this;
    wx.scanCode({
      scanType: ['barCode', 'qrCode'],
      success(res) {
        wx.showLoading({ title: '识别中...' });
        let cate_id = wx.getStorageSync('cate_id');
        let json = {
          token: wx.getStorageSync('token'),
          user_id: wx.getStorageSync('userdata').user_id,
          code: res.result,
          merchant: 90,
          cate_id: cate_id
        }
        app.request('book/Isbnstudy/book', 'POST', json, 'camb', _this)
      }
    })
  },
  camb(data) {
    wx.hideLoading();
    if (data.code != 200) {
      wx.showToast({ title: data.msg, icon: "none", duration: 1000, mask: true })
    } else {
      wx.showToast({ title: "添加书屋成功~", icon: "success", duration: 1000, mask: true });
      let page = getCurrentPages()[getCurrentPages().length - 2];
      page.setData({ "type": "shuwu_time", keyword: "" });
      page.refresh();
    }
    let _this = this;
    setTimeout(()=>{
      _this.cam();
    },1000)
  },
  hebin(){
    wx.navigateTo({ url:"/pages/shuwu/fenlei/fenlei?hebin=1"})
  }
})
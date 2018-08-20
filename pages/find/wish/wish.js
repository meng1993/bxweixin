var app = getApp();
Page({
  onLoad() {
    this.getlist();
  },
  data: {
    page: 1,
  },
  onReachBottom() {
    if (this.data.nomore) {
      // wx.showToast({ title: '已显示全部', duration: 700, icon: "none" })
      return false
    }
    this.setData({ page: this.data.page + 1 });
    this.getlist();
  },
  getlist() {
    let json = app.token({ page: this.data.page });
    app.request('book/wishbook/wish_list', 'POST', json, 'listb', this);
  },
  listb(data) {
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false;
    }
    if (this.data.page === 1 && data.data.length === 0) {
      this.setData({ list: [], nomore: true });
      return false
    }
    if (data.data.length < 10) {
      this.setData({ nomore: true });
    }
    this.setData({ list: (this.data.list ? this.data.list : []).concat(data.data) });
  },
  cam() {
    var _this = this;
    wx.scanCode({
      scanType: ['barCode', 'qrCode'],
      success(res) {
        wx.showLoading({ title: '识别中...' });
        let json = {
          token: wx.getStorageSync('token'),
          user_id: wx.getStorageSync('userdata').user_id,
          code: res.result,
          merchant: 90
        }
        _this.setData({ code: res.result });
        app.request('book/isbn/wish_book_search', 'POST', json, 'camb', _this)
      }
    })
  },
  camb(data) {
    wx.hideLoading();
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false;
    }
    let author = data.data.author || "";
    let title = data.data.title || "";
    let publisher = data.data.publisher || "";
    let series = data.data.series || "";
    let img_medium = data.data.img_medium || "";
    let code = this.data.code;
    wx.navigateTo({ url: "/pages/find/editwish/editwish?author=" + author + "&title=" + title + "&publisher=" + publisher + "&series=" + series + "&img_medium=" + img_medium + "&from=saoma&code=" + code + '&date=' + data.data.pub_date });
  },
  pic() {
    let _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        _this.setData({ src: tempFilePaths[0] });
        _this.upload();
      }
    })
  },
  upload() {
    wx.showLoading({
      title: '图片上传中...',
    })
    let _this = this;
    const uploadTask = wx.uploadFile({
      url: app.data.http + 'book/communitytwo/uploadImg', //仅为示例，非真实的接口地址
      filePath: _this.data.src,
      name: 'file',
      success: function (res) {
        wx.hideLoading();
        var data = res.data;
        res.data = JSON.parse(res.data);
        let img = res.data.data.imgPath + res.data.data.imgUrl;
        wx.navigateTo({ url: "/pages/find/editwish/editwish?&from=paizhao&img_medium=" + img })
      },
      fail() {
        wx.hideLoading();
        wx.showToast({ title: "图片上传失败~", icon: "none", duration: 700 });
      }
    })
  },
  detail(e) {
    let data = this.data.list[e.currentTarget.id];
    console.log(data)
    if (data.wait === "rent") {
      wx.navigateTo({ url: "/pages/detail/detail?bookid=" + data.book_id })
      return false;
    }
    if (data.wait === "abandon") {
      return false;
    }
    let author = data.author || "";
    let title = data.title || "";
    let publisher = data.publisher || "";
    let series = data.series || "";
    let img_medium = data.img || "";
    let code = data.isbn10 || "";
    let id = data.id || "";
    wx.navigateTo({
      url: "/pages/find/editwish/editwish?author=" + author + "&title=" + title + "&publisher="
      + publisher + "&series=" + series + "&img_medium=" + img_medium + "&from=wait&code=" + code + "&id=" + id + '&date=' + data.pub_date + '&status=' + data.status
    })
  },
  refresh() {
    this.setData({ page: 1, list: null });
  },
  remove(e) {
    let wish_book_id = this.data.list[e.currentTarget.id].id;
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除心愿书单吗',
      success(res) {
        if (res.confirm) {
          let json = {
            token: wx.getStorageSync('token'),
            user_id: wx.getStorageSync('userdata').user_id,
            wish_book_id: wish_book_id
          }
          app.request('book/wishbook/wish_book_delete', 'POST', json, 'removeb', _this);
          _this.setData({ wish_book_id: wish_book_id })
        }
      }
    })
  },
  removeb(data) {
    if (data.code == 200) {
      wx.showToast({ title: data.msg, duration: 800 });
      this.refresh();
      this.getlist();
    }
  }
})
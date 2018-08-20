var app = getApp();
Page({
  onLoad(e){
    this.setData({ "from": e.from});
    if(e.from==="saoma"||e.from==="wait"){
      this.setData({
        src: e.img_medium||"", name: e.title, xilie: e.series, zuozhe: e.author, banshe: e.publisher,
        code: e.code || "", id: e.id || "", date: e.date || "", status: e.status || ""
      });
    }  
    if (e.from ==="paizhao"){
      this.setData({ src: e.img_medium, status:''});
    }
  },
  data: {
    src: "",
    name: ""
  },
  bookname(e) {
    this.setData({ name: e.detail.value });
  },
  xilie(e) {
    this.setData({ xilie: e.detail.value });
  },
  zuozhe(e) {
    this.setData({ zuozhe: e.detail.value });
  },
  banshe(e) {
    this.setData({ banshe: e.detail.value });
  },
  bindDateChange(e) {
    this.setData({ date: e.detail.value });
  },
  clear() {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '移除照片？',
      success(res) {
        if (res.confirm) {
          _this.setData({ src: "" });
        }
      }
    })
  },
  add() {
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
        _this.setData({
          src: res.data.data.imgPath + res.data.data.imgUrl,
        });
      },
      fail() {
        wx.hideLoading();
        wx.showToast({ title: "图片上传失败~", icon: "none", duration: 700 });
      }
    })
  },
  save() {
    // if (this.data.status != "" && this.data.status != "wait") {
    //   wx.showToast({ title: "该心愿书单平台已经审核无法编辑", icon: "none", duration: 1700 });
    //   return false
    // }
    if (this.data.name === "") {
      wx.showToast({ title: "请输入书名~", icon: "none", duration: 700 });
      return false
    }
    // if (this.data.src === "") {
    //   wx.showToast({ title: "请添加图片~", icon: "none", duration: 700 });
    //   return false
    // }
    let json = {
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id,
      title: this.data.name,
      // img: this.data.src,
      publisher: this.data.banshe || "",
      author: this.data.zuozhe || "",
      series: this.data.xilie || "",
      pub_date: this.data.date || "",
      isbn10 : this.data.code || "",
      wish_book_id: this.data.id || ""
    }
    let jiekou = "book/wishbook/wish_book_insert";
    if (this.data.from == 'saoma' || this.data.from == 'paizhao'){
      jiekou = "book/wishbook/wish_book_insert";
    }
    else if(this.data.from== 'wait'){
      jiekou = "book/wishbook/wish_book_update";
    }
    app.request(jiekou, 'POST', json, 'saveb', this);
  },
  saveb(data) {
    if (data.code != 200) {
      wx.showToast({ title: data.msg, icon: "none", duration: 700 });
      return false
    }
    app.tishi('提示','心愿书单提交成功!');
    let _this = this;
    setTimeout(()=>{
      _this.setData({ name: "", banshe: "", xilie: "", zuozhe:"",date:""})
    },200)
  },
  remove(){
    
  }
})
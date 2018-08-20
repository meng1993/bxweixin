var app = getApp();
Page({
  data:{
    src:"",
    name:""
  },
  bookname(e){
    this.setData({name:e.detail.value});
  },
  xilie(e){
    this.setData({ xilie: e.detail.value });
  },
  zuozhe(e){
    this.setData({ zuozhe: e.detail.value });
  },
  banshe(e){
    this.setData({ banshe: e.detail.value });
  },
  bindDateChange(e){
    this.setData({ date: e.detail.value });
  },
  clear(){
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '移除照片？',
      success(res){
        if(res.confirm){
          _this.setData({src:""});
        }
      }
    })
  },
  add() {
    let _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album','camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        _this.setData({ src: tempFilePaths[0] });
      }
    })
  },
  upload() {
    if(this.data.src===""){
      wx.showToast({ title: "请先拍照~", icon: "none", duration: 700 });
      return false
    }
    if (this.data.name === "") {
      wx.showToast({ title: "请输入书名~", icon: "none", duration: 700 });
      return false
    }
    wx.showLoading({
      title: '图片上传中...',
    })
    let _this = this;
    const uploadTask = wx.uploadFile({
      url: app.data.http + 'book/communitytwo/uploadImg', //仅为示例，非真实的接口地址
      filePath: _this.data.src,
      name: 'file',
      success: function (res) {
        var data = res.data;
        res.data = JSON.parse(res.data);
        _this.setData({
          img: res.data.data.imgPath + res.data.data.imgUrl,
        });
        _this.save();
      },
      fail(){
        wx.hideLoading();
        wx.showToast({ title: "图片上传失败~", icon: "none", duration: 700 });
      }
    })
  },
  save(){
    wx.hideLoading();
    let cate_id = wx.getStorageSync('cate_id');
    let json = {
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id,
      title: this.data.name,
      img:this.data.img,
      publisher: this.data.banshe||"",
      author: this.data.zuozhe||"",
      series:this.data.xile||"",
      pub_date:this.data.date||"",
      cate_id: cate_id
    }
    app.request('book/communitytwo/shuwu_insert','POST',json,'saveb',this);
  },
  saveb(data){
    if(data.code!=200){
      wx.showToast({ title: data.msg, icon: "none", duration: 700 });
      return false
    }
    wx.showToast({ title: "添加完成~", icon: "none", duration: 700,mask:true});
    let page = getCurrentPages()[getCurrentPages().length-3];
    //page.paixu("shuwu_time");
    page.setData({ "type": "shuwu_time", keyword: ""})
    page.refresh();
    setTimeout(()=>{
      wx.navigateBack({delta:1});
    },700);
  }
})
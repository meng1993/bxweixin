var app = getApp();
Page({
  onLoad(){
    let userdata = wx.getStorageSync('userdata');
    this.setData({ sexindex: userdata.sex-1,name:userdata.nickname,face:userdata.face})
  },
  data:{
    cname:false,
    sex: [{ a: "男", b: "1" }, { a: "女", b: "2" }, { a: "保密", b: "3" }],
    sexindex:0
  },
  cname(){
    this.setData({ cname: !this.data.cname});
  },
  name(e){
    this.setData({ name: e.detail.value, cname: !this.data.cname});
    this.save();
  },
  bindPickerChange(e){
    this.setData({ sexindex: e.detail.value });
    this.save();
  },
  face(){
    let _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        _this.setData({ willface: tempFilePaths[0] });
        _this.upload();
      }
    })
  },
  upload() {
    let _this = this;
    const uploadTask = wx.uploadFile({
      url: app.data.http + 'book/communitytwo/uploadImg', //仅为示例，非真实的接口地址
      filePath: _this.data.willface,
      name: 'file',
      success: function (res) {
        var data = res.data;
        res.data = JSON.parse(res.data);
        _this.setData({ face: res.data.data.imgPath + res.data.data.imgUrl });
        _this.save();
      }
    })
  },
  save(){
    let json = app.token({ sex: this.data.sex[this.data.sexindex].b,
    nickname:this.data.name,face:this.data.face,userId:wx.getStorageSync('userdata').user_id});
    app.request('index/user/change_information', 'POST', json,'saveb',this);
  },
  saveb(data){
    if(data.code!==200){
      return false
    }
    let userdata = wx.getStorageSync('userdata');
    userdata.sex = this.data.sex[this.data.sexindex].b;
    userdata.nickname = this.data.name;
    userdata.face = this.data.face;
    wx.setStorageSync('userdata',userdata);
  }
})

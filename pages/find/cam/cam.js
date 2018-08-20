var app = getApp();
Page({
  onLoad(){
    this.setData({ month: new Date().getMonth() + 1, day: new Date().getDate() })
  },
  data:{
    checkedarr:[],
    uparr:[],
    max:9,
    upindex:-1
  },
  add(){
    let _this=this;
    wx.chooseImage({
      count: this.data.max, 
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
//        console.log(tempFilePaths)
        let checkedarr = _this.data.checkedarr;
        checkedarr = checkedarr.concat(tempFilePaths);
        _this.setData({ checkedarr: checkedarr, max: _this.data.max - tempFilePaths.length});
      }
    })
  },
  tijiao(){
    if (this.data.checkedarr.length === 0) {
      wx.showToast({ title: '请先拍照', icon: 'none', duration: 800 })
      return false;
    }   
    wx.showLoading({title: '图片上传...'});   
    this.upload();    
  },
  beizhu(e) {
    this.setData({ beizhu: e.detail.value });
  },
  upload(){
    this.setData({ upindex: this.data.upindex + 1 });
    if (this.data.upindex > this.data.checkedarr.length-1) {//上传结束
      //wx.showToast({ title: '打卡成功！', icon: 'success', duration: 800 })
      // setTimeout(()=>{
      //   wx.navigateBack({delta:1})
      // },800)
      this.daka();
      wx.hideLoading();
      return false
    }
    let _this=this;
    const uploadTask = wx.uploadFile({
      url: app.data.http + 'book/communitytwo/uploadImg', //仅为示例，非真实的接口地址
      filePath: _this.data.checkedarr[_this.data.upindex],
      name: 'file',
      success: function (res) {
        var data = res.data;
        res.data = JSON.parse(res.data);
        let uparr = _this.data.uparr;//上传成功的图片地址数组   
        uparr.push({
          img:res.data.data.imgPath + res.data.data.imgUrl,
          book_id:"",
          "type":"photograph"
          });
        _this.setData({ uparr: uparr})
        _this.upload();
      }
    })
  },
  daka(){
    let date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();
    let beizhu = this.data.beizhu || "";
    let json = {
      date: date, remark: beizhu, sign_list: this.data.uparr,
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id
    }
    app.request('book/communitytwo/baby_sign_in', 'POST', json, "dakab", this)
  },
  dakab(data){
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    wx.showToast({ title: data.msg, duration: 1000 })
    setTimeout(() => {
      wx.navigateBack({ delta: 2 })
    }, 1000)
  }
})
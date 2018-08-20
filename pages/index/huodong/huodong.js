Page({
  onLoad(){
    let src=wx.getStorageSync('huodongsrc');
    this.setData({ src: src})
  }
})
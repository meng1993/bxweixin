var app = getApp();
Page({
  onLoad(){
    this.setData({ historyarr: wx.getStorageSync('shuwusearch') });
  },
  data:{

  },
  search(e){
    let array = wx.getStorageSync('shuwusearch');
    array = typeof array == "object" ? array : [];
    let c = 0 ;
    for (let i = 0; i < array.length; i++) {
      if (array[i] === e.detail.value) {
        c = 1;
      }
    }
    if(c===0){
      array.push(e.detail.value);
    }
    wx.setStorageSync('shuwusearch', array);
    
    this.confirm(e.detail.value);
  },
  historysearch(e){
    this.confirm(e.currentTarget.id);
  },
  confirm(e){
    if (e == "") {
      return false;
    }   
    // let page = getCurrentPages()[getCurrentPages().length - 2];
    // page.search(e);
    // wx.navigateBack({ delta: 1 });
    wx.navigateTo({ url:"/pages/shuwu/searchr/searchr?keyword="+e})
  },
  clearhistory() {//删除历史记录
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '删除历史搜索记录？',
      confirmColor: '#FF4500',
      success(res) {
        if (res.confirm) {//确定删除历史记录
          _this.setData({ historyarr: []});
          wx.setStorageSync("shuwusearch","");
        }
      }
    })
  }
})
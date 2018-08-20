var app = getApp();
Page({
  onLoad(e){
    let list = this.data.list;
    list.forEach((item)=>{
        if(item.id===e.id){
          item.checked = true;
        }
    })
    this.setData({ list: list});
  },
  data:{
    list:[
      { a: "按阅读打卡时间", b: "根据图书阅读记录顺序展示", checked: false, id: "sign_time" },
      { a: "按添加书屋时间", b: "根据图书加入宝贝书屋顺序展示", checked: false, id: "shuwu_time" },
      { a: "按出版社", b: "根据出版社字母顺序展示", checked: false, id: "publisher" },
      { a: "按作者", b: "根据作者字母顺序展示", checked: false, id: "author" }
    ],
    id:""
  },
  check(e){
    let list = this.data.list;
    list.forEach((item)=>{
      item.checked = false
    });
    list[e.currentTarget.id].checked = true;
    this.setData({ list: list, id: list[e.currentTarget.id].id });
    let page = getCurrentPages()[getCurrentPages().length-2];
    page.paixu(list[e.currentTarget.id].id, list[e.currentTarget.id].a);
    wx.setStorageSync('shuwupaixu', list[e.currentTarget.id]);
    wx.showLoading();
    setTimeout(()=>{
      wx.hideLoading();
      wx.navigateBack({delta:1})
    },800)
  }
})
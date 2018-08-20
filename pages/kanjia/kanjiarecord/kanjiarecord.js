var app = getApp();
Page({
  data: {
  },
  onLoad() {
    
  },
  onShow: function () {
    let token = wx.getStorageSync('token');
    if (token === "") {//判断登陆状态
      wx.redirectTo({ url: '/pages/login/login' })
      return false
    }
    this.getlist();
  },
  getlist(){
    let user_id = wx.getStorageSync('userdata').user_id || "";
    let token = wx.getStorageSync('token')||"";
    let status = "develop";
    app.request('book/bargain/user_bargain_list', 'POST', { user_id: user_id, token: token, status: status},'getlistb',this)
  },
  getlistb(data){
    for (let i = 0; i < data.data.length;i++){
      data.data[i].floor_price = parseInt(data.data[i].floor_price)
    }
    this.setData({ list: data.data});
    if (data.data.length==0){
      wx.showToast({title: '暂无记录',icon:"none"})
    }
  },
  onShareAppMessage(e){
    return {
      title: e.target.dataset.title,
      imageUrl: 'https://m.zujiekeji.cn/xcximg/xcxkanjia/kanjiashare.png?a=3',
      path: '/pages/kanjia/info/info?user_bargain_id=' + e.target.id + '&from=share',
    }
  },
  detail(e){
    let user_bargain_id = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/kanjia/info/info?user_bargain_id=' + e.currentTarget.id+'&from=my'})
  },
  gokanjia(){
    wx.navigateTo({ url: '/pages/kanjia/kanjiaye/kanjiaye' })
  }
})
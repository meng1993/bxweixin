var app = getApp();
Page({
  data: {
    list:[]
  },
  onLoad(){
    this.getc();
  },
  onShow() {
    this.setData({user_id:wx.getStorageSync('userdata').user_id || ""})
  },
  getc(){
    let user_id = wx.getStorageSync('userdata').user_id || "";
    app.request('book/bargain/bargain_list','POST',{user_id:user_id},'getcb',this)
  },
  getcb(data){
    if(typeof data.data != "object"){
      return false;
    }
    for (let i = 0; i < data.data.length;i++){
      data.data[i].floor_price = parseFloat(data.data[i].floor_price)|| 0;
    }
    this.setData({list:data.data})
  },
  detail(e) {
    //if (e.currentTarget.dataset.mystatus ==="notstart"){
      let bargain_id = e.currentTarget.id;
      wx.navigateTo({ url: '/pages/kanjia/detail/detail?bargain_id=' + bargain_id + '&from=list' });
      return false
    //}
    //this.mykanjia();
  },
  mykanjia(){
    wx.navigateTo({ url: '/pages/kanjia/kanjiarecord/kanjiarecord' })
  }
})
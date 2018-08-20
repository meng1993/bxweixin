var app = getApp();
Page({
  onLoad(e){
    this.list();
  },
  onShow(){
    this.setData({ user_id: wx.getStorageSync('userdata').user_id || "" })
  },
  data:{

  },
  list(){
    let user_id = wx.getStorageSync('userdata').user_id || "";
    app.request('book/group/group_list', 'POST', { user_id: user_id},'listb',this);
  },
  listb(data){
    if(data.code!=200){
      app.tishi('提示',data.msg); 
      return false
    }
    this.setData({list:data.data});
  },
  detail(e){
    wx.navigateTo({url: '/pages/pintuan/detail/detail?group_type='+e.currentTarget.id})
  },
  mypintuan(){
    wx.navigateTo({url: '/pages/pintuan/mylist/mylist'})
  }
})
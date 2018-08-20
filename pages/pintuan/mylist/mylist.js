var app = getApp();
Page({
  onLoad(e){
    this.list();
  },
  onShareAppMessage(res) {
    let group_id = res.target.id;//group_id;
    let group_type = res.target.dataset.type;
    let title = res.target.dataset.title;
    let url = "/pages/pintuan/info/info?from=share&group_type=" + group_type + "&group_id=" + group_id
    if (res.from === 'menu') {//右上角本页分享
      url = "/pages/pintuan/list/list"
    }
    return {
      title: title,
      imageUrl: 'https://m.zujiekeji.cn/xcximg/xcxpintuan/pintuanshare.png?a=3',
      path: url,
    }
  },
  data:{

  },
  list(){
     let user_id = wx.getStorageSync('userdata').user_id || "";
     let token = wx.getStorageSync('token') || "";
     app.request('book/group/user_group_list','POST',{user_id:user_id,token:token},'listb',this)
  },
  listb(data){
    if (data.code != 200) {
      app.tishi('提示', data.msg);
      return false
    }
    this.setData({list:data.data})
  },
  detail(e){
    let group_id = e.currentTarget.id;
    let group_type = e.currentTarget.dataset.type;
    wx.navigateTo({ url: "/pages/pintuan/info/info?from=share&group_type=" + group_type + "&group_id=" +
     group_id})
  },
  gopintuan(){
    wx.navigateTo({url:'/pages/pintuan/list/list'})
  }
})
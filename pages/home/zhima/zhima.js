var app=getApp();
Page({
  onLoad(){
    this.getxinyong();
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#0EE9EC',
    })
  },
  data:{
    pingfen:0,
    xinyong:'暂无减免'
  },
  getxinyong(){
    let user_id=wx.getStorageSync('userdata').user_id;
    app.request('index/zhima/getUserZMScore', 'POST', { user_id: user_id },'getxinyongb',this)
  },
  getxinyongb(data){
//    console.log(data);
    if (data.data.status==2){
        wx.showModal({
            title: '未授权',
            content: '请前往"博鸟绘本"公众号->用户服务->芝麻认证进行操作',
            showCancel:false,
            success: function (res) {
                wx.navigateBack({ delta: 1});
            }
        });
//      wx.navigateTo({ url: '/pages/home/zhimarenzheng/zhimarenzheng'})
      return false
    }
    if(data.data.status==0){
      app.tishi('提示','获取失败')
      return false
    }
    if (data.data.zmscore<600){
      this.setData({ xinyong:'暂无减免'})
    } else if (data.data.zmscore >= 600 && data.data.zmscore<=700){
      this.setData({ xinyong: '信用良好', erdu:2000})
    } else if (data.data.zmscore > 700){
      this.setData({ xinyong: '信用极好', erdu: 4000})
      if (data.data.zmscore >= 751 && data.data.zmscore<=800){
        this.setData({ erdu: 8000})
      }else if (data.data.zmscore >800){
        this.setData({ erdu: 12000 })
      }
    }
    this.setData({ pingfen: data.data.zmscore})
  }
})
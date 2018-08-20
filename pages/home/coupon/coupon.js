var app=getApp();
Page({
  onLoad(){
    let token = wx.getStorageSync('token');
    if (token === "") { 
      wx.navigateTo({ url: '/pages/login/login' });
      return false;
    }
    wx.showLoading();
    this.mycoupon(0);
    this.mycoupon(1);
    this.mycoupon(2);
  },
  data:{
    condition:"0",
    lists0:[],
    lists1: [],
    lists2: [],
    emptyContent: '该数据为空'
  },
  changecondition(e){
    if (this.data['lists' + e.currentTarget.id].length==0){
      wx.showToast({title: '您没有该优惠券~',icon:'none'})
    }else{
      wx.hideToast();
    }
    this.setData({condition:e.currentTarget.id})
  },
  mycoupon(e){//获取优惠卷
    let token=wx.getStorageSync('token');
    let userId=wx.getStorageSync('userdata').user_id;
    let _this=this;
    wx.request({
      url: app.data.http +'index/coupon/index',
      header:{
        'cookie': 'ZU-JIE-KE-JI-UID='+wx.getStorageSync("zujiekeji-uid"),//读取cookie
      },
      mothod:'POST',
      data: {token: token, userId: userId, useType: e, page_number:15},
      success(res){
        let data = res.data;
        wx.hideLoading();
        if(data.code!=200){
          return false
        }
        data.data.data.forEach((item,index)=>{//解时间戳
          item.use_start_time = app.shijianchuo(item.use_start_time);
          item.use_end_time = app.shijianchuo(item.use_end_time);
        })
        let lists = _this.data['lists'+e];//分类赋值
        lists = lists.concat(data.data.data);
        let param = new Object();
        param['lists'+e]=lists;
        _this.setData(param);
        if (data.data.data.length == 0&&e==0) {
          wx.showToast({ title: '您没有该优惠券~', icon: 'none' })
        }
      }
    })
  },
  gobuycard(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.redirectTo({url: '/pages/home/buycard/buycard'})
  }
})
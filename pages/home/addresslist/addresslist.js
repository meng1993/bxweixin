var app=getApp();
Page({
  onLoad(e){
    app.judgelogin();
    if (e.id&&e.id!=""&&e.id != 0) {//购买前选择地址
      this.setData({ oldid: e.id, id: e.id});
    }
    if(e.from=='set'){
      this.setData({nogouxuan:true})
    }
    this.getaddress();  
  },
  onShow(){

  },
  data:{
    id:0,
    oldid:0,
    xuanzhong:-1
  },
  getaddress(e){//get收货地址列表
    let token=wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    app.request('index/User/userAddressSel', 'GET', { token: token, userId: user_id},'getb',this);
    if(e&&e==this.data.id){
      let pages = getCurrentPages();//页面栈
      var prevPage = pages[pages.length - 3];//上一页Page对象
      prevPage.oneaddress(e);
    }
  },
  getb(data){//获取列表回调\
//    console.log(data);
    if(data.code!=200){
      return false;
    }
      if (data.data.addressList.data.length==0){
        return false;
      }
      this.setData({ lists: data.data.addressList.data});
      if(this.data.oldid==0){     
        return false;
      }
      for (let i = 0; i < this.data.lists.length; i++) {//从订单页来的，有已选值  
        if (this.data.lists[i].id == this.data.oldid){//给旧id默认勾选
          this.setData({ xuanzhong:i})
      }
    }
  },
  xuanzhong(e){//勾选
    if (app.repeat(e.timeStamp) == false) { return; }
    let _this=this;
    wx.showModal({
      title: '提示',
      content: '选择该地址？',
      success(res){
        if(res.confirm){
          let index = e.currentTarget.id;
          let id = _this.data.lists[index].id;//地址id
          _this.setData({ xuanzhong: index, id: id});     
          let pages = getCurrentPages();//页面栈
          var prevPage = pages[pages.length - 2];//上一页Page对象
          prevPage.oneaddress(id);//上页换地址
          wx.showToast({title: '切换中...',icon:'none',mask:true,duration:500});
          setTimeout(()=>{
            wx.navigateBack({ delta: 1 })
          },500)
        }
      }
    }) 
  },
  
  remove(e){//删除
    if (app.repeat(e.timeStamp) == false) { return; }
    let _this=this;
    wx.showModal({
      title: '提示',
      content: '确定删除该地址?',
      success(res){
        if(res.confirm){
          let token = wx.getStorageSync('token');
          let user_id = wx.getStorageSync('userdata').user_id;
          let id = e.currentTarget.id;
          _this.setData({ index: e.currentTarget.dataset.index });
          app.request('index/User/userAddressDel', 'POST', { token: token, userId: user_id, id: id }, 
           'removeb', _this);
        }
      }
    })
    
  },
  removeb(data){
    if(data.code!=200){
      return false;
    }
    let lists=this.data.lists;
    let index=this.data.index;
    lists.splice(index,1);
    this.setData({ lists: lists});
//    console.log(index);
    if(index==this.data.xuanzhong){
      this.setData({xuanzhong:-1})
      let pages = getCurrentPages();//页面栈
      var prevPage = pages[pages.length - 2];//上一页Page对象
      prevPage.oneaddress(-1);//上页换地址
    }
    wx.showToast({title: '删除成功',icon:'none'});
  },
  add(e){//新增
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({url: '../address/address'})
  },
  edit(e){//修改
    if (app.repeat(e.timeStamp) == false) { return; }
    wx.navigateTo({ url: '../address/address?id=' + e.currentTarget.id});
  }
})
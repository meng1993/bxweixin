var app=getApp()
Page({
  onLoad(e){
    this.setData({ order_id: e.order_id});
    this.getpinglun();
  },
  getpinglun(){
    let order_id = this.data.order_id;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { order_id: order_id, token: token, user_id: user_id }
    app.request('book/order/mycomment','GET',json,'getb',this);
  },
  getb(data){
    if(data.code!=200){
      app.tishi('提示',data.msg);
      return false;
    }
//    console.log(data);
    data.data.forEach((item)=>{
      item.book_img = item.book_img.split('@')[0];
      item.content="";
    })
    this.setData({data:data.data});
  },
  input(e){
    let param={};
    param['data['+e.currentTarget.id+'].content']=e.detail.value;
    this.setData(param);
  },
  btn(){
    let comments=new Array();
    this.data.data.forEach((item)=>{
      if (item.content==""){
        item.content = item.default_comment;
      }
      comments.push({ book_id: item.book_id, content: item.content})
    })
    let order_id = this.data.order_id;
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id; 
    let json = { order_id: order_id, token: token, user_id: user_id, comments: comments, version:200}
    app.request('book/order/orderComment','POST',json,'postb',this);
  },
  postb(data){
//    console.log(data);
    if(data.code!=200){
      app.tishi('提示',data.msg);
      return false
    }
    wx.showToast({title: '评论成功',duration:800})
    let pages = getCurrentPages();//页面栈
    var prevPage = pages[pages.length - 2];//上一页Page对象
    prevPage.setData({ lists: [], page: 1 });
    prevPage.getorder();
    setTimeout(() => {
      wx.navigateBack({ delta: 1 })
    }, 800)  
  }
})
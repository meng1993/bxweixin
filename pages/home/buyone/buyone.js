var app=getApp();
Page({
  onLoad(e){
    this.setData({ order_id: e.order_id});
    this.detail();
  },
  data:{
    checkall:true
  },
  detail() {
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let order_id = this.data.order_id;
    let json = { token: token, user_id: user_id, order_id: order_id }
//    console.log(json)
    app.request('book/order/orderDetail', 'GET', json, 'detailb', this);
  },
  detailb(data) {
//    console.log(data);
    data.data.books.forEach((item2, index) => {//图片地址
      item2.img_medium = item2.img_medium.split('@')[0];
      item2.checked = true;
    })
    this.setData({ lists: data.data.books})
  },
  buyone(e){

    var lists = this.data.lists;
    var list = []
    let book_id=e.currentTarget.id;
    let token=wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let order_id=this.data.order_id;
    let openId=wx.getStorageSync('openid');
    var arrBookid = [];
    arrBookid.push(book_id)
    let json = { book_ids: arrBookid,token:token,user_id:user_id,order_id:order_id,
      pay_method: 6, openId: openId}
      for(var i=0;i<lists.length;i++){
        if(lists[i].book_id == book_id){
          list.push(lists[i])
        }
      }
      wx.navigateTo({
          url: '/pages/home/buyone/buyoneConfirm/buyoneConfirm?json=' + encodeURIComponent(JSON.stringify(json)) + '&lists=' + encodeURIComponent(JSON.stringify(list))
      })

  },
  checkall(){
    let lists = this.data.lists;
    if (this.data.checkall === true){
      lists.forEach((item)=>{
        item.checked = false
      })
    }else{
      lists.forEach((item) => {
        item.checked = true
      })
    }
    this.setData({ checkall: !this.data.checkall,lists:lists});
  },
  checked(e){
    let params = {};
    params['lists[' + e.currentTarget.id + '].checked'] = !this.data.lists[e.currentTarget.id].checked;
    console.log(params)
    this.setData(params);

  },
  buyall(){
    let lists = this.data.lists;
    let book_ids = [];
    lists.forEach((item)=>{
      if (item.checked === true && item.is_purchased==0){
         book_ids.push(item.book_id);
      }
    })
    if(book_ids.length===0){
      return false
    }
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let order_id = this.data.order_id;
    let openId = wx.getStorageSync('openid');
    let json = {
      book_ids: book_ids, token: token, user_id: user_id, order_id: order_id,
      pay_method: 6, openId: openId
    }

      wx.navigateTo({
          url: '/pages/home/buyone/buyoneConfirm/buyoneConfirm?json=' + encodeURIComponent(JSON.stringify(json)) + '&lists=' + encodeURIComponent(JSON.stringify(this.data.lists))
      })
  }
})
var app = getApp();
Page({
  data:{
    name:""
  },
  name(e){
    this.setData({name:e.detail.value});
  },
  add(){
    if(this.data.name===""){
      return false
    }
    let json = app.token({ cate_name : this.data.name});
    app.request('book/communitytwo/user_cate_add','POST',json,'addb',this);
  },
  addb(data){
    if(data.code!=200){
      wx.showToast({title: data.msg,icon:"none"});
      return false
    }
    wx.showToast({ title: data.msg ,duration:1000});
    let page = getCurrentPages()[getCurrentPages().length-2];
    page.refresh();
    setTimeout(()=>{
      wx.navigateBack({delta : 1});
    },1000)
  }
})
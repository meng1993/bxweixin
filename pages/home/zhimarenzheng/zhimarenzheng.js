var app=getApp();
Page({
  onLoad(){

  },
  data:{
    name:"",
    zheng:""
  },
  name(e){
    this.setData({name:e.detail.value})
  },
  zheng(e){
    this.setData({ zheng: e.detail.value })
  },
  shouquan(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    if(this.data.name==""||this.data.name.length<2){
      app.tishi('提示','请填写真实姓名');
      return false
    }
    let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/; 
    if(!reg.test(this.data.zheng)){//身份证验证不通过
      app.tishi('提示', '身份证格式有误');
      return false
    }
    let user_id=wx.getStorageSync('userdata').user_id;
    let json = {
      user_id: user_id, name: this.data.name, certNo: this.data.zheng, option:1
    }
    app.request('index/zhima/handleUserIdentityInfo','POST',json,'shouquanb',this);
  },
  shouquanb(data){
//    console.log(data)
    if (data.code != 200 || data.data.status==0){     
        app.tishi('提示', '授权失败');
      return false
    }
    wx.showToast({title: '授权成功',icon:'success',mask:true,duration:1000});
    setTimeout(()=>{
      wx.navigateBack({ delta: 1})
    },1000)
    let pages = getCurrentPages();//页面栈
    var prevPage = pages[pages.length - 2];//上一页Page对象
    prevPage.getxinyong();
  }
})
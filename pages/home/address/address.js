var app=getApp();
Page({
  onLoad(e){
    if(e.id){//修改
      this.setData({
          editType: true
      })
      this.oneaddress(e.id);
    }
  },
  data:{
    region:['北京市','北京市','东城区'],
    name:"",
    phone:"",
    address:"",
    checked:false,
    editType: false,    //false为新增，true为编辑
  },
  oneaddress(id) {//收获地址
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { token: token, userId: user_id, id: id}
    app.request('index/User/userAddressInfo', 'POST', json, 'oneaddressb', this);
  },
  oneaddressb(e) {//地址回调
//    console.log(e)
    if (e.code != 200) {
      return false;
    }
    let data = e.data.addressList;
    this.setData({ region: [data.province, data.city, data.district], 
      name: data.address_name, phone: data.mobile, address: data.address,
    addressid: data.id });
    if (data.is_set_default==1){
      this.setData({ checked:true})
    }
  },
  name(e){
    this.setData({name:e.detail.value})
  },
  phone(e) {
    this.setData({ phone: e.detail.value })
  },
  address(e) {
    this.setData({ address: e.detail.value })
  },
  checked(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    this.setData({checked:!this.data.checked})
  },
  bindRegionChange(e){
    this.setData({ region:e.detail.value,editType: true });
  },
  save(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    if (this.data.name==""){
      app.tishi('提示','请填写收货人');
      return false;
    }
    if (this.data.phone == "") {
      app.tishi('提示', '请填写手机号');
      return false;
    }
    if (this.data.phone.length!=11){
      app.tishi('提示', '请填写正确手机号');
      return false;
    }
    if (this.data.address==""){
      app.tishi('提示', '请填写详细地址');
      return false;
    }
    let token=wx.getStorageSync('token');
    let userId = wx.getStorageSync('userdata').user_id;
    let address_name=this.data.name;
    let province = this.data.region[0];
    let city=this.data.region[1];
    let district = this.data.region[2];
    let address = this.data.address;
    let mobile=this.data.phone;
    let is_set_default = 0;
    if (this.data.checked==true){
      is_set_default=1;
    }
    let json={
      id:this.data.addressid,
      token: token,
      userId: userId,
      address_name: address_name,
      province: province,
      city: city,
      district: district,
      address: address,
      mobile: mobile,
      is_set_default: is_set_default
    }
//    console.log(json);
    if (this.data.addressid) {//修改
      app.request('index/User/userAddressEdit', 'POST', json, 'saveb', this);
    }else{//新建
      app.request('index/User/userAddressAdd', 'POST', json, 'saveb', this);
    }
  },
  saveb(data){
//    console.log(data);
    if(data.code==200){
      wx.showToast({title: '保存成功',icon:'success',mask:true,duration:1000});
      let pages = getCurrentPages();//页面栈
      var prevPage = pages[pages.length - 2];//上一页Page对象
      prevPage.getaddress(this.data.addressid);//地址列表更新
      setTimeout(()=>{
        wx.navigateBack({delta:1})
      },1000)
    }else{
      app.tishi('提示',data.msg);
    }
  }
})
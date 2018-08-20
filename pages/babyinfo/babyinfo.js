var app = getApp();

Page({
  onLoad(){
    this.getinfo();
  },
  data:{
    babylist:[],
    babylist2:[],
    removearr:[]
  },
  getinfo(){
    let token = wx.getStorageSync('token');
    let user_id = wx.getStorageSync('userdata').user_id;
    let json = { token:token, user_id: user_id}
    app.request('book/communitytwo/baby_list', 'POST', json,'getinfob',this);
  },
  getinfob(data){
    if(data.code!=200){
      app.tishi('提示',data.msg);
      return false
    }     
    if (data.data.length==0){
      data.data.push({ baby_nick: "", baby_birthday: "", baby_sex: "1" })
      this.setData({ babylist2: data.data });
      return false;
    }
    this.setData({ babylist: data.data });
  },
  input(e) {
    let index = e.currentTarget.id;
    let value = e.detail.value;
    let params = {};
    params['babylist[' + index + '].baby_nick'] = value;
    this.setData(params);
  },
  bindDateChange(e) {
    let index = e.currentTarget.id;
    let value = e.detail.value;
    let params = {};
    params['babylist[' + index + '].baby_birthday'] = value;
    this.setData(params);
  },
  radioChange(e) {
    let index = e.currentTarget.id;
    let value = e.detail.value;
    let params = {};
    params['babylist[' + index + '].baby_sex'] = value;
    this.setData(params);
  },
  input2(e) {
    let index = e.currentTarget.id;
    let value = e.detail.value;
    let params = {};
    params['babylist2[' + index + '].baby_nick'] = value;
    this.setData(params);
  },
  bindDateChange2(e) {
    let index = e.currentTarget.id;
    let value = e.detail.value;
    let params = {};
    params['babylist2[' + index + '].baby_birthday'] = value;
    this.setData(params);
  },
  radioChange2(e) {
    let index = e.currentTarget.id;
    let value = e.detail.value;
    let params = {};
    params['babylist2[' + index + '].baby_sex'] = value;
    this.setData(params);
  },
  save() {//保存已有宝贝信息
    let babylist = this.data.babylist;
    if (babylist.length==0){
       this.save2();
       return false
    }
    for (let i = 0; i < babylist.length; i++) {
      if (babylist[i].baby_nick === "" || babylist[i].baby_birthday === "") {
        app.tishi('提示', '请完善宝贝信息')
        return false
      }
    }
    let json = {
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id,
      baby_info: this.data.babylist
    }
    app.request('book/communitytwo/edit_baby_info', 'POST', json, 'savb', this)
  },
  savb(data) {
    if(data.code!=200){
      app.tishi('提示',data.msg);
      return false;
    }
    if (this.data.babylist2.length==0){
      app.tishi('提示', data.msg);
      return false;
    }
    this.save2();
  },
  save2() {//保存新添加宝贝信息
    let babylist = this.data.babylist2;
    for (let i = 0; i < babylist.length; i++) {
      if (babylist[i].baby_nick === "" || babylist[i].baby_birthday === "") {
        app.tishi('提示', '请完善宝贝信息')
        return false
      }
    }
    let json = {
      token: wx.getStorageSync('token'),
      user_id: wx.getStorageSync('userdata').user_id,
      baby_info: babylist
    }
    app.request('book/communitytwo/add_baby_info', 'POST', json, 'sav2b', this)
  },
  sav2b(data) {
      app.tishi('提示', data.msg);
  },
  add(){
    let params = { baby_nick: "", baby_birthday: "", baby_sex: "1" }
    let babylist2 = this.data.babylist2;
    babylist2.push(params);
    this.setData({ babylist2: babylist2 })
  },
  remove(e){//删除已有的
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确定删除?',
      success(res){
        if(res.confirm){
          let id = e.currentTarget.id;
          let index = e.currentTarget.dataset.index;
          let babylist = _this.data.babylist;
          babylist.splice(index, 1);
          _this.setData({ babylist: babylist });
          let json = {
            token: wx.getStorageSync('token'),
            user_id: wx.getStorageSync('userdata').user_id,
            baby_id: id
          }
          app.request('book/communitytwo/delete_baby_info', 'POST', json, 'removeb', _this)
        }
      }
    })   
  },
  removeb(data){
    app.tishi('提示', data.msg);
  },
  remove2(e){//删除新填未保存过的
    let index = e.currentTarget.dataset.index;
    let babylist = this.data.babylist2;
    babylist.splice(index, 1);
    this.setData({ babylist2: babylist });
  }
})
var app = getApp();
Page({
  onLoad(e){
    if(e.hebin){
      let cate_id = wx.getStorageSync('cate_id');
      let cate_title = wx.getStorageSync('cate_title');
      wx.setNavigationBarTitle({ title: "合并至-" + cate_title })
      this.setData({ cate_id: cate_id, cate_title: cate_title});   
    }
    this.list();
  },
  data:{
    page:1,
    ling:0
  },
  onReachBottom() {
    if (this.data.nomore) {
      return false;
    }
    this.setData({ page: this.data.page + 1 });
    this.list();
  },
  refresh(){
    this.setData({list:[],page:1});
    this.list();
  },
  list(){
    let json = app.token({page:this.data.page});
    app.request('book/communitytwo/user_cate_list','POST',json,"listb",this);
  },
  listb(data){
    if(data.code!=200){
      return false
    }
    if(this.data.page===1){
      this.setData({ all_book: data.data.all_book})
    }
    
    if (data.data.cate_list.length<20){
      this.setData({nomore:true});
    }
    if (this.data.cate_id){//合并
      for (let i = 0; i < data.data.cate_list.length;i++){
        console.log(data.data.cate_list[i].cate_id , this.data.cate_id)
        if (data.data.cate_list[i].cate_id==this.data.cate_id){
          data.data.cate_list.splice(i,1);
        }
      }
    }
    this.setData({ list: (this.data.list || []).concat(data.data.cate_list) });
  },
  add(){
    wx.navigateTo({ url:"/pages/shuwu/addfenlei/addfenlei"})
  },
  remove(e){
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '删除该分类？',
      success(res){
        if(res.confirm){
          let json = app.token({ cate_id: e.currentTarget.id });
          app.request('book/communitytwo/user_cate_delete', 'POST', json, 'removeb', _this);
        }
      }
    })
    
  },
  removeb(data){
    if (data.code != 200) {
      return false
    }
    this.refresh();
  },
  check(e){
    if(this.data.edit===1){
      return false;
    }
    if (this.data.cate_id){
      if (this.data.cate_id == e.currentTarget.id){
        return false
      }
      this.hebin(e.currentTarget.id, e.currentTarget.dataset.t);
      return false
    }
    let page = getCurrentPages()[getCurrentPages().length - 2];
    page.setData({ fenlei: e.currentTarget.id, fenleititle: e.currentTarget.dataset.t});
    page.refresh();
    page.cangshu();
    wx.navigateBack({delta:1})
  },
  check2(){
    let page = getCurrentPages()[getCurrentPages().length - 2];
    page.setData({ fenlei: 0, fenleititle: 0 });
    page.refresh();
    page.cangshu();
    wx.navigateBack({ delta: 1 })
  },
  edit(){
    this.setData({edit:1});
  },
  input(e){
    let index = e.currentTarget.dataset.index;
    let cate_id = e.currentTarget.id;
    let oldvalue = this.data.list[index].title;
    let value = e.detail.value;
    if (oldvalue!==value){
      this.setData({index:index,value:value})
      let json = app.token({ cate_id: cate_id, cate_name: value});
      app.request('book/communitytwo/user_cate_edit','POST',json,'inputb',this);
    }
  },
  inputb(data){
    if (data.code != 200) {
      wx.showToast({ title: data.msg, icon: "none", duration: 1000 })
    }else{
      let params = {}
      params['list['+this.data.index+'].title']=this.data.value;
      this.setData(params);
      wx.showToast({ title: data.msg, icon: "success", duration: 1000 })
    }
    this.setData({edit:0});
  },
  hebin(id,t){
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '合并' + t + '至' + _this.data.cate_title+'?',
      success(res){
        if(res.confirm){
          let json = app.token({ save_cate_id: _this.data.cate_id, delete_cate_id: id });
          app.request('book/communitytwo/user_cate_mix', 'POST', json, 'hebinb', _this);
        }
      }
    })
  },
  hebinb(data){  
    if (data.code != 200) {
      wx.showToast({ title: data.msg, icon: "none", duration: 1000,mask:true })
      return false
    }
    wx.showToast({ title: data.msg, icon: "success", duration: 1000, mask: true})
    let page = getCurrentPages()[getCurrentPages().length - 3];
    page.refresh();
    page.cangshu();
    this.refresh();
    setTimeout(()=>{
      wx.navigateBack({delta : 2});
    },1000)
  }
})
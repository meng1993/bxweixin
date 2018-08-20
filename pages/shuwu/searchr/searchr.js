var app = getApp();
Page({
  onLoad(e){
    this.setData({ keyword: e.keyword});
    this.getlist();
  },
  onReachBottom() {
    if (this.data.nomore) {
      if (this.data.tishi === 0) {
        wx.showToast({
          title: '已显示全部~', icon: "none", duration: 700
        })
        this.setData({ tishi: 1 })
      }
      return false;
    }
    this.setData({ page: this.data.page + 1 });
    this.getlist();
  },
  data:{
    page: 1,
    tishi:0,
    list:""
  },
  getlist(){
     let cate_id = wx.getStorageSync('cate_id');
     let json = app.token({
       keyword: this.data.keyword,
       page:this.data.page,
       cate_id: cate_id
     })
     //wx.showLoading();
     app.request('book/communitytwo/search_book','POST',json,'listb',this);
  },
  listb(data){
      //wx.hideLoading();
      if (data.code != 200) {
        app.tishi('提示', data.msg);
        return false;
      }
      if (this.data.page === 1 && data.data.length === 0) {
        this.setData({ list: [], nomore: true });
        return false
      }
      if (data.data.length < 10) {
        this.setData({ nomore: true });
      }
      let checkeds = this.data.checkeds;
      data.data.forEach((res) => {
        res.addshuwu = 0;
        if (res.has_join === 1){
          res.addshuwu = 1;
        }
      });
      this.setData({ list: (this.data.list === "" ? [] : this.data.list).concat(data.data) });
  },
  refresh() {
    this.setData({ list: "", page: 1, nomore: false, tishi: 0 })
  },
  search(e){
    if(e.detail.value==""){
      wx.showToast({title:"请输入关键字",icon:"none",duration:700});
      return false
    }
    this.refresh();
    this.setData({ keyword: e.detail.value});
    this.getlist();
  },
  getdetail(e){
    if(e.currentTarget.id!=""){
      wx.navigateTo({ url:"/pages/detail/detail?bookid=" + e.currentTarget.id});
    }
  },
  inshelf(e){
    let index = e.currentTarget.dataset.index;
    let list = this.data.list;
    if(list[index].addshuwu===1){
      wx.showToast({ title: "已在书屋~", icon: "none", duration: 700 });   
      return false
    }
    let book_id = e.currentTarget.dataset.book_id;
    let cate_id = wx.getStorageSync('cate_id');
    let json = app.token({ book_id: book_id,cate_id:cate_id});
    this.setData({ index: index})
    app.request('book/communitytwo/search_book_insert','POST',json,'inb',this);
  },
  inb(data){
    wx.showToast({ title: data.msg, icon: "none", duration: 700 });  
    if(data.code === 200){
      let params ={};
      params['list['+this.data.index+'].addshuwu'] = 1;
      this.setData(params);
      let page = getCurrentPages()[getCurrentPages().length - 4];
      page.refresh();
    }
  }
})
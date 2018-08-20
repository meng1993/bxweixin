let app = getApp();
Page({
  onLoad(e) {
    this.setData({plan_id:e.id,date:e.date})
    this.jilu(e);
  },
  data: {
    dayimgs:[]
  },
  jilu() {
    let json = app.token({plan_id: this.data.plan_id});
    app.request('book/communitytwo/baby_sign_detail', 'POST', json, 'detailb', this, );
  },
  detailb(data) {
    if (data.code != 200) {
      app.tishi("提示", data.msg);
      return false
    }
    data.data.sign_info.forEach((item) => {
      item.img = item.img.split('@')[0];
      item.book_id = item.book_id === 0 ? "" : item.book_id
    })
    this.setData({ dayimgs: data.data.sign_info, remark: data.data.remark, oldremark: data.data.remark});
  },
  remove(e){
    let imgs = this.data.dayimgs;
    imgs.splice(e.currentTarget.id,1);
    this.setData({ dayimgs : imgs, imgchange:1});
  },
  goshuwu(e){
    wx.navigateTo({ url: '/pages/shuwu/shuwu?from=find&edit=1'});
  },
  remark(e){
    this.setData({ remark : e.detail.value });
  },
  save() {   
    if (this.data.imgchange!==1&&this.data.remark===this.data.oldremark){//没改动
      wx.navigateBack({delta:1});
      return false
    }
    if (this.data.dayimgs.length === 0) {
      wx.showToast({ title: "请添加绘本~", duration: 800, icon: "none" });
      return false;
    }
    let date = this.data.date;
    let plan_id = this.data.plan_id;
    let remark = this.data.remark || "";
    let sign_list = [];
    this.data.dayimgs.forEach((item) => {
      sign_list.push({
        book_id: item.book_id === 0 ? "" : item.book_id , user_study_id: item.user_study_id,
        img: item.img, "type": item.book_id === "" ? "photograph" : "order"
      })
    })
    if (sign_list.length > 20) {
      wx.showToast({ title: "最多可选20本~", duration: 800,icon:"none"});
      return false;
    }
    
    let json = app.token({
      date: date, remark: remark, sign_list: sign_list, plan_id: plan_id
    })
    app.request('book/communitytwo/baby_sign_update', 'POST', json, "editb", this)
  },
  editb(data){
    if(data.code!=200){
      return false
    }
    wx.showToast({ title: "保存成功", duration: 800 });
    let page = getCurrentPages()[getCurrentPages().length - 2];
    page.refresh();
    page.jilu();
    page.setData({hadedit:1});
    setTimeout(()=>{
      wx.navigateBack({delta:1})
    },800)
  },
  detail(e) {//去绘本详情页
    if (app.repeat(e.timeStamp) == false) { return; }
    let bookid = e.currentTarget.id;
    if (bookid != 0 && bookid != "") {
      wx.navigateTo({ url: '/pages/detail/detail?bookid=' + bookid });
      return false
    }
    let src = e.currentTarget.dataset.src;
    let arr = [];
    for (let i = 0; i < this.data.dayimgs.length; i++) {
      arr.push(this.data.dayimgs[i].img);
    }
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: arr// 需要预览的图片http链接列表
    })
  }
})
var app = getApp();
Page({
  onLoad(e){
    this.setData({_type:e.id})
    if(e.id=="2"){//智能选书
      wx.setNavigationBarTitle({ title: '智能选书' })
      this.setData({zhineng:true})
    }
    this.searchCondition();
  },
  onShow(){
    this.setData({
      title: "",
      age: 0,
      agehave: false,
      fenlei: [],
      fenleiname: [],
      lan: 0,
      lanhave: false
      });
    this.searchCondition();
  },
  data:{
    title:"",
    age:0,
    agehave:false,
    fenlei:[],
    fenleiname:[],
    lan:0,
    lanhave:false
  },
  searchCondition() {//获取搜索条件列表
    app.request('book/index/searchCondition', 'GET', { 'type': '1' },'searchConditionb',this);
  },
  searchConditionb(data){
    //console.log(data.data)
    this.setData({ lists1: data.data[0], lists2: data.data[1],lists3: data.data[3]})
  },
  title(e){
    this.setData({title:e.detail.value});
  },
  age(e){//选择年龄
    let index = e.currentTarget.id;  
    let param=new Object();
    param['lists1.data[' + this.data.age +'].checked']=false;
    this.setData(param);//取选旧的
    if (index == this.data.age && this.data.agehave==true) {
      this.setData({ agehave:false})
      return false;
    }
    let param2 = new Object();
    param2['lists1.data[' + index + '].checked'] = true;
    this.setData(param2);//选新的
    this.setData({ age: index, agehave:true})
  },
  fenlei(e){//分类
    let index = e.currentTarget.id;
    let lists2 = this.data.lists2.data;
    if (lists2[index].checked == true) {//取选
      let param = new Object();
      param['lists2.data[' + index + '].checked'] = false;
      this.setData(param);
      let fenlei=this.data.fenlei;//数组
      let fenleiname = this.data.fenleiname;//名字数组
      let param_id = lists2[index].param_id;//选中的id
      fenlei.forEach((item,index)=>{
        if (item == param_id){
          fenlei.splice(index, 1);
          fenleiname.splice(index,1);
        }
      })   
      this.setData({ fenlei: fenlei})
    }else{//新加
      if (this.data.fenlei.length>=3){
        wx.showToast({ title: '最多选择三类',icon:'none'});
        return false;
      }
      let param = new Object();
      param['lists2.data[' + index + '].checked'] = true;
      this.setData(param);//选新的
      let fenlei = this.data.fenlei;
      let fenleiname = this.data.fenleiname;
      fenlei.push(lists2[index].param_id);
      fenleiname.push(lists2[index].name);
      this.setData({ fenlei: fenlei, fenleiname: fenleiname});
    }
  },
  language(e){
    let index = e.currentTarget.id;
    let param = new Object();
    param['lists3.data[' + this.data.lan + '].checked'] = false;
    this.setData(param);//取选旧的
    if (index == this.data.lan && this.data.lanhave == true) {
      this.setData({ lanhave: false })
      return false;
    }
    let param2 = new Object();
    param2['lists3.data[' + index + '].checked'] = true;
    this.setData(param2);//选新的
    this.setData({ lan: index, lanhave: true })
  },
  go(e){
    if (app.repeat(e.timeStamp) == false) { return; }
    let token = wx.getStorageSync('token');
    let user_id = "";
    if (wx.getStorageSync('userdata').user_id){
      user_id = wx.getStorageSync('userdata').user_id;
    }
    let title = this.data.title;
    let start_date=wx.getStorageSync('date');
    let common_params=[];
    common_params[0] = {}; common_params[1] = {}; common_params[2] = {};
    common_params[0].checked_ids = []; common_params[1].checked_ids = []; common_params[2].checked_ids = [];
    common_params[0].condition_id=4;//年龄
    let searchbiaoqian = this.data.fenleiname;
    if (this.data.agehave==true){
      common_params[0].checked_ids[0] = this.data.lists1.data[this.data.age].param_id;
      searchbiaoqian.unshift(this.data.lists1.data[this.data.age].name);
    }else{
      common_params[0].checked_ids=[];
    }
    common_params[2].condition_id = 3;//语言
    if (this.data.lanhave == true) {
      common_params[2].checked_ids[0] = this.data.lists3.data[this.data.lan].param_id;
      searchbiaoqian.unshift(this.data.lists3.data[this.data.lan].name);
    } else {
      common_params[2].checked_ids = [];
    }
    common_params[1].condition_id = 1;//分类
    common_params[1].checked_ids = this.data.fenlei;
    let data = {
        token: token, user_id: user_id, title: title, start_date: start_date,
      common_params: common_params,
      }
    wx.setStorageSync('search', data);   
    wx.setStorageSync('searchbiaoqian', searchbiaoqian);
    let _from=''
    if(this.data.zhineng==true){
      _from='智能'
    }
    wx.navigateTo({
      url: '/pages/index/search/search?from='+_from,  
    })
  }
})
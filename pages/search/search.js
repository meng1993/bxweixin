var app=getApp();
Page({
  onLoad(e){
    let historyarr= wx.getStorageSync('historyarr');
    if(historyarr!=""){//存在历史记录，展示出来
      this.setData({ historyarr: historyarr });
    }    
  },
  data:{
    typearr: [{ name: '书名', index: 1 }, { name: '系列', index: 2 },
     { name: '作者', index: 3 }, { name: '出版社', index: 4 }],
    typearrindex:0,
    // typecheck: { name: '书名', index: 1 }
    Keyword:'',
    historyarr:[],
    havebook:true //隐藏
  },
  onHide(){//储存历史记录
    wx.setStorageSync('historyarr', this.data.historyarr);
  },
  Sbooktypechange(e){//修改搜索类型
    this.setData({ typearrindex:e.detail.value})
  },
  Ssearchconfirm(e){//点击搜索
    if (app.repeat(e.timeStamp) == false) { return; }
    if(e.detail.value===""){
      return false
    }
    this.searchhistory(e.detail.value);//搜索历史  
    this.setData({ Keyword: e.detail.value, novalue: ""});//关键字&清空input
    let typecheck = this.data.typearr[this.data.typearrindex].index;
    let _this=this;

    app.request('book/index/classifiedSearch', 'get', {"type": typecheck, "keywords": e.detail.value},
        'SsearchconfirmSuccess', _this);
    // wx.request({
    //   url: app.data.http+'book/index/classifiedSearch', //仅为示例，并非真实的接口地址
    //   data: {
    //     "type": typecheck,
    //     "keywords": e.detail.value
    //   },
    //   success: function (res) {
    //     let data=res.data;
    //     if (data.code=="200"){
    //       if (data.data.length==0){//没有结果
    //         _this.setData({ havebook:false});
    //       }else{//有结果
    //         _this.setData({ havebook: true});
    //         wx.navigateTo({//跳转到搜索结果页面
    //           url: '../searchres/searchres?typearrindex=' + _this.data.typearrindex + '&keywords=' + e.detail.value
    //         })
    //       }
    //     }
    //   }
    // })
  },
  SsearchconfirmSuccess(res){
    console.log(JSON.stringify(res))
    let data=res.data;
    if (res.code=="200"){
        if (data.length==0){//没有结果
            this.setData({ havebook:false});
        }else{//有结果
            this.setData({ havebook: true});
            wx.navigateTo({//跳转到搜索结果页面
                url: '../searchres/searchres?typearrindex=' + this.data.typearrindex + '&keywords=' + this.data.Keyword
            })
        }
    }
  },
  searchhistory(value) {//添加&修改搜索历史
    let _historyarr = this.data.historyarr;
    for (let i = 0; i < _historyarr.length; i++) {//判断重复
      if (_historyarr[i] == value) {
        return false;
      }
    }
    _historyarr.unshift(value);
    if (_historyarr.length > 10) {//限制10个
      _historyarr.pop();
    }
    this.setData({ historyarr: _historyarr, nohistory: false})
  },
  clearhistory(){//删除历史记录
    let _this=this;
    wx.showModal({
      title: '提示',
      content: '删除历史搜索记录？',
      confirmColor: '#FF4500',
      success(res){
        if(res.confirm){//确定删除历史记录
          _this.setData({ historyarr: [], nohistory: true});
        }
      }
    })
  },
  historysearch(e){//搜索历史记录，调用input搜索函数
    this.Ssearchconfirm({ detail: { value: e.currentTarget.dataset.text}});   
  },
  removeonehistory(e){//删除一条历史记录
    let one = e.currentTarget.id;
    let _historyarr = this.data.historyarr;
    _historyarr.splice(one,1);
    this.setData({ historyarr: _historyarr});
    if (_historyarr.length==0){//记录数为0 隐藏记录栏
      this.setData({ nohistory: true });
    }
  }
})
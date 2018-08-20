// pages/oldBookRecycling/checkList/checkList.js
//获取过来的list中手动添加了czyNum和checkType
var app = getApp();
Page({
  data: {
    checkType: false,
    num: 1,         //几本书
    selectNum: 0,   //选中了几本书
    eggNum: 0,     //能兑换鸟蛋总数
    list: [],
    pageSize: 10,
    currentPage: 1,     //当前加载到第几页
    keyword: '',        //用户输入的值
    boxNum: 0,           //书筐中书的总数
    emptyContent: '请搜索书籍后，添加到书筐',
    searchType: false,     //搜索类型，false是输入框搜索，true是扫码搜索
    focus: false,        //是否自动获取input焦点
  },
onLoad(e){
  console.log(e.type);
  var that = this;
  setTimeout(function () {
      if(e.type == 'scan'){
          that.toSweep()
      }
      else if(e.type == 'ss'){
          that.setData({
              focus: true
          })
      }
  },500)

},
  onShow: function () {
      this.getBoxNum();
  },
    getBoxNum(){
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        //书筐中书的总数
        app.request('book/reclaim/reclaim_cart_allnum', 'POST', { token: token,user_id:user_id },
            'getBoxNumSuccess', this);
    },
    getBoxNumSuccess(res){
      console.log(res)
        let boxNum = res.data.reclaim_cart_allnum
        this.setData({
            boxNum: boxNum
        });
    },
    // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
        if(this.data.keyword == ''){
            // 请求成功、关闭下拉刷新
            setTimeout(function(){
                wx.stopPullDownRefresh()
            },200)
            return false;
        }
      //刷新时候，初始化currenPage、list
      this.setData({
          currentPage: 1,
          list: [],
          // keyword:'',
          selectNum: 0,   //选中了几本书
          eggNum: 0,     //能兑换鸟蛋总数
      })
      this.searchMessage(this.data.keyword,this.data.currentPage)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
        currentPage: this.data.currentPage + 1
    })
    this.searchMessage(this.data.keyword,this.data.currentPage)
  },
  selectBook(e){
    let bookId = e.currentTarget.dataset.id
    let list = this.data.list
    for(var i=0;i<list.length;i++){
      if(bookId == list[i].book_reclaim_id){
        if(list[i].checkType){
            list[i].checkType = false
            this.setData({
                list: list,
                selectNum: this.data.selectNum - list[i].czyNum,
                eggNum: this.data.eggNum - list[i].czyNum*list[i].score
            })
        }
        else {
            list[i].checkType = true
            this.setData({
                list: list,
                selectNum: this.data.selectNum + list[i].czyNum,
                eggNum: this.data.eggNum + list[i].czyNum*list[i].score
            })
        }
      }
    }
  },
  addNum(e){
    let bookId = e.currentTarget.dataset.id
    let list = this.data.list
      for(var i=0;i<list.length;i++){
          if(bookId == list[i].book_reclaim_id){
              console.log(list[i].czyNum)
              // if(list[i].czyNum < 10 && list[i].checkType){
              if(list[i].czyNum < 10){
                  list[i].czyNum = list[i].czyNum +1
                  if(list[i].checkType){
                      this.setData({
                          list: list,
                          selectNum: this.data.selectNum+1,
                          eggNum: this.data.eggNum + list[i].score
                      })
                  }
                  this.setData({
                      list: list,
                  })
              }
          }
      }

  },
  reduceNum(e){
      let bookId = e.currentTarget.dataset.id
      let list = this.data.list
      for(var i=0;i<list.length;i++){
          if(bookId == list[i].book_reclaim_id){
              console.log(list[i].czyNum)
              // if(list[i].czyNum > 1 && list[i].checkType){
              if(list[i].czyNum > 1){
                  list[i].czyNum = list[i].czyNum - 1
                  if(list[i].checkType){
                      this.setData({
                          list: list,
                          selectNum: this.data.selectNum-1,
                          eggNum: this.data.eggNum - list[i].score
                      })
                  }
                  this.setData({
                      list: list,
                  })
              }
          }
      }

  },
    searchMessage(keyword,pageNum){
      if(this.data.keyword == ''){
          return false;
      }
        app.request('book/reclaim/reclaim_search', 'POST', { keyword: keyword, page: pageNum, pagesize: this.data.pageSize },
            'searchSuccess', this);
    },
    searchSuccess(res){
        console.log(JSON.stringify(res))
        var list = res.data;
        // 请求成功、关闭下拉刷新
        setTimeout(function(){
            wx.stopPullDownRefresh()
        },200)
        if(res.code == 200){
            // 获取的列表中手动添加czyNum（+和-号之间的值）、checkType（区分当前选中和未选中），传入oldBook中
            for(var i=0;i<list.length;i++){
                list[i]['checkType'] = false
                list[i]['czyNum'] = 1
            }
            if(list.length == 0){
                this.setData({
                    emptyContent: '此书未搜索到，暂不回收'
                });
            }
            else if(list.length == 1){
                this.setData({
                    list: this.data.list.concat(list)
                })
                this.selectBook({currentTarget:{dataset:{id:list[0].book_reclaim_id}}})
            }
            else {
                this.setData({
                    list: this.data.list.concat(list)
                })
            }

            var that = this;
            setTimeout(function () {
                if(that.data.searchType && list.length == 0){
                    that.toSweep();
                }
            },1000)
        }

    },
    addBookBox(a){
        // console.log('aaaaaaaaaa------------>'+a)
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        let list = this.data.list
        var reclaim_list = []
        var obj = {}

        for (var i=0;i<list.length;i++){
            obj = {}
            if(list[i].checkType){
                obj['book_reclaim_id'] = list[i].book_reclaim_id
                obj['num'] = list[i].czyNum
                reclaim_list.push(obj)
            }
        }
        if(reclaim_list.length == 0){
            wx.showToast({ title: '请勾选后再添加！',icon: 'none', mask: true, duration: 1000 });
            return false;
        }
        console.log(token,user_id,reclaim_list)
        app.request('book/reclaim/reclaim_cart_add', 'POST', { token: token, user_id: user_id, reclaim_list: reclaim_list },
            'addBookBoxSuccess', this);
    },
    addBookBoxSuccess(res){
        console.log(res)
        if(res.code == 200){
            this.getBoxNum();

            wx.showToast({ title: '加入书筐成功~',icon: 'none', mask: true, duration: 1000 });
        }
        else {
            wx.showToast({ title: res.msg,icon: 'none', mask: true, duration: 1000 });
        }

        var that = this;
        setTimeout(function () {
            if(that.data.searchType){
                that.toSweep();
            }
        },1200)
    },
    toBookBox(){
        wx.navigateTo({
            url: '/pages/oldBookRecycling/bookBox/bookBox'
        })
    },
    changeKeyword(e){
        this.setData({
            keyword: e.detail.value
        })
    },
    toSearch(e){
        console.log('111------>'+this.data.keyword)
        //搜索先初始化数据
        this.setData({
            currentPage: 1,
            list: [],
            selectNum: 0,   //选中了几本书
            eggNum: 0,     //能兑换鸟蛋总数
            searchType: false,      //转换为输入搜索
        })
        this.searchMessage(this.data.keyword,this.data.currentPage)
    },
    toDetail(e){
        let id = e.currentTarget.dataset.id
        wx.navigateTo({ url: '/pages/detail/detail?bookid='+id});
    },
//    扫码
    toSweep(){
        var that = this;
        // 允许从相机和相册扫码
        wx.scanCode({
            success: (res) => {
                console.log('结果---》'+res.result)
                console.log('类型---》'+res.scanType)
                console.log('字符集---》'+res.charset)
                console.log('路径---》' +res.path)
                that.setData({
                    keyword: res.result,
                    currentPage: 1,
                    list: [],
                    selectNum: 0,   //选中了几本书
                    eggNum: 0,     //能兑换鸟蛋总数
                    searchType: true,
                });
                this.searchMessage(this.data.keyword,this.data.currentPage)

            },
            fail:(err) => {
                // console.log(err.errMsg.toLowerCase().indexOf('cancel') != -1)
                if(err.errMsg.toLowerCase().indexOf('cancel') != -1){
                    console.log('取消扫码')
                    return false;
                }
                else {
                    wx.showToast({
                        title: '扫描失败',
                        image: '/img/oldBook/icon_failure.png',
                        duration: 2000
                    })
                }
            }
        })
    }

})
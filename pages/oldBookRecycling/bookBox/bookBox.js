var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      // checkType: false,
      num: 1,
      selectAllType: false,
      currentPage: 1,  //当前加载到第几页
      pagesize: 10,    //一次加载多少本
      selectNum: 0,   //选中了几本书
      eggNum: 0,     //能兑换鸟蛋总数
      list: [],
      editType: true,  //为true，显示编辑，为false显示取消
      emptyContent: '当前书筐0本书，请去添加！',
      emptyBtnText: '去添加'
  },
  onLoad: function (options) {
    this.getBoxList(this.data.currentPage)
  },
   // * 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
      this.setData({
          currentPage: 1,
          list: [],
          selectAllType: false,
          selectNum: 0,
          eggNum: 0
      })
      this.getBoxList(this.data.currentPage)
  },
   // * 页面上拉触底事件的处理函数
  onReachBottom: function () {
    this.setData({
        currentPage: this.data.currentPage + 1
    })
    this.getBoxList(this.data.currentPage)
  },
    getBoxList(page){
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        app.request('book/reclaim/reclaim_cart_list', 'POST', { token: token, user_id: user_id,page: page, pagesize: this.data.pagesize },
            'getBoxListSuccess', this);
    },
    getBoxListSuccess(res){
        let list = res.data;
        // 请求成功、关闭下拉刷新
        setTimeout(function(){
            wx.stopPullDownRefresh()
        },200)
        if(res.code == 200){
            // 获取的列表中手动添加czyNum（+和-号之间的值）、checkType（区分当前选中和未选中），传入oldBook中
            for(var i=0;i<list.length;i++){
                list[i]['checkType'] = false
                list[i]['czyNum'] = list[i].num     //为了和checkList统一，把num赋值给czyNum
            }
            this.setData({
                list: this.data.list.concat(list)
            })
        }
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
                    console.log('selectNum--->'+this.data.selectNum,'czyNum---->'+list[i].czyNum,'eggNum---->'+this.data.eggNum,'score---->'+list[i].score)
                }
                else {
                    // 如果选书超过10本
                    if(parseInt(this.data.selectNum)+parseInt(list[i].czyNum) >10){
                        wx.showToast({ title: '选书不能超过十本！',icon: 'none', mask: true, duration: 1000 });
                        return false;
                    }
                    list[i].checkType = true
                    this.setData({
                        list: list,
                        selectNum: this.data.selectNum + list[i].czyNum,
                        eggNum: this.data.eggNum + list[i].czyNum*list[i].score
                    })
                    console.log('selectNum--->'+this.data.selectNum,'czyNum---->'+list[i].czyNum,'eggNum---->'+this.data.eggNum,'score---->'+list[i].score)
                }
            }
        }
    },
    addNum(e){
        if(this.data.selectNum >=10){
            wx.showToast({ title: '不能超过十本！',icon: 'none', mask: true, duration: 1000 });
            return false;
        }
        let bookId = e.currentTarget.dataset.id
        let list = this.data.list
        for(var i=0;i<list.length;i++){
            if(bookId == list[i].book_reclaim_id){
                // console.log(list[i].czyNum)
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
                        // selectNum: this.data.selectNum+1,
                        // eggNum: this.data.eggNum + list[i].score
                    })
                    console.log(this.data.list[i].czyNum)
                    this.addReduce(bookId,this.data.list[i].czyNum)
                }
            }
        }

    },
    reduceNum(e){
        let bookId = e.currentTarget.dataset.id
        let list = this.data.list
        for(var i=0;i<list.length;i++){
            if(bookId == list[i].book_reclaim_id){
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
                    console.log(this.data.list[i].czyNum)
                    this.addReduce(bookId,this.data.list[i].czyNum)
                }
            }
        }
    },
    selectAll(){
        var list = this.data.list;
        if(this.data.selectAllType){
            // 全不选
            for(var i=0;i<list.length;i++){
                list[i].checkType = false
            }
            this.setData({
                list: list,     //全不选时，list中的checkType全部设置为false
                selectAllType: false,
                selectNum: 0,
                eggNum: 0
            })
        }
        else {
            // 全选
            var selectNum = 0;
            var eggNum = 0;
            console.log(list)
            for(var i=0;i<list.length;i++){
                selectNum = selectNum + list[i].czyNum
            }
            //如果全选书超过十本
            if(selectNum > 10 && this.data.editType){
                wx.showToast({ title: '选书不能超过10本！',icon: 'none', mask: true, duration: 1000 });
                return false;
            }
            selectNum = 0;
            for(var i=0;i<list.length;i++){
                list[i].checkType = true
                selectNum = selectNum + list[i].czyNum
                eggNum = eggNum + list[i].czyNum * list[i].score
            }
            this.setData({
                list: list,     //全选时，list中的checkType全部设置为true
                selectAllType: true,
                selectNum: selectNum,
                eggNum: eggNum
            })
        }
    },
    edit(){
        let list = this.data.list
        for(var i=0;i<list.length;i++){
            list[i].checkType = false
        }
        this.setData({
            list: list,     //全不选时，list中的checkType全部设置为false
            selectAllType: false,
            selectNum: 0,
            eggNum: 0
        })

        this.setData({
            editType: !this.data.editType,
        })

    },
    // 去下单
    toOrder(){
        let list = this.data.list;
        var checkArr = []
        for(var i=0;i<list.length;i++){
            if(list[i].checkType){
                checkArr.push(list[i])
            }
        }
        if(checkArr.length != 0){
            wx.navigateTo({
                url: '/pages/oldBookRecycling/orderConfirm/orderConfirm?list='+encodeURIComponent(JSON.stringify(checkArr))+'&selectNum='+this.data.selectNum+'&eggNum='+this.data.eggNum
            })
        }else {
            wx.showToast({ title: '请勾选后再下单！',icon: 'none', mask: true, duration: 1000 });
        }

    },
    //删除
    delete(){
        var that = this;
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        let list = that.data.list;
        var book_reclaim_ids = []
        for(var i=0;i<list.length;i++){
            if(list[i].checkType){
                book_reclaim_ids.push(list[i].book_reclaim_id)
            }
        }
        if(book_reclaim_ids.length != 0){
            wx.showModal({
                title: '提示',
                content: '您是要删除选中的书吗',
                success: function(res) {
                    if (res.confirm) {
                        //删除选中的书
                        app.request('book/reclaim/reclaim_cart_delete', 'POST', { token: token, user_id: user_id,book_reclaim_ids: book_reclaim_ids},
                            'deleteSuccess', that);
                    }
                }
            })

        }else {
            wx.showToast({ title: '请勾选后再删除！',icon: 'none', mask: true, duration: 1000 });
        }
    },
    deleteSuccess(res){
      console.log(res)
        wx.showToast({ title: '删除成功！',icon: 'none', mask: true, duration: 1000 });
      this.setData({
          list: []
      })
      this.getBoxList()
    },
    //加或减方法
    addReduce(book_reclaim_id,book_num){
        let token=wx.getStorageSync('token');
        let user_id=wx.getStorageSync('userdata').user_id;
        app.request('book/reclaim/reclaim_cart_num_change', 'POST', { token: token, user_id: user_id,book_reclaim_id: book_reclaim_id, book_num: book_num },
            'addReduceSuccess', this);
    },
    addReduceSuccess(res){
        console.log(res)
    },
    btn_add(){
      // wx.navigateTo({url: '/pages/oldBookRecycling/checkList/checkList'})
        wx.navigateBack()
    },
    toDetail(e){
        let id = e.currentTarget.dataset.id
        wx.navigateTo({ url: '/pages/detail/detail?bookid='+id});
    },
})
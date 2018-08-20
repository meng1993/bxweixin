var app = getApp();
Page({
  data:{
    num:1,
    product_id: '',
      productMessage: '',    //产品信息
    swiperMessage: {
        indicatorDots: true,
        autoplay: true,
        interval: 3000,
        duration: 1000
    },
      sku1_list: [],
      sku2_list: [],
      click_id1: -1,  //sku1_list对应样式值
      click_id2: -1,     //sku2_list对应样式值
      priceMessage: '',  //sku1_list临时存数据
      priceMessage1: '',  //sku1_list临时存数据
      priceMessage2: '',    //sku2_list临时存数据
  },
  onLoad: function (options) {
    this.setData({
        product_id: options.product_id
    });
    this.getMessage()
  },
  jia(){
    this.setData({num:this.data.num+1});
  },
  jian(){
    if(this.data.num>1){
      this.setData({ num: this.data.num - 1 });
    }
  },
  getMessage: function () {
      let that = this
      app.request('book/product/brand_product', 'POST', { product_id: that.data.product_id},
          'getMessageSuccess', that);
      // wx.request({
      //     url: app.data.http +'book/product/brand_product',
      //     method:'post',
      //     data: {product_id: that.data.product_id},
      //     success(res){
      //         console.log(JSON.stringify(res))
      //         that.setData({
      //           productMessage: res.data.data,
      //             sku1_list: res.data.data.sku1_list,
      //             sku2_list: res.data.data.sku2_list
      //         })
      //         // let data = res.data.data;
      //     }
      // })
  },
    getMessageSuccess(res){
        this.setData({
            productMessage: res.data,
            sku1_list: res.data.sku1_list,
            sku2_list: res.data.sku2_list
        })

        this.check1({currentTarget:{id:0,dataset:{title:this.data.sku1_list[0]}}});
        this.check2({currentTarget:{id:0,dataset:{title:this.data.sku2_list[0]}}});
        // let data = res.data.data;
    },
    check1: function (e) {
        let id = e.currentTarget.id
        let arr = this.data.sku1_list
        let title = e.currentTarget.dataset.title
        var title2=this.data.click_id2 != '-1' ? this.data.sku2_list[this.data.click_id2] : '';
        let obj = this.data.productMessage.sku_arr[title]  //(选择颜色后对应的规格有哪些(遍历出来的对象))
        console.log(obj)
        var titleArr = []       // 属性(相当于this.data.sku1_list)
        var titleArr2 = []      // 属性值(相当于this.data.sku2_list)
        let click_id2=-1;
        for (var Key in obj){
            titleArr.push(Key)
            titleArr2.push(obj[Key]);
            if(Key===title2){
                click_id2 = titleArr2.length-1;
            }
        }
        this.setData({
            click_id1: e.currentTarget.id,
            click_id2: click_id2,
            sku1_list: arr,
            sku2_list: titleArr,
            priceMessage2: titleArr2        //把价格对象临时存在pri..2中，点击下边按钮时筛选
        });

        if(this.data.sku2_list[0] == ''){
            // 如果只能选颜色、不能选规格
            this.setData({
                priceMessage: obj['']
            });
            return false;
        }
        else if(this.data.click_id2 != '-1'){
            // 如果两个都能选、且规格已经选过
            this.setData({
                priceMessage: this.data.priceMessage2[click_id2]
            });
            console.log(JSON.stringify(this.data.priceMessage))
        }
    },
    check2: function (e) {
        let id = e.currentTarget.id
        let arr2 = this.data.sku2_list
        let title = e.currentTarget.dataset.title

        let obj = this.data.productMessage.sku_arr_reverse[title]  //(选择规格后对应的颜色有哪些(遍历出来的对象))
        console.log(obj[''])
        var titleArr = []       // 属性(相当于this.data.sku1_list)
        var titleArr2 = []      // 属性值(相当于this.data.sku2_list)
        for (var Key in obj){
            titleArr.push(Key)
            titleArr2.push(obj[Key])
        }
        this.setData({
            click_id2: e.currentTarget.id,
            sku2_list: arr2,
            sku1_list: titleArr,
            priceMessage1: titleArr         //把价格对象临时存在pri..1中，点击上边按钮时筛选
        })

        if(this.data.sku1_list[0] == ''){
            // 如果只能选规格、不能选颜色
            this.setData({
                priceMessage: obj['']
            });
            return false;
        }
        else if(this.data.click_id1 != '-1'){
            // 如果两个都能选、且颜色已经选过
            this.setData({
                priceMessage: this.data.priceMessage2[id]
            })
            console.log(JSON.stringify(this.data.priceMessage))
        }

    },
    toBuy: function (e) {
        // 如果存在二维数组（两个选项）
        if(this.data.sku1_list[0] != '' && this.data.sku2_list[0] != ''){
            if(this.data.click_id1 == -1 || this.data.click_id2 == -1){
                wx.showToast({ title: '请选择产品', mask: true, duration: 1000, icon: 'none' });
                return false;
            }

        }
        // 如果第一个选项不存在，第二个选项存在
        else if(this.data.sku1_list[0] == '' && this.data.sku2_list[0] != ''){
            if(this.data.click_id2 == -1){
                wx.showToast({ title: '请选择产品', mask: true, duration: 1000, icon: 'none' });
                return false;
            }

        }
        //如果第二个选项不存在，第一个选项存在
        else if(this.data.sku1_list[0] != '' && this.data.sku2_list[0] == ''){
            if(this.data.click_id1 == -1){
                wx.showToast({ title: '请选择产品', mask: true, duration: 1000, icon: 'none' });
                return false;
            }

        }



      if(this.data.priceMessage[0].stock < this.data.num){
          wx.showToast({ title: '库存不足', mask: true, duration: 1000, icon: 'none' });
      }
      else {
          let num = e.currentTarget.dataset.num
          let message = e.currentTarget.dataset.message
          let img = e.currentTarget.dataset.img
          let title = e.currentTarget.dataset.title
          console.log(title)
          wx.navigateTo({ url: '/pages/diandu/pay/pay?num='+num+'&img='+img+'&title='+title+'&message='+JSON.stringify(message)});
      }

    }
})
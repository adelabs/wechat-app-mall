//index.js
//获取应用实例
var app = getApp()

function addLocalUnpaidOrder(page, card_id, remark) {
  var localUnpaidOrders = wx.getStorageSync('localUnpaidOrders');
  if (!localUnpaidOrders) { localUnpaidOrders = []; }
  const orderIndex = localUnpaidOrders.length;
  localUnpaidOrders.push({
    card_id: card_id,
    remark: remark
  });
  wx.setStorage({ key:'localUnpaidOrders', data:localUnpaidOrders });

  console.log(localUnpaidOrders);
  payLocalUnpaidOrder(page, orderIndex);
}

function removeLocalUnpaidOrder(page, index) {
  var localUnpaidOrders = wx.getStorageSync('localUnpaidOrders');
  localUnpaidOrders.splice(index, 1);
  wx.setStorage({ key:'localUnpaidOrders', data:localUnpaidOrders });

  console.log(localUnpaidOrders);
}

function afterPaymentSuccess(page) {
  // TODO: guide to register if not yet
  wx.navigateTo({
    url:"/pages/order-list/index"
  });
}

function payLocalUnpaidOrder(page, index) {
  const localUnpaidOrders = wx.getStorageSync('localUnpaidOrders');
  const localUnpaidOrder = localUnpaidOrders[index];
  const card_id = localUnpaidOrder.card_id;
  console.log(localUnpaidOrder);
  wx.request({ // request wxinfo
    url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/wxinfo',
    data: { token:app.globalData.token },
    success: function(wxinfo) {
      if (wxinfo.statusCode == 200) { // got wxinfo
        const openid = wxinfo.data.data.openid;
        wx.request({ // request wx_pay
          url: 'https://mall.pipup.me/api/miniapp/wx_pay',
          data: { openid: openid, card_id: card_id },
          method:'POST',
          success: function(wx_pay) {
            if (wx_pay.statusCode == 200) { // got wx_pay
              wx.requestPayment({
                nonceStr:  wx_pay.data.nonceStr,
                package:   wx_pay.data.package,
                paySign:   wx_pay.data.paySign,
                signType:  wx_pay.data.signType,
                timeStamp: wx_pay.data.timeStamp,
                fail:function (msg) {
                  wx.showToast({title: '支付失败:' + msg.errMsg});
                  wx.navigateTo({
                    url:"/pages/order-list/index"
                  });
                }, // fail
                success:function() {
                  wx.showToast({ title: '支付成功' });
                  removeLocalUnpaidOrder(page, index);
                  afterPaymentSuccess(page);
                } // success
              }); // requestPayment
            } else { // didn't get wx_pay
              console.log(wx_pay);
            }
          },
        }); // request wx_pay
      } else { // didn't get wxinfo
        console.log(wxinfo);
      }
    },
  });
}

Page({
  data: {
    goodsList:[],
    isNeedLogistics:0, // 是否需要物流信息
    allGoodsPrice:0,
    yunPrice:0,
    allGoodsAndYunPrice:0,
    goodsJsonStr:"",
    orderType:"", //订单类型，购物车下单或立即支付下单，默认是购物车，

    hasNoCoupons: true,
    coupons: [],
    youhuijine:0, //优惠券金额
    curCoupon:null // 当前选择使用的优惠券
  },
  onShow : function () {
    var that = this;
    var shopList = [];
    //立即购买下单
    if ("buyNow"==that.data.orderType){
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList
      }
    }else{
      //购物车下单
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        // shopList = shopCarInfoMem.shopList
        shopList = shopCarInfoMem.shopList.filter(entity => {
          return entity.active;
        });
      }
    }
    that.setData({
      goodsList: shopList,
    });
    that.initShippingAddress();
  },

  onLoad: function (e) {
    var that = this;
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      orderType: e.orderType
    });
  },

  getDistrictId : function (obj, aaa){
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },

  createOrder:function (e) {
    wx.showLoading();
    var that = this;
    var loginToken = app.globalData.token // 用户登录 token
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }

    var postData = {
      token: loginToken,
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark
    };
    if (that.data.isNeedLogistics > 0) {
      if (!that.data.curAddressData) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      }
      postData.provinceId = that.data.curAddressData.provinceId;
      postData.cityId = that.data.curAddressData.cityId;
      if (that.data.curAddressData.districtId) {
        postData.districtId = that.data.curAddressData.districtId;
      }
      postData.address = that.data.curAddressData.address;
      postData.linkMan = that.data.curAddressData.linkMan;
      postData.mobile = that.data.curAddressData.mobile;
      postData.code = that.data.curAddressData.code;
    }
    if (that.data.curCoupon) {
      postData.couponId = that.data.curCoupon.id;
    }
    if (!e) {
      var allGoodsPrice = that.data.goodsList[0].price;
      that.setData({
        isNeedLogistics: 0,
        allGoodsPrice: allGoodsPrice,
        allGoodsAndYunPrice: allGoodsPrice,
        yunPrice: 0
      });
      wx.hideLoading();
      postData.calculate = "true";
    } else {
      wx.hideLoading();
      addLocalUnpaidOrder(this, that.data.goodsList[0].goodsIndex, e.detail.value.remark);
    }


  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/user/shipping-address/default',
      data: {
        token:app.globalData.token
      },
      success: (res) =>{
        if (res.data.code == 0) {
          that.setData({
            curAddressData:res.data.data
          });
        }else{
          that.setData({
            curAddressData: null
          });
        }
        that.processYunfei();
      }
    })
  },
  processYunfei: function () {
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var isNeedLogistics = 0;
    var allGoodsPrice = 0;

    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      if (carShopBean.logistics) {
        isNeedLogistics = 1;
      }
      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }


      let inviter_id = 0;
      let inviter_id_storge = wx.getStorageSync('inviter_id_' + carShopBean.goodsId);
      if (inviter_id_storge) {
        inviter_id = inviter_id_storge;
      }


      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"propertyChildIds":"' + carShopBean.propertyChildIds + '","logisticsType":0, "inviter_id":' + inviter_id +'}';
      goodsJsonStr += goodsJsonStrTmp;


    }
    goodsJsonStr += "]";
    //console.log(goodsJsonStr);
    that.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr
    });
    that.createOrder();
  },
  addAddress: function () {
    wx.navigateTo({
      url:"/pages/address-add/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url:"/pages/select-address/index"
    })
  },
  getMyCoupons: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/my',
      data: {
        token: app.globalData.token,
        status:0
      },
      success: function (res) {
        if (res.data.code == 0) {
          var coupons = res.data.data.filter(entity => {
            return entity.moneyHreshold <= that.data.allGoodsAndYunPrice;
          });
          if (coupons.length > 0) {
            that.setData({
              hasNoCoupons: false,
              coupons: coupons
            });
          }
        }
      }
    })
  },
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon:null
      });
      return;
    }
    //console.log("selIndex:" + selIndex);
    this.setData({
      youhuijine: this.data.coupons[selIndex].money,
      curCoupon: this.data.coupons[selIndex]
    });
  }
})

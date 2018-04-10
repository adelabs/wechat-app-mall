var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({
  data:{
    verifiedPhoneNumber: null,
    statusType: ["待付款", "待发货", "待收货", "待评价", "已完成"],
    currentType:0,
    tabClass: ["", "", "", "", ""]
  },
  statusTap:function(e){
     var curType =  e.currentTarget.dataset.index;
     this.data.currentType = curType
     this.setData({
       currentType:curType
     });
     this.onShow();
  },
  orderDetail : function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  },
  bindCompleteInfo: function(e) {
    var orderId = e.currentTarget.dataset.id;
    if (this.data.verifiedPhoneNumber) {
      wx.navigateTo({ url: "/pages/create-pipup-order/index?id=" + orderId })
    } else {
      wx.navigateTo({ url: "/pages/verify-phone-number/index?id=" + orderId })
    }
  },
  cancelOrderTap:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
     wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/close',
            data: {
              token: app.globalData.token,
              orderId: orderId
            },
            success: (res) => {
              wx.hideLoading();
              if (res.data.code == 0) {
                that.onShow();
              }
            }
          })
        }
      }
    })
  },
  toPayTap:function(e){
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    wxpay.wxpay(app, money, orderId, "/pages/order-list/index");
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    const from = options.from;
    this.data.from = from;
    console.log('from ' , from);
    if (from == 'pay') {
      this.setData({currentType: 1});
    }
  },
  onReady:function(){
    // 生命周期函数--监听页面初次渲染完成
 
  },
  getOrderStatistics : function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/statistics',
      data: { token: app.globalData.token },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          var tabClass = that.data.tabClass;
          if (res.data.data.count_id_no_pay > 0) {
            tabClass[0] = "red-dot"
          } else {
            tabClass[0] = ""
          }
          if (res.data.data.count_id_no_transfer > 0) {
            tabClass[1] = "red-dot"
          } else {
            tabClass[1] = ""
          }
          if (res.data.data.count_id_no_confirm > 0) {
            tabClass[2] = "red-dot"
          } else {
            tabClass[2] = ""
          }
          if (res.data.data.count_id_no_reputation > 0) {
            tabClass[3] = "red-dot"
          } else {
            tabClass[3] = ""
          }
          if (res.data.data.count_id_success > 0) {
            //tabClass[4] = "red-dot"
          } else {
            //tabClass[4] = ""
          }

          that.setData({
            tabClass: tabClass,
          });
        }
      }
    })
  },
  checkPipupOrderCreated: function(orderList) {
    var that = this;
    for(var i = 0 ; i < orderList.length ; i++) {
      var order = orderList[i];
      var url = 'https://mall.pipup.me/api/miniapp/check_order_no';
      var postData = {order_no: order.payNumber};
      console.log(url, postData);
      wx.request({
        url: url,
        method:'POST',
        data: postData,
        success: (res) => {
          console.log("pipupOrderCreated")
          console.log(res.data);
          that.setOrder(res);
          console.log(orderList);
          // that.setData({orderList: orderList});
          that.data.orderList.forEach(function(or){
          })
        },

      });
    }
  },
  setOrder: function(res){
    let that = this;
    let orderList = that.data.orderList;
    console.log(res);
    for (var i = 0; i < orderList.length; i++) {
      if (orderList[i].payNumber == res.data.data)
      {
        console.log(orderList[i]);
        const created = (res.data.error != 0);
        orderList[i].pipupOrderCreated = created;
        that.setData({ orderList: orderList });
        if (that.data.from == 'pay') {
          that.data.from = '';
          // simulate the behavior of pressing bindCompleteInfo
          const orderId = orderList[i].payNumber;
          console.log('from pay to bindCompleteInfo, with id=', orderId);
          if (that.data.verifiedPhoneNumber) {
            wx.navigateTo({ url: "/pages/create-pipup-order/index?id=" + orderId })
          } else {
            wx.navigateTo({ url: "/pages/verify-phone-number/index?id=" + orderId })
          }
        }
      }
    }
  },
  checkPhoneNumberVerified: function() {
    var that = this;
    wx.getStorage({
      key: 'verifiedPhoneNumber',
      success: function(res) {
        that.setData({verifiedPhoneNumber: res.data});
      }
    });
  },
  onShow:function(){
    // 获取订单列表
    wx.showLoading();
    var that = this;
    var postData = {
      token: app.globalData.token
    };
    postData.status = that.data.currentType;
    this.getOrderStatistics();
    this.checkPhoneNumberVerified();
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/list',
      data: postData,
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          that.setData({
            orderList: res.data.data.orderList,
            logisticsMap : res.data.data.logisticsMap,
            goodsMap : res.data.data.goodsMap
          });
          if (postData.status == 0 && that.data.from == 'order') {
            that.data.from = '';
            that.toPayTap({currentTarget:{dataset:{
              id: res.data.data.orderList[0].id,
              money: res.data.data.orderList[0].amountReal,
            }}});
          }
          if (postData.status == 1) {
            that.checkPipupOrderCreated(res.data.data.orderList);
          }
        } else {
          this.setData({
            orderList: null,
            logisticsMap: {},
            goodsMap: {}
          });
        }
      }
    })
    
  },
  onHide:function(){
    // 生命周期函数--监听页面隐藏
 
  },
  onUnload:function(){
    // 生命周期函数--监听页面卸载
 
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
   
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
  
  }
})

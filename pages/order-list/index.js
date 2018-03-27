var wxpay = require('../../utils/pay.js')
var orders = require('../to-pay-order/index.js')
var app = getApp()
Page({
  data:{
  },
  orderDetail : function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  },
  cancelOrderTap:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
     wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          orders.removeLocalUnpaidOrder(that, orderId);
          that.onShow();
        }
      }
    })
  },
  toPayTap:function(e){
    var orderId = e.currentTarget.dataset.id;
    orders.payLocalUnpaidOrder(this, orderId);
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
   
  },
  onReady:function(){
    // 生命周期函数--监听页面初次渲染完成
 
  },
  onShow:function(){
    // 获取订单列表
    wx.showLoading();
    var that = this;
    var postData = {
      token: app.globalData.token
    };
    const localUnpaidOrders = wx.getStorageSync('localUnpaidOrders');
    const paidOrders = [];
    console.log(localUnpaidOrders);
    console.log(paidOrders);
    this.setData({
      paidOrders: paidOrders,
      localUnpaidOrders: localUnpaidOrders,
    });
    wx.hideLoading();
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

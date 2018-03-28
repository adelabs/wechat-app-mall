var wxpay = require('../../utils/pay.js')
var orders = require('../to-pay-order/index.js')
var register = require('../register/index.js')
var app = getApp()
Page({
  data:{
    localUnpaidOrders: [],
    orphanOrders: [],
    paidOrders: [],
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
  bindRegister:function() {
    wx.navigateTo({ url: "/pages/register/index" });
  },
  getOrphanOrdersAndHideLoading: function() {
    var that = this;
    wx.request({ // request wxinfo
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/wxinfo',
      data: { token:app.globalData.token },
      success: function(wxinfo) {
        if (wxinfo.statusCode == 200) { // got wxinfo
          const openid = wxinfo.data.data.openid;
          wx.request({ // request orphan order
            url: 'https://mall.pipup.me/api/miniapp/get_payment_by_openid/',
            data: { openid: openid },
            method:'GET',
            success: function(payment) {
              if (payment.data.data) {
                console.log(payment.data.data);
                that.setData({ orphanOrders: [payment.data.data] });
              }
            },
          }); // request wsx_pay
        } else { // didn't get wxinfo
          console.log(wxinfo);
        }
      },
      complete: function() {
        wx.hideLoading();
      }
    });

  },
  getPaidOrders: function() {
    var page = this;
    const access_token = wx.getStorageSync('access_token');
    if (!access_token) { return; }
    const url = 'https://mall.pipup.me/api/v1/orders/my?at=123456789012345&access_token=' + access_token;
    console.log(url);
    wx.request({ // add baby
      url: url,
      data: {},
      method:'GET',
      success: function(res) {
        if (res.statusCode == 200) {
          const paidOrders = res.data.data.data;
          console.log(paidOrders);
          page.setData({paidOrders: paidOrders});
        } else {
          console.log(res);
        }
      },
    }); // add baby
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
    this.setData({registered: wx.getStorageSync('registered')});
    const localUnpaidOrders = wx.getStorageSync('localUnpaidOrders');
    console.log(localUnpaidOrders);
    this.setData({ localUnpaidOrders: localUnpaidOrders });
    this.getOrphanOrdersAndHideLoading();
    register.registerOrphanOrderIfThereIsAny(this);
    this.getPaidOrders();
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

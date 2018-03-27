var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    submit: false,
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  bindPhone: function(e) {
    this.data.phone = e.detail.value;
  },
  bindCode: function(e) {
    this.data.code = e.detail.value;
  },
  phoneNumberLooksGood: function(phoneNumber) {
    console.log(phoneNumber);
    return true;
  },
  bindSend: function() {
    const phoneNumber = this.data.phone;
    var page = this;
    wx.request({ // verifycode
      url: 'https://mall.pipup.me/api/v1/verifycode',
      data: {
        kind: 'register',
        name: phoneNumber,
      },
      method:'POST',
      success: function(res) {
        if (res.statusCode == 200) {
          page.setData({submit: true});
        } else {
          console.log(res);
        }
      },
    }); // verifycode
  },
  bindVerify: function() {
    const phoneNumber = this.data.phone;
    const codeNumber = this.data.code;
    var page = this;
    wx.request({ // verifycode
      url: 'https://mall.pipup.me/api/v1/sms_register',
      data: {
        name: phoneNumber,
        code: codeNumber,
        wx_open_id: 2,
      },
      method:'POST',
      success: function(res) {
        if (res.statusCode == 200 && res.data.error == 0) {
          page.finishRegister(res);
        } else {
          console.log(res);
        }
      },
    }); // verifycode
  },
  finishRegister(res) {
    console.log(res);
    var access_token = res.data.access_token;
    wx.setStorageSync('access_token', access_token);
    // register orphan orders
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
})

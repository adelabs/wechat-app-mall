var app = getApp()
function setIsLogin() {
  const isLogin = (wx.getStorageSync('access_token') &&
                   wx.getStorageSync('baby_id') &&
                   wx.getStorageSync('address_id')) ? true : false;
  wx.setStorageSync('isLogin', isLogin);
  return isLogin;
}

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
        kind: 'login',
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
      url: 'https://mall.pipup.me/api/v1/sms_login',
      data: {
        name: phoneNumber,
        code: codeNumber,
        wx_open_id: 2,
      },
      method:'POST',
      success: function(res) {
        if (res.statusCode == 200 && res.data.error == 0) {
          console.log(res.data);
          wx.showToast({title: '登录成功'});
          var access_token = res.data.access_token;
          wx.setStorageSync('access_token', access_token);
          this.getBabyIfThereIsAny(access_token);
          this.getAddressIfThereIsAny(access_token);
          wx.navigateBack({});
        } else {
          console.log(res);
          wx.showToast({title: '登录失败:' + res.data.message});
        }
      },
    }); // verifycode
  },
  getBabyIfThereIsAny(access_token) {
    wx.request({
      url: 'https://mall.pipup.me/api/v1/babies/my?at=123456789012345&access_token=' + access_token,
      data: {},
      method:'GET',
      success: function(res) {
        if (res.statusCode == 200 && res.data.error == 0) {
          console.log(res.data);
          const babies = res.data.data.data;
          const baby = babies[babies.length-1];
          const baby_id = baby.id;
          wx.setStorageSync('baby_id', baby_id);
          setIsLogin();
        } else {
          console.log(res);
        }
      },
    }); // wx.request
  },
  getAddressIfThereIsAny(access_token) {
    wx.request({
      url: 'https://mall.pipup.me/api/v1/addresses?at=123456789012345&access_token=' + access_token,
      data: {},
      method:'GET',
      success: function(res) {
        if (res.statusCode == 200 && res.data.error == 0) {
          console.log(res.data);
          const addresses = res.data.data.data;
          const address = addresses[addresses.length-1];
          const address_id = address.id;
          wx.setStorageSync('address_id', address_id);
          setIsLogin();
        } else {
          console.log(res);
        }
      },
    }); // wx.request
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

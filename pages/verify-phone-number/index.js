var app = getApp()


Page({
  data: {
    submit: false,
    orderId: null,
  },

  onLoad: function (options) {
    var orderId = options.id;
    this.data.orderId = orderId;
  },

  bindPhone: function(e) {
    this.data.phone = e.detail.value;
  },
  bindCode: function(e) {
    this.data.code = e.detail.value;
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
      url: 'https://mall.pipup.me/api/v1/verify_phone',
      data: {
        name: phoneNumber,
        code: codeNumber,
      },
      method:'POST',
      success: function(res) {
        if (res.statusCode == 200 && res.data.error == 0) {
          page.savePhoneNumber(phoneNumber);
        } else {
          console.log(res);
          wx.showToast({title: '注册失败:' + res.data.message});
        }
      },
    }); // verifycode
  },
  savePhoneNumber: function(phoneNumber) {
    wx.setStorage({
      key: 'verifiedPhoneNumber',
      data: phoneNumber
    });
    if (this.data.orderId) {
      wx.navigateTo({ url: "/pages/create-pipup-order/index?id=" + this.data.orderId })
    } else {
      wx.navigateBack();
    }
  },
});

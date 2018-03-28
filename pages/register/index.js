var wxpay = require('../../utils/pay.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    submit: false,
    step: 'addr',
    questions: [
      {
        question: '宝宝阶段',
        key: 'step',
        choices: [
          {text: '还在肚子里，提前囤', kind: 9, sn: ''},
          {text: '还不会坐，我要预定', kind: 8, sn: ''},
          {text: '无需支撑可以自己坐住', kind: 1, sn: 'Z'},
          {text: '能肚子离地手膝爬行', kind: 2, sn: 'P'},
          {text: '能不扶东西站住几秒', kind: 3, sn: 'L'},
          {text: '能不扶东西走几步', kind: 4, sn: 'X'},
          {text: '能稳稳地走路 ', kind: 5, sn: 'S'},
        ],
      }, {
        question: '宝宝表达',
        key: 'exp',
        choices: [
          {text: '还不能说出自己的需求', kind: 6, sn: 'S'},
          {text: '可以说出自己的需求', kind: 7, sn: ''},
        ],
      }, {
        question: '排行',
        key: 'rank',
        choices: [
          {text: '大宝', kind: '大宝', sn: ''},
          {text: '二宝', kind: '二宝', sn: ''},
          {text: '三宝', kind: '三宝', sn: ''},
          {text: '四宝', kind: '四宝', sn: ''},
        ],
      }, {
        question: '性别',
        key: 'gender',
        choices: [
          {text: '男宝', kind: 'boy', sn: ''},
          {text: '女宝', kind: 'girl', sn: ''},
        ],
      },
    ],
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
  bindSubmitBaby: function(e) {
    var page = this;
    console.log('e.detail.value', e.detail.value);
    const url = 'https://mall.pipup.me/api/v1/babies/?at=123456789012345&access_token=' + wx.getStorageSync('access_token');
    const request_data = {
      birthday: e.detail.value.birthday,
      gender: e.detail.value.gender,
      name: e.detail.value.name,
      rank: e.detail.value.rank,
    };
    console.log(url, request_data);
    wx.request({ // add baby
      url: url,
      data: request_data,
      method:'POST',
      success: function(res) {
        if (res.statusCode == 200) {
          page.finishBaby(res);
        } else {
          console.log(res);
          wx.showModal({
            title: 'code: ' + res.statusCode,
            content: res.data.message,
            showCancel: false
          })
        }
      },
    }); // add baby
  },
  bindSubmitAddress: function(e) {
    var page = this;
    console.log('e.detail.value', e.detail.value);
    const url = 'https://mall.pipup.me/api/v1/addresses/?at=123456789012345&access_token=' + wx.getStorageSync('access_token');
    const request_data = e.detail.value;
    console.log(url, request_data);
    wx.request({ // add address
      url: url,
      data: request_data,
      method:'POST',
      success: function(res) {
        if (res.statusCode == 200) {
          page.finishAddress(res);
        } else {
          console.log(res);
          wx.showModal({
            title: 'code: ' + res.statusCode,
            content: res.data.message,
            showCancel: false
          })
        }
      },
    }); // add address
  },

  finishRegister(res) {
    console.log(res);
    var access_token = res.data.access_token;
    wx.setStorageSync('access_token', access_token);
    this.setData({step: 'baby'});
  },
  finishBaby(res) {
    console.log(res);
    var baby_id = res.data.data.id;
    wx.setStorageSync('baby_id', baby_id);
    this.setData({step: 'address'});
  },
  finishAddress(res) {
    console.log(res);
    var address_id = res.data.data.id;
    wx.setStorageSync('address_id', address_id);
    this.setData({step: 'regi'});
    // register some orphan orders.
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

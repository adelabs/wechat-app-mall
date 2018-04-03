var app = getApp()

Page({

  data: {
    birthday: '2018-01-01',
    hideStage: false,
    stage: 1,
    addressText: '',

    stepOptions: [
    //{text: '还在肚子里，提前囤',  kind: 9},
      {text: '还不会坐，我要预定',  kind: 8},
      {text: '无需支撑可以自己坐住',kind: 1},
      {text: '能肚子离地手膝爬行',  kind: 2},
      {text: '能不扶东西站住几秒',  kind: 3},
      {text: '能不扶东西走几步',    kind: 4},
      {text: '能稳稳地走路 ',       kind: 5},
    ],
  },

  onLoad: function (options) {
    var orderId = options.id;
    this.data.orderId = orderId;
    this.setData({
      orderId: orderId
    });
  },
  calNumMonths: function (birthday) {
    const data = birthday.split('-');
    const birthdayTime = (new Date(data[0], data[1]-1, data[2], 0, 0, 0)).getTime(); 
    const nowTime = (new Date).getTime();
    const diffTime = nowTime - birthdayTime;
    const diffTimeByMonth = diffTime / 1000 / 3600 / 24 / (365. / 12);
    console.log(diffTime, diffTimeByMonth);
    return diffTimeByMonth
  },

  bindChangeBirthday: function(e) {
    console.log('bindChangeBirthday', e.detail.value);
    const birthday = e.detail.value;
    var stage = this.data.stage;
    var hideStage = this.data.hideStage;
    const numMonths = this.calNumMonths(birthday);
    if (numMonths > 20) {
      stage = 7;
      hideStage = true;
    } else if (numMonths <= 0) {
      stage = 9;
      hideStage = true;
    } else {
      if (stage == 7 || stage == 9) { stage = 1; }
      hideStage = false;
    }
    this.setData({
      stage: stage,
      hideStage: hideStage,
      birthday:birthday,
    });
  },
  bindChangeStep: function(e) {
    console.log('bindChangeStep', e.detail.value);
    this.setData({
      stage: e.detail.value,
    });
  },

  bindGetAddressFromWx: function() {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        console.log(res);
        var addressText = '';
        addressText += res.provinceName + ' ';
        addressText += res.cityName + ' ';
        addressText += res.countyName + ' ';
        addressText += res.detailInfo + ' ';
        addressText += wx.getStorageSync('verifiedPhoneNumber') + ' ';
        addressText += res.userName + ' ';
        that.setData({

        });
        that.setData({
          nationalCode : res.nationalCode ,   
          postalCode   : res.postalCode   , 
          provinceName : res.provinceName ,   
          cityName     : res.cityName     ,
          countyName   : res.countyName   , 
          detailInfo   : res.detailInfo   , 
          telNumber    : res.telNumber    ,
          userName     : res.userName     ,

          addressText: addressText,
        });
      }
    });
  },

  bindCreatePipupOrder: function(e) {
    const value = e.detail.value;
    console.log('e.detail.value', e.detail.value);
    if (!value.baby_name) {
      return wx.showToast({title: '请输入宝宝昵称'});
    }
    if (!this.data.addressText) {
      return wx.showToast({title: '请选择收货地址'});
    }
    var page = this;
    const url = 'https://mall.pipup.me/api/miniapp/create_order';
    const postData = {
      gender: value.gender,
      baby_name: value.baby_name,

      birthday    : this.data.birthday,
      stage       : this.data.stage,

      nick_name   : this.data.userName,
      phone       : wx.getStorageSync('verifiedPhoneNumber'),
      zip         : this.data.nationalCode,
      address     : this.data.detailInfo,
      order_no    : this.data.orderId,
      openid      : app.globalData.openid,
      card_id     : 4,
      long_remark : '',
    };
    console.log(url, postData);
    wx.request({ // create order
      url: url,
      data: postData,
      method:'POST',
      success: function(res) {
        if (res.statusCode == 200) {
          console.log(res);
          navigateBack({});
        } else {
          console.log(res);
          wx.showModal({
            title: 'code: ' + res.statusCode,
            content: res.data.message,
            showCancel: false
          })
        }
      },
    }); // create order
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

});

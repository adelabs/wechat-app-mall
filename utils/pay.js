function wxpay(app, money, orderId, redirectUrl) {
  let remark = "在线充值";
  let nextAction = {};
  if (orderId != 0) {
    remark = "支付订单 ：" + orderId;
    nextAction = { type: 0, id: orderId };
  }
  wx.request({
    url: 'https://api.it120.cc/' + app.globalData.subDomain + '/pay/wxapp/get-pay-data',
    data: {
      token:app.globalData.token,
      money:money,
      remark: remark,
      payName:"在线支付",
      nextAction: nextAction
    },
    //method:'POST',
    success: function(res){
      if(res.data.code == 0){
        // 发起支付
        wx.requestPayment({
          timeStamp:res.data.data.timeStamp,
          nonceStr:res.data.data.nonceStr,
          package:'prepay_id=' + res.data.data.prepayId,
          signType:'MD5',
          paySign:res.data.data.sign,
          fail:function (aaa) {
            wx.showToast({title: '支付失败:' + aaa})
          },
          success:function () {
            wx.showToast({title: '支付成功'})
            wx.reLaunch({
              url: redirectUrl
            });
          }
        })
      } else {
        wx.showToast({ title: '服务器忙' + res.data.code + res.data.msg})
      }
    }
  })
}

function wxpay(app, money, orderId, redirectUrl) {
  console.log(app, money, orderId, redirectUrl);
  wx.request({ // request wxinfo
    url: 'https://api.it120.cc/' + app.globalData.subDomain + '/user/wxinfo',
    data: { token:app.globalData.token },
    success: function(wxinfo) {
      if (wxinfo.statusCode == 200) { // got wxinfo
        const openid = wxinfo.data.data.openid;
        console.log('openid', openid);
        wx.request({ // request wx_pay
          url: 'https://mall.pipup.me/api/miniapp/wx_pay',
          data: { openid: openid },
          method:'POST',
          success: function(wx_pay) {
            if (wx_pay.statusCode == 200) { // got wx_pay
              const payRequest = {
              //appId:     wx_pay.data.appId, // aka 'wxa276f5bc9699997a'
                appId:     'wx26166601014e8414',
                nonceStr:  wx_pay.data.nonceStr,
                package:   wx_pay.data.package,
                paySign:   wx_pay.data.paySign,
                signType:  wx_pay.data.signType,
                timeStamp: wx_pay.data.timeStamp,
                fail:function (msg) {
                  console.log(msg);
                  wx.showToast({title: '支付失败:' + msg});
                },
                success:function() {
                  wx.showToast({ title: '支付成功' });
                  wx.reLaunch({ url: redirectUrl });
                }
              };
              console.log(wx_pay.data);
              console.log(payRequest);
              wx.requestPayment(payRequest);
            } else { // didn't get wx_pay
              console.log(wx_pay);
            }
          },
        }); // request wx_pay
      } else { // didn't get wxinfo
        console.log(wxinfo);
      }
    },
  }); // request wxinfo
}
module.exports = {
  wxpay: wxpay
}

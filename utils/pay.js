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
      console.log("支付参数")
      console.log(res)
      if(res.data.code == 0){
        // 发起支付
        wx.requestPayment({
          timeStamp:res.data.data.timeStamp,
          nonceStr:res.data.data.nonceStr,
          package:'prepay_id=' + res.data.data.prepayId,
          signType:'MD5',
          paySign:res.data.data.sign,
          fail:function (aaa) {
            console.log(aaa);
            var title = '支付失败';
            if (aaa.errMsg == 'requestPayment:fail cancel') {
              title = '支付取消';
            }
            wx.showToast({title: title})
          },
          success:function (aaa) {
            console.log("支付成功")
            console.log(aaa);
            wx.showToast({title: '支付成功'})
            wx.redirectTo({
              url: redirectUrl
            });
          }
        })
      } else {
        console.log(res.data);
        wx.showToast({ title: '服务器忙' + res.data.code + res.data.msg})
      }
    }
  })
}

module.exports = {
  wxpay: wxpay
}

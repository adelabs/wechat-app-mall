function checkLogin(page) {
  const registered = wx.getStorageSync('registered');
  if (!registered) { return; }
  page.setData({ registered: true });

  // check access_token
  const access_token = wx.getStorageSync('access_token');
  if (!access_token) { return; }
  if (access_token) {
    wx.request({
      url: 'https://mall.pipup.me/api/v1/users/me?access_token=' + access_token,
      data: {},
      method:'GET',
      success: function(res) {
        console.log(res);
        console.log(res.data.error);
        if (res.data.error == 0) { // valid access_token
          page.setData({isLogin: true});
        } else { // invaild access_token
          wx.removeStorageSync('access_token');
          page.setData({isLogin: false});
        }
      },
      fail:function (msg) {
        console.log(msg);
      }, // fail
      complete: function(msg) {
        console.log(msg);
      }
    }); // wx.request
  }
}

module.exports = {
  checkLogin: checkLogin,
}

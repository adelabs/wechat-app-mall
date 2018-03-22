const app = getApp()

Page({
  data: {
    questions: [
      {
        question: '宝宝阶段',
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
        choices: [
          {text: '还不能说出自己的需求', kind: 6, sn: 'S'},
          {text: '可以说出自己的需求', kind: 7, sn: ''},
        ],
      },
    ],
  },
  onLoad() {
  },  
  onShow() {
  },  
  bindRadioChange: function(e) {
  },
  bindSubmit: function(e) {
    console.log('e.detail.value', e.detail.value);
    // some wx.request here
    wx.redirectTo({
      url: "/pages/order-list/index"
    });
  },
})

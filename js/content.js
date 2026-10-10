/* 剧情和扫描数据独立于界面；后续幕可追加数据，复用组件。 */
window.WalkthroughContent = {
  assets: {
    opening: 'assets/scene-00-opening.png.jpg',
    service: 'assets/scene-01-service-center.png.jpg',
    phone: 'assets/scene-01-phone-guide.png.jpg',
    discovery: 'assets/scene-01-activity-discovery.png',
    booth: 'assets/scene-01-activity-booth.png.jpg',
    scan: 'assets/cognitive-scan-bg.jpg.jpg'
  },
  tasks: ['参加活动', '认识目标', '寻找目标', '核验完成'],
  timing: {
    discovery: { environment: 1000, push: 2500, reveal: 600, settle: 400 },
    scan: { title: 1000, light: 650, read: 1450, hold: 900, result: 800, button: 600 }
  },
  scenes: [
    {"background": "service", "location": "游客服务中心", "speaker": "旁白", "text": "小美原本想请一位导游。"},
    {"background": "service", "location": "游客服务中心", "speaker": "小美", "text": "“你好，请问现在还有空闲导游吗？”"},
    {"background": "service", "location": "游客服务中心", "speaker": "工作人员", "text": "“抱歉，目前暂无空闲导游。”"},
    {"background": "phone", "location": "翻看手机攻略", "speaker": "旁白", "text": "她有些担心自己进去之后不知道该看什么，于是翻起了攻略。"},
    {"background": "phone", "location": "翻看手机攻略", "speaker": "小美·内心", "text": "“这么多壁画，没人讲解，我进去能看明白吗……”"},
    {"background": "phone", "location": "翻看手机攻略", "speaker": "小美·内心", "text": "“咦？《寻宝朝元》？边找人物边看壁画，好像挺有意思！”"},
    {"background": "discovery", "location": "远望活动摊位", "speaker": "小美·内心", "text": "“哎，那边不就是《寻宝朝元》的摊位吗？”", "discovery": true, "buttonLabel": "走近看看"},
    {"background": "booth", "location": "主动询问参加方式", "speaker": "小美", "text": "“你好，我想参加《寻宝朝元》，请问要怎么参加呀？”"},
    {"background": "booth", "location": "主动询问参加方式", "speaker": "工作人员", "text": "“欢迎参加！先领一张寻宝卡吧。”"},
    {"background": "booth", "location": "主动询问参加方式", "speaker": "工作人员", "text": "“照着卡上的人物，去三清殿寻找八位主神，记下对应的编号。”"},
    {"background": "booth", "location": "主动询问参加方式", "speaker": "工作人员", "text": "“完成后，到殿后的核对点核验，通过了就可以盖章。”"},
    {"background": "booth", "location": "主动询问参加方式", "speaker": "小美", "text": "“可是我对道教壁画不太了解，也能看懂吗？”"},
    {"background": "booth", "location": "主动询问参加方式", "speaker": "工作人员", "text": "“可以先试试看！跟着寻宝卡找人物，至少能知道从哪里看起。”"},
    {"background": "booth", "location": "主动询问参加方式", "speaker": "小美", "text": "“好，那我试试看！”"}
  ],
  scan01: {
    number: '01', node: '参加活动',
    questions: [
      { label: '目标', title: '参加寻宝活动', description: '小美知道参加《寻宝朝元》需要完成什么。', status: 'success' },
      { label: '线索', title: '入口指引醒目', description: '小美能够主动发现活动，\n并知道在哪里咨询和领取寻宝卡。', evidence: '主动发现活动，是 Q2 成功的证据。', status: 'success' },
      { label: '关联', title: '知道领卡参加', description: '小美理解“寻找 8 位主神”\n能够帮助自己带着目标观看《朝元图》。', status: 'success' },
      { label: '反馈', title: '领到寻宝卡', description: '领取寻宝卡后，\n小美知道自己已经可以开始参加活动。', status: 'success' }
    ],
    result: { success: true, title: '认知成功', subtitle: '活动入口、任务目标与参与方式都足够清晰。', recommendation: '该节点无需修改，保留现有设计。' }
  }
};

/* 剧情和扫描数据独立于界面；后续幕可追加数据，复用组件。 */
window.WalkthroughContent = {
  assets: {
    opening: 'assets/scene-00-opening.png.jpg',
    approach01: 'assets/xunbao-scene-01-approach.png',
    guide01: 'assets/scene-01-activity-guide.jpg',
    card01: 'assets/xunbao-scene-02-card.png',
    service: 'assets/scene-01-service-center.png.jpg',
    phone: 'assets/scene-01-phone-guide.png.jpg',
    discovery: 'assets/scene-01-activity-discovery.png',
    booth: 'assets/scene-01-activity-booth.png.jpg',
    scan: 'assets/cognitive-scan-bg.jpg.jpg'
  },
  tasks: ['参加活动', '入殿寻宝', '提交核验'],
  timing: {
    discovery: { environment: 1000, push: 2500, reveal: 600, settle: 400 },
    scan: { title: 1000, light: 650, read: 1450, hold: 900, result: 800, button: 600 }
  },
  scenes: [
    {background:'approach01',location:'发现寻宝活动',speaker:'旁白',text:'永乐宫山门前，小美注意到不远处有一个挂着“寻宝朝元”招牌的活动点。'},
    {background:'approach01',location:'发现寻宝活动',speaker:'小美',text:'“咦？寻宝朝元？这里还有寻宝活动呀。”',discovery:true},
    {background:'approach01',location:'走近自助领取处',speaker:'小美',text:'“过去看看！”'},
    {background:'guide01',location:'查看活动规则',speaker:'小美',text:'“原来是自助参加的，我看看怎么玩……”',guide:true},
    {background:'guide01',location:'查看活动规则',speaker:'小美',text:'“哦，要去三清殿找八位人物，把对应编号贴在卡上，再去核对。”',guide:true},
    {background:'guide01',location:'决定参加活动',speaker:'小美',text:'“听起来挺有意思的！”',guide:true},
    {background:'guide01',location:'自助领取寻宝卡',speaker:'小美',text:'“好，先领一张！”',guide:true,buttonLabel:'领取寻宝卡',buttonAction:'claim-card'}
  ],
  firstCardDialogues: [
    {speaker:'小美',text:'“原来要找的是这八位人物呀！”'},
    {speaker:'小美',text:'“到时候在壁画里找到他们，把现场对应的编号贴在人物旁边就行了。”'},
    {speaker:'小美',text:'“明白啦，那就去三清殿找找看！”'}
  ],
  scan01: {
    number: '01', node: '参加活动',
    questions: [
      { label: '目标', title: '参与寻宝活动', description: '知道参与寻宝活动是目标', status: 'success' },
      { label: '线索', title: '入口指引醒目', description: '小美能够主动发现活动，\n并知道在哪里咨询和领取寻宝卡。', status: 'success' },
      { label: '关联', title: '能够理解活动规则', description: '通过摊位设置和寻宝卡规则阅读能够理解活动规则', status: 'success' },
      { label: '反馈', title: '领到寻宝卡', description: '知道领到寻宝卡就是成功参与', status: 'success' }
    ],
    result: { success: true, title: '顺利完成', subtitle: '活动入口明显，规则解释清晰、用户顺利参加活动', recommendation: '该节点无需修改，保留现有设计。' }
  }
};

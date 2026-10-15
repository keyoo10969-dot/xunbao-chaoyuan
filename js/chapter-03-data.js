/* 假设服务原型；现场编号来自集中教学配置，不代表真实景区资料。 */
window.Chapter03Data = {
  assets: {
    interior03:'assets/scene-03-hall-interior.jpg', search03:'assets/scene-03-search-start.jpg',
    number01:'assets/scene-03-number-01-closeup.png',
    sign03:'assets/scene-03-number-sign-closeup.jpg', confused03:'assets/scene-03-xiaomei-confused.jpg'
  },
  timing:{environment:1000,interior:4000,search:3000,sign:2000,confused:3000,expression:750},
  teachingExample:{targetId:'donghua-dijun',number:6,numbersByGod:window.TeachingMatches.numbersByGod,recordedNumbers:window.TeachingMatches.recordedNumbers},
  realSiteMatches:{},
  walkthroughRetry:['“算了，先按自己的判断记下来吧……”','“等出去以后，再找工作人员核对。”'],
  // 编号牌特写为3号，保留素材备用；6号不进入该特写。
  sequence:['interior','number-first','first','second','route','confused'],
  shots:{
    interior:{background:'interior03',camera:'interior',location:'进入三清殿'},
    'number-first':{background:'number01',camera:'sign',location:'观察现场编号牌',number:1},
    first:{background:'search03',camera:'search',location:'寻找1号人物',number:1},
    second:{background:'search03',camera:'search',location:'寻找2号人物',number:2},
    route:{background:'search03',camera:'search',location:'继续沿参观路线寻找'},
    confused:{background:'confused03',camera:'confused',location:'来到6号编号牌',number:6},
    retry:{background:'confused03',location:'带着不确定继续记录'}
  },
  dialogues:{
    interior:[
      {speaker:'旁白',text:'今天是阴天，殿里的光线比小美想象中还要暗。'},
      {speaker:'小美',text:'“哇……这么多人物！”'},
      {speaker:'旁白',text:'小美低头查看寻宝卡。',background:'confused03'},
      {speaker:'小美',text:'“寻宝卡人物好像有点小，找不到太多具体特征...”',background:'confused03'},
      {speaker:'小美',text:'“先按照现场编号，一个一个找吧”'}
    ],
    'number-first':['“从1号开始吧，现场的指示牌只有编号...”'],
    first:['“嗯，应该是南极长生大帝。”'],
    second:['“2号……看着像玉皇大帝。”','“仔细对照一下，好像能认出来。”'],
    route:[
      {speaker:'旁白',text:'小美继续沿着参观路线，依次对照寻宝卡上的人物。'},
      {speaker:'小美',text:'“前面几个虽然有点费劲，慢慢看倒也还能对上。”'}
    ],
    confused:['“咦，6号……这位我有点看不清。”','“这是东华帝君，还是东极救苦天尊？”','“脸和衣饰都看不太清，实在不好分辨……”']
  }
};

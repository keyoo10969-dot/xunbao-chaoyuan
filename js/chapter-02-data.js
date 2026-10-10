/* 人物顺序用于卡片排版，绝不代表现场编号。身份与识别资料可在此统一替换。 */
window.Chapter02Data = {
  assets: { hall: 'assets/scene-02-hall-approach.jpg', heldCard: 'assets/cards/references/eight-gods-overview.jpg', doubt: 'assets/scene-02-card-doubt.jpg' },
  cameraTiming: { environment: 1000, push: 2500, reveal: 600, settle: 400 },
  gods: [
    { id: 'jinmu-yuanjun', name: '金母元君', image: 'assets/cards/portraits/01-jinmu-yuanjun.png' },
    { id: 'yuhuang-dadi', name: '玉皇大帝', image: 'assets/cards/portraits/02-yuhuang-dadi.png' },
    { id: 'donghua-dijun', name: '东华帝君', image: 'assets/cards/portraits/03-donghua-dijun.jpg.png' },
    { id: 'houtu-niangniang', name: '后土娘娘', image: 'assets/cards/portraits/04-houtu-niangniang.png' },
    { id: 'nanji-changsheng-dadi', name: '南极长生大帝', image: 'assets/cards/portraits/05-nanji-changsheng-dadi.png' },
    { id: 'gouchen-dadi', name: '勾陈大帝', image: 'assets/cards/portraits/06-gouchen-dadi.jpg.png' },
    { id: 'dongji-jiuku-tianzun', name: '东极救苦天尊', image: 'assets/cards/portraits/07-dongji-jiuku-tianzun.png' },
    { id: 'ziwei-dadi', name: '紫微大帝', image: 'assets/cards/portraits/08-ziwei-dadi.png' }
  ].map((god, index) => ({
    ...god, recognition: '识别特征：待核对',
    introduction: {
      identity: '待核对资料。',
      significance: index < 2 ? '观察冠饰、服饰与手持物，比较人物形象的差异。' : '观看意义：待补充资料。',
      surroundings: index < 2 ? '留意周围人物的姿态、服饰和排列。' : '周边观察提示：待补充资料。'
    }
  })),
  /* 没有正式编号答案，保留独立空配置，第三幕获得资料后再填写。 */
  siteNumberAnswers: {},
  overview: '这八位人物，是认识《朝元图》的八个观察入口。通过他们，我们可以初步了解画面中的神祇形象、人物关系与艺术特点。',
  issues: [
    '“可是头像这么小，进去以后真的能认出来吗？”',
    '“而且就算找到了，我也不太了解这些神仙的背景和关系……”',
    '“《朝元图》里有这么多人物，只找这八位，真的就能看懂这幅画吗？”'
  ],
  closing: [
    '“这样好多了！现在不光认得脸，也知道为什么要找他们了。”',
    '“走，进去试试！”'
  ],
  walkthroughClosing: ['“算了，先进去看看吧，说不定看到壁画就能认出来。”']
  // Scan data is assigned centrally by walkthrough-assessment.js.
};

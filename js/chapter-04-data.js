/* 假设服务原型：核验按预设剧情播放，不查询真实景区位置答案。 */
window.Chapter04Data = {
  assets: {
    submit04: 'assets/image 54.jpg',
    verification04: 'assets/image 55.jpg',
    feedback04: 'assets/scene-04-checkpoint-failed.jpg'
  },
  legacyAssets: { completion04: 'assets/image 56.jpg' },
  timing: { environment:1000, submit:3000, verification:2500, completion:3500, check:500, resultHold:1000, stamp:1900, ink:900, lift:1250, dialogueGuard:450, feedbackHold:700, feedback:3000 },
  verification: { mode:'scripted-classroom', outcome:'six-pass-two-mismatch', failedGodIds:window.TeachingMatches.confusedGodIds, expectedNumbers:window.TeachingMatches.numbersByGod, realSiteAnswers:{} },
  // 仅供显式开发预览初始化；正常剧情使用第三幕传入的记录。
  previewRecords: window.TeachingMatches.recordedNumbers,
  dialogues: {
    submit: [
      { speaker:'旁白', text:'带着填满编号的寻宝卡，小美来到了三清殿后侧的任务完成处。' },
      { speaker:'小美', text:'“你好，我把八位主神都找了一遍，可以帮我核对一下吗？”' },
      { speaker:'工作人员', text:'“当然可以，我帮你看看！”' }
    ],
    feedback: [
      { speaker:'工作人员', text:'“有六处找对了，不过还有两处没有对应上。”' },
      { speaker:'工作人员', text:'“所以这次暂时不能盖章，还需要再核对一下。”' }
    ],
    regret: [
      { speaker:'小美', text:'“啊，原来还是贴错了两处……”' },
      { speaker:'小美', text:'“殿里光线太暗，有几个人物我真的分不太清。”' }
    ],
    remedy: [
      { speaker:'工作人员', text:'“没关系，您可以回殿里再仔细找找。”' },
      { speaker:'工作人员', text:'“如果不着急，也可以先逛完整个园区，再到出口的壁画复原图展示区，对照更清楚的图像核对一下。”' },
      { speaker:'工作人员', text:'“重新确认好之后，到出口服务点核验，通过了还是可以盖章领取纪念品的。”' }
    ],
    closing: [{ speaker:'小美', text:'“这样啊……好吧，那我再去看看，谢谢你。”' }]

  }
  // Scan data is assigned centrally by walkthrough-assessment.js.
};

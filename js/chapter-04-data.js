/* 假设服务原型：核验按预设剧情播放，不查询真实景区位置答案。 */
window.Chapter04Data = {
  assets: {
    approach04: 'assets/scene-04-checkpoint-approach.png',
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
    approach: [{ speaker:'旁白', text:'小美走出三清殿，看到不远处的任务核对点。' }],
    submit: [
      { speaker:'旁白', text:'小美来到核对点，请工作人员帮她核对' },
      { speaker:'小美', text:'“你好，我把八位主神都找了一遍，可以帮我核对一下吗？”' },
      { speaker:'工作人员', text:'“当然可以，我帮你看看！”' }
    ],
    feedback: [
      { speaker:'工作人员', text:'“有六处找对了，不过还有两处没有对应上。”' },
      { speaker:'工作人员', text:'“所以这次暂时不能盖章，还需要再核对一下。”' }
    ],
    remedy: [
      { speaker:'工作人员', text:'“如果不着急，也可以先逛完整个园区，再到出口的壁画复原图展示区，对照更清楚的图像核对一下。”' },
      { speaker:'工作人员', text:'“重新确认好之后，到出口服务点核验，通过了还是可以盖章领取纪念品的。”' }
    ],
    closing: [{ speaker:'小美', text:'“这样啊……好吧，那我再去看看，谢谢你。”' }]

  }
  // Scan data is assigned centrally by walkthrough-assessment.js.
};

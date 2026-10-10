/* 课堂模拟编号，不代表永乐宫真实壁画位置；卡片排版顺序与编号无关。 */
window.TeachingMatches = (() => {
  const numbersByGod = Object.freeze({
    'jinmu-yuanjun':5, 'yuhuang-dadi':2, 'donghua-dijun':6, 'houtu-niangniang':8,
    'nanji-changsheng-dadi':1, 'gouchen-dadi':3, 'dongji-jiuku-tianzun':7, 'ziwei-dadi':4
  });
  const confusedGodIds = Object.freeze(['donghua-dijun','dongji-jiuku-tianzun']);
  // 小美在6号处混淆两位人物，记录时互换6、7；其余六处沿用模拟对应。
  const recordedNumbers = Object.freeze({...numbersByGod,
    [confusedGodIds[0]]:numbersByGod[confusedGodIds[1]],
    [confusedGodIds[1]]:numbersByGod[confusedGodIds[0]]
  });
  return Object.freeze({numbersByGod, recordedNumbers, confusedGodIds});
})();

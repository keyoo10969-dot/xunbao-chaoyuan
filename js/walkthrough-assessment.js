/* V4：四幕同一套 V1，扫描为评估者视角。走查记录与设计机会集中管理。 */
window.WalkthroughAssessment = (() => {
  const question=(label,title,description,status='success',evidence)=>({label,title,description,status,...(evidence?{evidence}:{})});
  const nodes=[
    {number:'01',title:'参加活动',questions:[
      question('目标','参加寻宝活动','小美希望参加《寻宝朝元》寻宝活动。'),
      question('线索','入口指引醒目','小美能主动看到活动摊位与入口指引。','success','小美主动发现活动并开口询问，是 Q2 成功的证据。'),
      question('关联','知道领卡参加','小美知道向工作人员领取寻宝卡即可参加。'),
      question('反馈','领到寻宝卡','工作人员递来寻宝卡，小美知道已经成功参与。')
    ],finding:'活动入口清晰，参与方式易于理解。',lines:['发现：活动入口清晰，参与方式易于理解。','结论：保留现有设计。'],result:{title:'认知成功',subtitle:'成功节点已记录',recommendation:'保留现有设计。'}},
    {number:'02',title:'认识目标',questions:[
      question('目标','知道找8位主神','小美知道需要寻找八位主神。'),
      question('线索','小图难辨人物','人物缩略图过小，难以辨认人物形象。','failure'),
      question('关联','不了解人物背景','不了解人物背景，也不理解为什么选择这八位主神作为观看目标。','failure'),
      question('反馈','读完卡上介绍即完成','小美读完卡上介绍，知道已经完成当前阅读步骤。')
    ],finding:'寻宝卡对初次参观者的识别和理解支持不足。',lines:['Q2：小图难辨人物。','Q3：人物背景与关系信息不足。','记录：寻宝卡对初次参观者的识别和理解支持不足。'],result:{prominentKicker:true,kicker:'发现认知断点',title:'认得名字，不等于认得人物。',subtitle:'人物小图难辨，人物背景与关系信息不足。',recommendation:'Q2 / Q3 出现断点，断点问题已记录',opportunity:'设计机会：优化寻宝卡的识别信息与人物背景介绍'}},
    {number:'03',title:'寻找目标',questions:[
      question('目标','知道把人物与编号对应','知道当前要寻找哪位主神。'),
      question('线索','暗光下难对应','暗光环境下，难以将寻宝卡人物与真实壁画对应。','failure'),
      question('关联','知道编号如何使用','知道现场编号如何与寻宝卡人物进行匹配。'),
      question('反馈','贴完即完成','编号记录能够显示任务进度；记录完成不代表匹配正确，正确性仍待后续核验。','success','记录总结页显示“8 / 8 已记录”，表示记录完成。进度反馈不证明人物匹配正确，最终正确性留给第四幕核验。')
    ],finding:'暗光环境下难以将人物与壁画对应。',lines:['Q2：暗光下难以完成图像匹配。','记录：现场辅助识别线索不足。','Q4 ✓：贴签后能够感知操作进度。'],result:{prominentKicker:true,kicker:'发现认知断点',title:'',subtitle:'暗光环境下难以将人物与壁画对应。',recommendation:'Q2 出现断点，问题已记录',opportunity:'设计机会：完善现场辅助识别线索'}},
    {number:'04',title:'核验完成',questions:[
      question('目标','知道贴满要核对','小美知道完成八处编号记录后，需要交给工作人员检查。'),
      question('线索','核对点明确','小美能够找到任务完成处，并向工作人员出示寻宝卡。'),
      question('关联','理解核对规则','小美理解工作人员核验是为了确认人物与编号是否正确对应。'),
      question('反馈','获得明确核验结果','工作人员明确说明两处记录错误，以及本次暂不能盖章。')
    ],finding:'核验结果明确，即使任务未通过，小美依然理解当前状态及后续处理方式。',lines:['发现：明确获知两处记录错误，本次暂不能盖章。','结论：保留核验反馈机制，提供清晰的后续处理方式。'],result:{title:'认知成功',subtitle:'核验结果明确，用户知道任务尚未完成。',recommendation:'成功节点已记录，保留核验反馈机制。'}}
  ].map(node=>({...node,scan:{number:node.number,node:node.title,questions:node.questions,result:{...node.result,success:node.questions.every(q=>q.status==='success')}}}));
  const opportunities=[
    {number:'01',title:'让人物更容易被识别和理解',sources:[{node:'02',questions:[2,3]}],problems:['人物图像过小。','人物身份信息不足。','八位人物与壁画整体的关系不够清楚。'],direction:'优化寻宝卡的人物识别信息，补充人物背景与关系说明。'},
    {number:'02',title:'让现场寻找更有依据',sources:[{node:'03',questions:[2]}],problems:['暗光环境限制精细视觉辨认。','现场编号牌只提供数字，辅助信息不足。'],direction:'完善暗光环境下的现场辅助识别线索。',explore:'后续可探索：简短文字特征、更清楚的对照提示、更方便的复核机制。'}
  ];
  const entries=new Map();let activeScan=null;
  const scanFor=number=>nodes.find(node=>node.number===number).scan;
  function record(number){const node=nodes.find(item=>item.number===number);if(!node)return;entries.set(number,{...node,success:node.scan.result.success,problems:node.questions.flatMap((q,i)=>q.status==='failure'?[{question:i+1,title:q.title,description:q.description}]:[])});activeScan={number,status:'recorded'};}
  const report=()=>nodes.filter(node=>entries.has(node.number)).map(node=>entries.get(node.number));
  const designOpportunities=()=>opportunities.filter(opportunity=>opportunity.sources.some(source=>entries.get(source.node)?.problems.some(problem=>source.questions.includes(problem.question))));
  const stats=()=>{const rows=report();return {nodes:rows.length,success:rows.filter(row=>row.success).length,problems:rows.filter(row=>!row.success).length,opportunities:designOpportunities().length};};
  function reset(){entries.clear();activeScan=null;}
  // 保留各幕调用形式，但所有扫描引用同一组评估数据。
  window.WalkthroughContent.scan01=scanFor('01');window.Chapter02Data.scan=scanFor('02');window.Chapter03Data.scan=scanFor('03');window.Chapter04Data.scan=scanFor('04');
  return {cardVersion:1,nodes,scanFor,record,report,stats,designOpportunities,reset,begin:number=>{activeScan={number,status:'scanning'};},snapshot:()=>({scan:activeScan,assessed:report().map(row=>({number:row.number,success:row.success,problems:row.problems}))})};
})();

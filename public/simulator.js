// --- CONFIG ---
const CONFIG = {
  startFrustration: 60,
  passiveGain: 6,
  anxietyGainPassive: 2,
  refuseCost: 0,
  chatCost: 3,
  hospitalCost: 10,
  prepUseCost: 4,
  pepUseCost: 7,
  baseHospitalFalseNegativeRate: 0.08,
  prepRiskReduction: 0.72,
  pepRescueChance: 0.68,
  pepEffectiveTurns: 2,
  targetDays: 30,
  startMoney: 220,
  startEnergy: 70,
  startReputation: 10,
  dailyCost: 12,
  rentCycleDays: 7,
  rentAmount: 120,
  testProfiles: {
    rapid: { label: '快速筛查', sensitivity: 0.72, windowBonusTurns: 2 },
    agab: { label: '抗原抗体', sensitivity: 0.86, windowBonusTurns: 1 },
    naat: { label: '核酸检测', sensitivity: 0.95, windowBonusTurns: 0 },
  },

  rewards: {
    kiss_deep: 3,
    handjob: 5,
    oral_condom: 5,
    oral_raw: 9,
    sex_condom: 8,
    sex_raw: 16,
    anal_condom: 12,
    anal_raw: 20,
  },

  stress: {
    kiss_deep: 1,
    handjob: 2,
    oral_condom: 2,
    oral_raw: 15,
    sex_condom: 5,
    sex_raw: 30,
    anal_condom: 8,
    anal_raw: 36,
  },
};

// --- STATE ---
let STATE = {
  frustration: 50,
  anxiety: 0,
  turn: 1,
  day: 1,
  money: 0,
  energy: 0,
  reputation: 0,
  playerRole: 'hunter',
  selectedIdentity: '',
  encounterRiskMultiplier: 1,
  mental: { panic: 0, acuteStress: 0, depression: 0, insomnia: 0 },
  currentEvent: null,
  currentIncident: null,
  items: { testkit: 1, prep: 1, pep: 1 },
  buffs: { prepTurns: 0, pepTurns: 0 },
  currentPartner: null,
  isInfected: false,
  infectionData: null,
  infectionMeta: null,
  isGameOver: false,
  history: [], // { partner, action, outcomeLabel, outcomeClass }
};

const ACTION_LABELS = {
  kiss_deep: '深吻',
  handjob: '手交',
  oral_condom: '戴套口交',
  oral_raw: '无套口交',
  sex_condom: '戴套性交',
  sex_raw: '无套性交',
  anal_condom: '戴套肛交',
  anal_raw: '无套肛交',
  refuse: '拒绝离开',
};

const SHOP_ITEM_LABELS = {
  testkit: '检测试纸',
  prep: 'PrEP',
  pep: 'PEP',
};

const IDENTITY_LABELS = {
  male: '男',
  female: '女',
  mtf: 'MTF',
  ftm: 'FTM',
  nb: '非二元',
  walmart: '沃尔玛购物袋',
};

const PARTNER_GENDERS = ['male', 'female', 'mtf', 'ftm', 'nb'];

const AVATARS = [
  '🌚',
  '🦊',
  '🐷',
  '🐶',
  '🦄',
  '🐲',
  '🐙',
  '👽',
  '💀',
  '🤡',
  '🤠',
  '👻',
  '🧛',
  '🧟',
];

const DISEASES = {
  HIV: {
    name: '艾滋病 (HIV)',
    riskType: 'fluid',
    windowTurns: 4,
    desc: '免疫崩溃，不可逆转。',
    transmission: '体液传播',
    stages: {
      acute: { label: '急性期', multiplier: 1.35 },
      latent: { label: '潜伏期', multiplier: 0.85 },
      aids: { label: '发病期', multiplier: 1.1 },
    },
  },
  SYPHILIS: {
    name: '梅毒',
    riskType: 'contact',
    windowTurns: 3,
    desc: '全身红斑，侵蚀神经。',
    transmission: '接触传播',
    stages: {
      primary: { label: '一期', multiplier: 0.95 },
      secondary: { label: '二期', multiplier: 1.2 },
      latent: { label: '潜伏期', multiplier: 0.75 },
    },
  },
  HERPES: {
    name: '疱疹',
    riskType: 'skin',
    windowTurns: 2,
    desc: '终身携带，反复剧痛。',
    transmission: '皮肤接触',
    stages: {
      outbreak: { label: '发作期', multiplier: 1.4 },
      remission: { label: '缓解期', multiplier: 0.55 },
    },
  },
  HPV: {
    name: '尖锐湿疣',
    riskType: 'contact',
    windowTurns: 5,
    desc: '菜花突起，极难根治。',
    transmission: '接触传播',
    stages: {
      active: { label: '活跃期', multiplier: 1.25 },
      latent: { label: '潜伏期', multiplier: 0.7 },
    },
  },
  GONORRHEA: {
    name: '淋病',
    riskType: 'fluid_mucous',
    windowTurns: 2,
    desc: '流脓刺痛。',
    transmission: '体液粘膜',
    stages: {
      acute: { label: '急性期', multiplier: 1.3 },
      chronic: { label: '慢性期', multiplier: 0.8 },
    },
  },
  CRABS: {
    name: '阴虱',
    riskType: 'skin_hair',
    windowTurns: 1,
    desc: '剧烈瘙痒。',
    transmission: '密切接触',
    stages: {
      active: { label: '活跃期', multiplier: 1.15 },
      mild: { label: '轻度期', multiplier: 0.75 },
    },
  },
  CHLAMYDIA: {
    name: '衣原体感染',
    riskType: 'fluid_mucous',
    windowTurns: 3,
    desc: '常无症状，延误治疗可引发并发症。',
    transmission: '体液/黏膜传播',
    stages: {
      acute: { label: '急性期', multiplier: 1.2 },
      subclinical: { label: '亚临床期', multiplier: 0.85 },
    },
  },
  HEP_B: {
    name: '乙肝 (HBV)',
    riskType: 'fluid',
    windowTurns: 4,
    desc: '可慢性化，损伤肝脏。',
    transmission: '血液/体液传播',
    stages: {
      high_viremia: { label: '高病毒载量期', multiplier: 1.35 },
      low_viremia: { label: '低病毒载量期', multiplier: 0.8 },
    },
  },
  HEP_C: {
    name: '丙肝 (HCV)',
    riskType: 'blood',
    windowTurns: 5,
    desc: '以血液暴露风险为主。',
    transmission: '血液传播',
    stages: {
      active: { label: '活动期', multiplier: 1.25 },
      low_activity: { label: '低活动期', multiplier: 0.85 },
    },
  },
};

const TRANSMISSION_BASE = {
  HIV: {
    kiss_deep: 0.001,
    handjob: 0.001,
    oral_condom: 0.002,
    oral_raw: 0.008,
    sex_condom: 0.008,
    sex_raw: 0.11,
  },
  SYPHILIS: {
    kiss_deep: 0.02,
    handjob: 0.01,
    oral_condom: 0.015,
    oral_raw: 0.045,
    sex_condom: 0.035,
    sex_raw: 0.09,
  },
  HERPES: {
    kiss_deep: 0.035,
    handjob: 0.015,
    oral_condom: 0.02,
    oral_raw: 0.06,
    sex_condom: 0.045,
    sex_raw: 0.12,
  },
  HPV: {
    kiss_deep: 0.006,
    handjob: 0.012,
    oral_condom: 0.015,
    oral_raw: 0.04,
    sex_condom: 0.03,
    sex_raw: 0.08,
  },
  GONORRHEA: {
    kiss_deep: 0.002,
    handjob: 0.003,
    oral_condom: 0.003,
    oral_raw: 0.03,
    sex_condom: 0.008,
    sex_raw: 0.07,
  },
  CRABS: {
    kiss_deep: 0.0,
    handjob: 0.035,
    oral_condom: 0.01,
    oral_raw: 0.05,
    sex_condom: 0.06,
    sex_raw: 0.12,
  },
  CHLAMYDIA: {
    kiss_deep: 0.0,
    handjob: 0.002,
    oral_condom: 0.003,
    oral_raw: 0.02,
    sex_condom: 0.007,
    sex_raw: 0.065,
  },
  HEP_B: {
    kiss_deep: 0.001,
    handjob: 0.001,
    oral_condom: 0.002,
    oral_raw: 0.01,
    sex_condom: 0.01,
    sex_raw: 0.08,
  },
  HEP_C: {
    kiss_deep: 0.0,
    handjob: 0.0,
    oral_condom: 0.0005,
    oral_raw: 0.003,
    sex_condom: 0.003,
    sex_raw: 0.02,
  },
};

Object.assign(TRANSMISSION_BASE.HIV, { anal_condom: 0.012, anal_raw: 0.15 });
Object.assign(TRANSMISSION_BASE.SYPHILIS, { anal_condom: 0.04, anal_raw: 0.11 });
Object.assign(TRANSMISSION_BASE.HERPES, { anal_condom: 0.05, anal_raw: 0.13 });
Object.assign(TRANSMISSION_BASE.HPV, { anal_condom: 0.04, anal_raw: 0.1 });
Object.assign(TRANSMISSION_BASE.GONORRHEA, { anal_condom: 0.01, anal_raw: 0.09 });
Object.assign(TRANSMISSION_BASE.CRABS, { anal_condom: 0.065, anal_raw: 0.14 });
Object.assign(TRANSMISSION_BASE.CHLAMYDIA, { anal_condom: 0.009, anal_raw: 0.08 });
Object.assign(TRANSMISSION_BASE.HEP_B, { anal_condom: 0.012, anal_raw: 0.1 });
Object.assign(TRANSMISSION_BASE.HEP_C, { anal_condom: 0.004, anal_raw: 0.03 });

function pickDiseaseStage(dKey) {
  const disease = DISEASES[dKey];
  if (!disease || !disease.stages) {
    return { key: 'unknown', label: '未知阶段', multiplier: 1 };
  }
  const stageKeys = Object.keys(disease.stages);
  const idx = Math.floor(Math.random() * stageKeys.length);
  const key = stageKeys[idx];
  const stage = disease.stages[key];
  return { key, label: stage.label, multiplier: stage.multiplier };
}

function getStageMultiplier(partner, dKey) {
  const stage = partner?.diseaseStages?.[dKey];
  return stage?.multiplier || 1;
}

function getBehaviorRiskMultiplier(partner) {
  const score = partner?.behaviorRiskScore || 0;
  if (score >= 3) return 1.35;
  if (score >= 1) return 1.15;
  return 1;
}

function getWindowFalseNegativeRate(testType = 'rapid') {
  if (!STATE.infectionMeta || !STATE.infectionMeta.diseaseKey) return 0;
  const disease = DISEASES[STATE.infectionMeta.diseaseKey];
  const windowTurns = disease?.windowTurns ?? 2;
  const profile = CONFIG.testProfiles[testType] || CONFIG.testProfiles.rapid;
  const effectiveWindow = Math.max(1, windowTurns - profile.windowBonusTurns);
  if (STATE.turn - STATE.infectionMeta.turn <= effectiveWindow) {
    const residual = 1 - profile.sensitivity;
    return Math.max(CONFIG.baseHospitalFalseNegativeRate, residual);
  }
  return CONFIG.baseHospitalFalseNegativeRate;
}

function getPartnerStageSummary(partner) {
  if (!partner?.diseases?.length) return '未知';
  return partner.diseases
    .map((d) => `${DISEASES[d].name}（${partner.diseaseStages?.[d]?.label || '未知阶段'}）`)
    .join('、');
}

function getGenderLabel(genderIdentity) {
  const map = {
    male: '男',
    female: '女',
    mtf: '跨性别女性',
    ftm: '跨性别男性',
    nb: '非二元',
  };
  return map[genderIdentity] || '未标注';
}

function getPartnerMentalLabel(mental) {
  if (!mental) return '未知';
  const impulse = mental.impulse >= 70 ? '冲动高' : mental.impulse >= 40 ? '冲动中' : '冲动低';
  const boundary = mental.boundary >= 70 ? '边界强' : mental.boundary >= 40 ? '边界中' : '边界弱';
  const mood = mental.stability >= 70 ? '情绪稳' : mental.stability >= 40 ? '情绪波动' : '情绪不稳';
  return `${impulse} / ${boundary} / ${mood}`;
}

const FLIRT_LINES = {
  neutral: [
    '今晚去你家，还是我家？',
    '别说话，吻我。',
    '我可是很挑剔的...',
    '听说你很会玩？',
    '今晚不想一个人睡。',
    '别害羞，靠近点。',
  ],
  risky: [
    '就这一次，别那么紧张。',
    '戴不戴都差不多吧，别扫兴。',
    '你要是信我，今晚就别谈规则。',
    '快一点，我不想浪费时间。',
  ],
  safe: [
    '先把边界说清楚，不舒服就停。',
    '我只接受戴套，其他不用谈。',
    '先聊清楚检测和防护，再继续。',
    '慢一点，安全第一。',
  ],
  provider: [
    '预算我发你了，规则先说好。',
    '时间只有一小时，地点你定。',
    '可以加价，但我只做安全项目。',
    '先转定金，边界不谈价。',
  ],
};

const IDENTITY_RISK_PROFILE = {
  male: { carrierBias: 0.02, constraintBias: 0.03, hiddenBias: 0.02, safeLineBias: 0.0 },
  female: { carrierBias: -0.03, constraintBias: 0.05, hiddenBias: -0.02, safeLineBias: 0.08 },
  mtf: { carrierBias: 0.01, constraintBias: 0.06, hiddenBias: 0.01, safeLineBias: 0.06 },
  ftm: { carrierBias: 0.0, constraintBias: 0.05, hiddenBias: 0.0, safeLineBias: 0.05 },
  nb: { carrierBias: -0.01, constraintBias: 0.05, hiddenBias: -0.01, safeLineBias: 0.07 },
};

const ALL_TAGS = [
  {
    text: '手掌/脚底有红斑',
    color: 'bg-red-700',
    risk: { SYPHILIS: 0.95 },
    clue: '如果你看到这个，跑！这是梅毒二期的典型铁证。',
    hiddenChance: 0.8,
  },
  {
    text: '私处长了个硬硬的红疮',
    color: 'bg-red-700',
    risk: { SYPHILIS: 0.98 },
    clue: '这就叫『硬下疳』。不痛不痒，但那是梅毒一期。',
    hiddenChance: 0.9,
  },
  {
    text: '嘴角/下面长了一簇水泡',
    color: 'bg-red-700',
    risk: { HERPES: 0.9 },
    clue: '疱疹正在发作，水泡液里全是病毒，碰一下就中招。',
    hiddenChance: 0.9,
  },
  {
    text: '内裤上有黄色脓渍',
    color: 'bg-red-600',
    risk: { GONORRHEA: 0.9 },
    clue: '尿道流脓，典型的淋病症状。真的很脏。',
    hiddenChance: 0.5,
  },
  {
    text: '后面长了菜花状的小肉粒',
    color: 'bg-red-800',
    risk: { HPV: 0.95, SYPHILIS: 0.4 },
    clue: '尖锐湿疣。如果不切除会越长越大，像菜花一样。',
    hiddenChance: 0.9,
  },
  {
    text: '毛发根部有会动的黑痂',
    color: 'bg-red-800',
    risk: { CRABS: 0.95 },
    clue: '那不是脏东西，是阴虱和它的卵。它会爬到你身上。',
    hiddenChance: 0.7,
  },
  {
    text: '张嘴看到舌头白得像发霉',
    color: 'bg-red-800',
    risk: { HIV: 0.6, SYPHILIS: 0.3 },
    clue: '鹅口疮。成年人很少得，除非免疫系统崩了（比如艾滋病）。',
    hiddenChance: 0.5,
  },
  {
    text: '身上有紫红色的斑块',
    color: 'bg-purple-800',
    risk: { HIV: 0.7 },
    clue: '疑似卡波西肉瘤，艾滋病发病期的标志之一。',
    hiddenChance: 0.8,
  },
  {
    text: '头发像被虫蛀了一样稀疏',
    color: 'bg-purple-700',
    risk: { SYPHILIS: 0.6 },
    clue: '梅毒性脱发，通常是虫蚀状的，不是普通的秃顶。',
    hiddenChance: 0.3,
  },
  {
    text: '脖子/腋下摸起来有肿块',
    color: 'bg-purple-700',
    risk: { HIV: 0.4, SYPHILIS: 0.4 },
    clue: '全身淋巴结肿大，身体正在对抗病毒。',
    hiddenChance: 0.7,
  },
  {
    text: '躯干长满了不痒的红疹',
    color: 'bg-purple-700',
    risk: { SYPHILIS: 0.5, HIV: 0.2 },
    clue: '梅毒疹通常不痛不痒，很容易被误认为是过敏。',
    hiddenChance: 0.8,
  },
  {
    text: '舌头侧面有白色毛状物',
    color: 'bg-purple-800',
    risk: { HIV: 0.8 },
    clue: '毛状白斑，免疫系统严重受损的信号。',
    hiddenChance: 0.6,
  },
  {
    text: '房间里有刺鼻的化学味',
    color: 'bg-rose-900',
    risk: { HIV: 0.4, SYPHILIS: 0.3 },
    clue: 'RUSH(亚硝酸盐)的味道。玩这么大，通常伴随无套群交。',
    hiddenChance: 0.5,
  },
  {
    text: '床头放着奇怪的蓝瓶药',
    color: 'bg-purple-800',
    risk: { HIV: 0.5 },
    clue: '可能是必妥维(抗病毒药)或阻断药。说明他可能就是感染者。',
    hiddenChance: 0.7,
  },
  {
    text: '胳膊弯处有针孔/淤青',
    color: 'bg-rose-900',
    risk: { HIV: 0.9, SYPHILIS: 0.6 },
    clue: '静脉注射吸毒。这是绝对的高危禁区，血液传播风险极高。',
    hiddenChance: 0.8,
  },
  {
    text: '提议去公园/公厕解决',
    color: 'bg-rose-900',
    risk: { SYPHILIS: 0.4, HIV: 0.3 },
    clue: '野外游击队(Cruising)。环境极脏，且通常有多性伴。',
    hiddenChance: 0,
  },
  {
    text: '刚参加完多人派对',
    color: 'bg-rose-900',
    risk: { HIV: 0.5, SYPHILIS: 0.5, GONORRHEA: 0.5 },
    behaviorRisk: 2,
    clue: '交叉感染的温床。你永远不知道上一个人是谁。',
    hiddenChance: 0.6,
  },
  {
    text: '也是刚约完上一个人',
    color: 'bg-rose-800',
    risk: { GONORRHEA: 0.4, SYPHILIS: 0.3 },
    behaviorRisk: 1,
    clue: '无缝衔接。这种频率，中招是迟早的事。',
    hiddenChance: 0.5,
  },
  {
    text: '说『我就蹭蹭不进去』',
    color: 'bg-rose-700',
    risk: { HERPES: 0.3, HPV: 0.3 },
    clue: '著名的渣男谎言。而且蹭蹭也能传染皮肤病。',
    hiddenChance: 0,
  },
  {
    text: '说『如果你是干净的就能无套』',
    color: 'bg-rose-900',
    risk: { HIV: 0.2 },
    clue: '典型的话术PUA。这就是想骗你无套。',
    hiddenChance: 0,
  },
  {
    text: '脖子上有新鲜的吻痕',
    color: 'bg-rose-800',
    risk: { HIV: 0.1, SYPHILIS: 0.1 },
    clue: '私生活混乱的直接证据，可能昨晚还在别人床上。',
    hiddenChance: 0.3,
  },
  {
    text: '体育学院猛男',
    color: 'bg-slate-700',
    risk: { GONORRHEA: 0.2, CRABS: 0.2 },
    clue: '荷尔蒙爆棚，但男生宿舍的卫生状况...懂的都懂。',
    hiddenChance: 0,
  },
  {
    text: '沉迷二次元的死宅',
    color: 'bg-slate-600',
    risk: {},
    constraint: 'no_oral',
    clue: '【限制】三次元的体液接触让他感到恶心，拒绝口交。',
    hiddenChance: 0.1,
  },
  {
    text: '艺术学院留长发男',
    color: 'bg-purple-700',
    risk: { SYPHILIS: 0.1, GONORRHEA: 0.1 },
    clue: '搞艺术的都很疯，且多情。私生活可能比他的画还抽象。',
    hiddenChance: 0,
  },
  {
    text: '备战考研压力怪',
    color: 'bg-amber-700',
    risk: {},
    constraint: 'no_oral',
    clue: '【限制】只想快速发泄压力，没时间前戏，速战速决。',
    hiddenChance: 0,
  },
  {
    text: '满嘴骚话的键盘侠',
    color: 'bg-slate-500',
    risk: {},
    constraint: 'oral_only',
    clue: '【限制】线上巨人线下怂包，见面只敢动动嘴，不敢真枪实弹。',
    hiddenChance: 0.3,
  },
  {
    text: '学生会',
    color: 'bg-slate-700',
    risk: { HPV: 0.1 },
    clue: '表面光鲜亮丽，背地里可能玩得很花。',
    hiddenChance: 0,
  },
  {
    text: '纯爱战神(自称)',
    color: 'bg-sky-700',
    risk: {},
    constraint: 'oral_only',
    clue: '【限制】坚持要把第一次留给未来的老婆/老公，今晚只能边缘。',
    hiddenChance: 0.2,
  },
  {
    text: 'App显示24小时在线',
    color: 'bg-purple-800',
    risk: { HIV: 0.15, SYPHILIS: 0.15 },
    clue: '住在软件上的极度活跃用户，常在河边走，哪有不湿鞋。',
    hiddenChance: 0,
  },
  {
    text: '职业性工作者',
    color: 'bg-amber-800',
    risk: { HIV: 0.1, SYPHILIS: 0.1, GONORRHEA: 0.3 },
    clue: '职业暴露风险高。',
    hiddenChance: 0.3,
  },
  {
    text: '经常去夜店/蹦迪',
    color: 'bg-amber-700',
    risk: { HIV: 0.1 },
    clue: '酒精、药物和冲动的温床，判断力最差的地方。',
    hiddenChance: 0,
  },
  {
    text: '金融男/投行精英',
    color: 'bg-slate-700',
    risk: { SYPHILIS: 0.15 },
    clue: '圈内传闻：压力大，玩得花，体检少。',
    hiddenChance: 0,
  },
  {
    text: '摇滚乐队乐手',
    color: 'bg-slate-700',
    risk: { GONORRHEA: 0.1 },
    clue: '果儿多，生活不规律，卫生习惯随缘。',
    hiddenChance: 0,
  },
  {
    text: '刚失恋求安慰',
    color: 'bg-slate-600',
    risk: {},
    clue: '情绪不稳定，容易为了报复前任而发生冲动行为。',
    hiddenChance: 0,
  },
  {
    text: '已婚寻找刺激',
    color: 'bg-slate-700',
    risk: { HPV: 0.1 },
    clue: '可能把家里的病带出来，也可能把病带回家。',
    hiddenChance: 0.4,
  },
  {
    text: '飞行员/空乘',
    color: 'bg-slate-700',
    risk: { GONORRHEA: 0.1, SYPHILIS: 0.1 },
    clue: '全世界飞，伴侣不固定，性病地图收集者。',
    hiddenChance: 0,
  },
  {
    text: '指甲缝里全是黑泥',
    color: 'bg-amber-800',
    risk: { GONORRHEA: 0.3, SYPHILIS: 0.1 },
    clue: '个人卫生极差。手都洗不干净，别的地方更不用说了。',
    hiddenChance: 0,
  },
  {
    text: '极度消瘦/脸颊凹陷',
    color: 'bg-purple-700',
    risk: { HIV: 0.35 },
    clue: '可能是艾滋病消耗期，也可能是吸毒吸的。',
    hiddenChance: 0.2,
  },
  {
    text: '一直在咳嗽/盗汗',
    color: 'bg-purple-700',
    risk: { HIV: 0.2 },
    clue: '免疫力低下的表现，需警惕。',
    hiddenChance: 0.3,
  },
  {
    text: '坚持不开灯/只开夜灯',
    color: 'bg-purple-900',
    risk: { SYPHILIS: 0.4, HERPES: 0.4, HPV: 0.4 },
    clue: '最经典的伪装。黑暗是为了掩饰身上的溃疡或皮疹。',
    hiddenChance: 0,
  },
  {
    text: '大热天非要穿高领',
    color: 'bg-purple-800',
    risk: { SYPHILIS: 0.5, HIV: 0.2 },
    clue: '欲盖弥彰。可能在遮挡吻痕，也可能是皮疹或淋巴肿大。',
    hiddenChance: 0,
  },
  {
    text: '内裤松松垮垮/很旧',
    color: 'bg-slate-600',
    risk: {},
    clue: '不修边幅，可能对生活品质要求不高，但不一定有病。',
    hiddenChance: 0,
  },
  {
    text: '清纯男大',
    color: 'bg-emerald-800',
    risk: {},
    safeChance: 0.85,
    clue: '眼神里透着未被知识污染的光。大概率是干净的。',
    hiddenChance: 0,
  },
  {
    text: '性压抑的小处男',
    color: 'bg-emerald-800',
    risk: {},
    safeChance: 0.85,
    constraint: 'no_condom',
    clue: '【限制】因为太紧张，甚至不知道怎么戴套，或者一戴就软。',
    hiddenChance: 0.2,
  },
  {
    text: '医学院学生/医生',
    color: 'bg-emerald-800',
    risk: {},
    safeChance: 0.85,
    clue: '有医学常识，见过太多烂病，通常极度注意防护。',
    hiddenChance: 0,
  },
  {
    text: '疾控中心(CDC)员工',
    color: 'bg-emerald-800',
    risk: {},
    safeChance: 0.98,
    clue: '专业人士，这方面绝对稳。',
    hiddenChance: 0,
  },
  {
    text: '处女座/重度洁癖',
    color: 'bg-sky-700',
    risk: {},
    safeChance: 0.8,
    clue: '进门先洗半小时澡，甚至要求你也洗两遍。安全感满满。',
    hiddenChance: 0,
  },
  {
    text: '定期献血者',
    color: 'bg-emerald-700',
    risk: {},
    safeChance: 0.9,
    clue: '血站会进行严格的核酸检测，能献血说明血液大概率干净。',
    hiddenChance: 0.4,
  },
  {
    text: '当面拆封阴性检测单',
    color: 'bg-emerald-700',
    risk: {},
    safeChance: 0.95,
    clue: '目前最可靠的凭证（注意看日期是不是最近的）。',
    hiddenChance: 0.5,
  },
  {
    text: '包里自备各种安全套',
    color: 'bg-sky-700',
    risk: {},
    safetyBonus: true,
    constraint: 'condom_only',
    clue: '安全意识极强，大概率对自己和他人都负责。',
    hiddenChance: 0.3,
  },
  {
    text: '明确拒绝无套提议',
    color: 'bg-sky-700',
    risk: {},
    safetyBonus: true,
    constraint: 'condom_only',
    clue: '有原则的人通常比较安全。',
    hiddenChance: 0,
  },
  {
    text: '马拉松/铁三运动员',
    color: 'bg-emerald-600',
    risk: {},
    safeChance: 0.7,
    clue: '生活极度自律，身体素质好，免疫力强。',
    hiddenChance: 0,
  },
  {
    text: '急性子/不想洗澡',
    color: 'bg-amber-800',
    risk: { GONORRHEA: 0.2 },
    constraint: 'no_oral',
    clue: '【限制】嫌麻烦，不洗澡太脏了，拒绝口交。',
    hiddenChance: 0.3,
  },
  {
    text: '对乳胶/橡胶过敏',
    color: 'bg-rose-800',
    risk: {},
    constraint: 'no_condom',
    clue: '【限制】生理原因无法戴普通套。',
    hiddenChance: 0.4,
  },
  {
    text: '特别讨厌橡胶味',
    color: 'bg-rose-800',
    risk: { HIV: 0.15 },
    constraint: 'no_condom',
    clue: '【限制】心理抵触戴套。如果你坚持，只能离开。',
    hiddenChance: 0.2,
  },
  {
    text: '嘴里刚做了牙科手术',
    color: 'bg-slate-700',
    risk: {},
    constraint: 'no_oral',
    clue: '【限制】物理上无法张嘴，无法口交。',
    hiddenChance: 0,
  },
  {
    text: '嘴里有溃疡/起泡',
    color: 'bg-red-800',
    risk: { HIV: 0.2, SYPHILIS: 0.3 },
    constraint: 'no_oral',
    clue: '【限制】嘴疼无法口交，且有体液传播风险。',
    hiddenChance: 0.6,
  },
  {
    text: '比较保守/只敢边缘',
    color: 'bg-sky-800',
    risk: {},
    constraint: 'oral_only',
    clue: '【限制】胆子小，拒绝插入，只接受手口。',
    hiddenChance: 0,
  },
  {
    text: '有宗教信仰(婚前守贞)',
    color: 'bg-sky-800',
    risk: {},
    constraint: 'oral_only',
    clue: '【限制】底线是不能插入，其他好商量。',
    hiddenChance: 0.2,
  },
  {
    text: '刚做完包皮手术',
    color: 'bg-slate-700',
    risk: {},
    constraint: 'oral_only',
    clue: '【限制】还在恢复期，不能剧烈运动，只能你帮他。',
    hiddenChance: 0,
  },
  {
    text: '正在生理期/大姨妈',
    color: 'bg-rose-900',
    risk: { HIV: 0.3 },
    constraint: 'oral_only',
    clue: '【限制】浴血奋战风险太高，拒绝插入。',
    hiddenChance: 0.5,
  },
  {
    text: '室友就在隔壁',
    color: 'bg-slate-600',
    risk: {},
    constraint: 'oral_only',
    clue: '【限制】不敢发出声音，只能悄悄来。',
    hiddenChance: 0.1,
  },
];

const IDENTITY_TAGS = {
  male: [
    {
      text: '健身房常客',
      color: 'bg-slate-700',
      risk: {},
      clue: '作息相对规律，风险取决于行为选择。',
      hiddenChance: 0.1,
    },
    {
      text: '工地夜班族',
      color: 'bg-amber-700',
      risk: { GONORRHEA: 0.08 },
      clue: '长期疲劳、冲动决策概率更高。',
      hiddenChance: 0.2,
    },
  ],
  female: [
    {
      text: '坚持双重防护',
      color: 'bg-sky-700',
      risk: {},
      safetyBonus: true,
      clue: '明确边界，风险显著下降。',
      hiddenChance: 0.2,
    },
    {
      text: '刚结束异地关系',
      color: 'bg-slate-600',
      risk: {},
      clue: '情绪波动大，容易做冲动决定。',
      hiddenChance: 0.2,
    },
  ],
  mtf: [
    {
      text: '跨性别女性（MTF）',
      color: 'bg-violet-700',
      risk: {},
      clue: '身份本身不决定风险，关键看防护与行为。',
      hiddenChance: 0,
    },
    {
      text: '定期体检与随访',
      color: 'bg-emerald-700',
      risk: {},
      safeChance: 0.75,
      clue: '健康管理意识强。',
      hiddenChance: 0.3,
    },
  ],
  ftm: [
    {
      text: '跨性别男性（FTM）',
      color: 'bg-violet-700',
      risk: {},
      clue: '身份本身不决定风险，行为更关键。',
      hiddenChance: 0,
    },
    {
      text: '沟通边界明确',
      color: 'bg-sky-700',
      risk: {},
      safetyBonus: true,
      clue: '愿意提前沟通，通常更安全。',
      hiddenChance: 0.2,
    },
  ],
  nb: [
    {
      text: '非二元身份',
      color: 'bg-violet-700',
      risk: {},
      clue: '风险来源于暴露行为，不来自身份标签。',
      hiddenChance: 0,
    },
    {
      text: '重视同意与协商',
      color: 'bg-emerald-700',
      risk: {},
      safeChance: 0.7,
      clue: '边界管理更完整。',
      hiddenChance: 0.2,
    },
  ],
};

const PROVIDER_TAGS = [
  {
    text: '客户预算紧张',
    color: 'bg-amber-700',
    payout: 22,
    behaviorRisk: 1,
    clue: '常讨价还价并压缩防护。',
    hiddenChance: 0.2,
  },
  {
    text: '客户愿加价但赶时间',
    color: 'bg-rose-800',
    payout: 50,
    behaviorRisk: 2,
    risk: { HIV: 0.08 },
    clue: '时间压力会放大风险。',
    hiddenChance: 0.2,
  },
  {
    text: '老客户回单',
    color: 'bg-emerald-700',
    payout: 35,
    safeChance: 0.65,
    clue: '熟悉规则，沟通成本低。',
    hiddenChance: 0.3,
  },
  {
    text: '陌生酒店见面',
    color: 'bg-rose-900',
    payout: 68,
    behaviorRisk: 2,
    risk: { SYPHILIS: 0.15 },
    clue: '高收益通常伴随更高不确定性。',
    hiddenChance: 0.4,
  },
  {
    text: '明确要求戴套',
    color: 'bg-sky-700',
    payout: 28,
    constraint: 'condom_only',
    safetyBonus: true,
    clue: '边界清晰，风险下降。',
    hiddenChance: 0.1,
  },
  {
    text: '暗示无套加价',
    color: 'bg-rose-900',
    payout: 88,
    constraint: 'no_condom',
    risk: { HIV: 0.18, HEP_B: 0.12 },
    behaviorRisk: 3,
    clue: '这是高风险诱导。',
    hiddenChance: 0.4,
  },
];

const SAFETY_EVENTS = [
  {
    title: '突发事件：临时改地点',
    icon: '📍',
    desc: '对方要求你临时换到陌生地点，并催促你快点决定。',
    options: [
      { label: '拒绝并结束', effects: { money: -2, anxiety: 4, rep: -1, riskMul: 0.92 } },
      { label: '只接受公开场所见面', effects: { money: 8, anxiety: 2, rep: 1, riskMul: 0.95 } },
      { label: '硬着头皮去', effects: { money: 22, anxiety: 10, rep: 0, riskMul: 1.15 } },
    ],
  },
  {
    title: '突发事件：偷拍威胁',
    icon: '📱',
    desc: '你怀疑对方在偷拍视频，并暗示“听话就没事”。',
    options: [
      { label: '立刻离开并求助', effects: { money: -6, anxiety: 6, rep: 0, riskMul: 0.9 } },
      { label: '谈判删除并终止', effects: { money: -2, anxiety: 8, rep: 1, riskMul: 0.95 } },
      { label: '沉默继续', effects: { money: 18, anxiety: 14, rep: -2, riskMul: 1.12 } },
    ],
  },
  {
    title: '突发事件：多人压力场景',
    icon: '⚠️',
    desc: '现场突然出现额外人员，气氛失控，你感到明显不安。',
    options: [
      { label: '退出并联系朋友', effects: { money: -4, anxiety: 6, rep: 0, riskMul: 0.9 } },
      { label: '只保留原约定项目', effects: { money: 10, anxiety: 7, rep: 1, riskMul: 1.0 } },
      { label: '勉强继续', effects: { money: 28, anxiety: 16, rep: -1, riskMul: 1.18 } },
    ],
  },
];

function selectIdentity(identity, buttonEl) {
  if (STATE.selectedIdentity && STATE.selectedIdentity !== identity) {
    const walmartBtn = document.getElementById('identity-walmart');
    if (walmartBtn && walmartBtn.classList.contains('hidden')) {
      walmartBtn.classList.remove('hidden');
    }

    document.querySelectorAll('.identity-btn').forEach((btn) => {
      if (btn.id === 'identity-walmart') return;
      btn.classList.remove('shake');
      void btn.offsetWidth;
      btn.classList.add('shake');
    });
  }

  STATE.selectedIdentity = identity;
  document.querySelectorAll('.identity-btn').forEach((btn) => btn.classList.remove('active'));
  if (buttonEl) buttonEl.classList.add('active');
}

function toggleHelp() {
  const modal = document.getElementById('help-modal');
  modal.classList.toggle('hidden');
}

function toggleHistoryView(show) {
  const summaryView = document.getElementById('summary-view');
  const historyView = document.getElementById('history-view');

  if (show) {
    summaryView.classList.add('hidden');
    historyView.classList.remove('hidden');
  } else {
    summaryView.classList.remove('hidden');
    historyView.classList.add('hidden');
  }
}

// --- GAME LOGIC ---

function startGame() {
  if (!STATE.selectedIdentity) {
    alert('请先选择身份再开始。');
    return;
  }
  document.getElementById('intro-modal').style.display = 'none';
  document.getElementById('game-container').classList.remove('hidden');
  initGame();
}

function returnToIntro() {
  document.getElementById('feedback-overlay').classList.add('hidden');
  document.getElementById('game-container').classList.add('hidden');
  document.getElementById('intro-modal').style.display = 'flex';
}

function initGame() {
  STATE.frustration = CONFIG.startFrustration;
  STATE.anxiety = 0;
  STATE.turn = 1;
  STATE.day = 1;
  STATE.money = CONFIG.startMoney;
  STATE.energy = CONFIG.startEnergy;
  STATE.reputation = CONFIG.startReputation;
  STATE.playerRole = 'hunter';
  STATE.encounterRiskMultiplier = 1;
  STATE.mental = { panic: 0, acuteStress: 0, depression: 0, insomnia: 0 };
  STATE.currentEvent = null;
  STATE.currentIncident = null;
  STATE.items = { testkit: 1, prep: 1, pep: 1 };
  STATE.buffs = { prepTurns: 0, pepTurns: 0 };
  STATE.isGameOver = false;
  STATE.isInfected = false;
  STATE.infectionData = null;
  STATE.infectionMeta = null;
  STATE.history = [];

  updateStatsUI();
  generateNewPartner();
}

function toggleShop() {
  document.getElementById('shop-modal').classList.toggle('hidden');
}

function buyItem(type, price) {
  if (STATE.money < price) {
    showFeedback('余额不足', '你的现金不够，无法购买。', '💸', true);
    return;
  }
  STATE.money -= price;
  STATE.items[type] = (STATE.items[type] || 0) + 1;
  updateStatsUI();
  const itemName = SHOP_ITEM_LABELS[type] || '道具';
  toggleShop();
  showFeedback('购买成功', `购买 ${itemName} 成功。`, '🛍️', true);
}

function recoverMental() {
  if (STATE.money < 58) {
    showFeedback('余额不足', '心理咨询需要 $58。', '💸', true);
    return;
  }
  toggleShop();
  STATE.money -= 58;
  STATE.anxiety = Math.max(0, STATE.anxiety - 22);
  STATE.mental.panic = Math.max(0, STATE.mental.panic - 18);
  STATE.mental.acuteStress = Math.max(0, STATE.mental.acuteStress - 16);
  STATE.mental.depression = Math.max(0, STATE.mental.depression - 8);
  updateStatsUI();
  showFeedback('咨询完成', '你稳定了情绪，心理压力明显下降。', '🧠', true);
}

function restNight() {
  if (STATE.money < CONFIG.dailyCost) {
    showFeedback('余额不足', '休息也需要承担当日基础开销。', '💸', true);
    return;
  }
  toggleShop();
  STATE.money -= CONFIG.dailyCost;
  STATE.energy = Math.min(100, STATE.energy + 35);
  STATE.frustration = Math.min(100, STATE.frustration + 8);
  STATE.mental.insomnia = Math.max(0, STATE.mental.insomnia - 20);
  STATE.mental.panic = Math.max(0, STATE.mental.panic - 6);
  STATE.mental.acuteStress = Math.max(0, STATE.mental.acuteStress - 10);
  STATE.day++;
  updateStatsUI();
  settlePeriodicCost();
  showFeedback('休息一晚', '你恢复了体力，但时间成本与压抑也在上升。', '🛌', true);
}

function toggleRole() {
  STATE.playerRole = STATE.playerRole === 'hunter' ? 'provider' : 'hunter';
  updateStatsUI();
  generateNewPartner();
  showFeedback(
    '模式切换',
    STATE.playerRole === 'hunter' ? '你选择主动找对象。' : '你开始接单，成为别人寻找的对象。',
    '🔁',
    true,
  );
}

function generateNewPartner() {
  const identityProfile = IDENTITY_RISK_PROFILE[STATE.selectedIdentity] || {
    carrierBias: 0,
    constraintBias: 0,
    hiddenBias: 0,
    safeLineBias: 0,
  };
  const identityPool = IDENTITY_TAGS[STATE.selectedIdentity] || [];
  const sourceTags =
    STATE.playerRole === 'provider'
      ? ALL_TAGS.concat(PROVIDER_TAGS, identityPool)
      : ALL_TAGS.concat(identityPool);
  const numTags = Math.floor(Math.random() * 2) + 3;
  const partnerTags = [];
  const selectedIndices = new Set();
  const carrierRate = Math.max(
    0.15,
    Math.min(
      0.75,
      0.4 + identityProfile.carrierBias + (STATE.playerRole === 'provider' ? 0.05 : 0),
    ),
  );
  const constraintRate = Math.max(0.1, Math.min(0.85, 0.4 + identityProfile.constraintBias));
  const hiddenRateBoost = identityProfile.hiddenBias;
  const isCarrier = Math.random() < carrierRate;
  const hasConstraint = Math.random() < constraintRate;

  let loopLimit = 0;
  while (partnerTags.length < numTags && loopLimit < 100) {
    loopLimit++;
    const idx = Math.floor(Math.random() * sourceTags.length);
    if (selectedIndices.has(idx)) continue;
    const tagTemplate = sourceTags[idx];
    if (
      isCarrier &&
      partnerTags.length === 0 &&
      !tagTemplate.color.includes('red') &&
      !tagTemplate.color.includes('purple')
    )
      continue;
    if (
      hasConstraint &&
      !partnerTags.some((t) => t.constraint) &&
      !tagTemplate.constraint &&
      loopLimit < 50
    )
      continue;

    const currentConstraints = partnerTags.map((t) => t.constraint).filter(Boolean);
    if (tagTemplate.constraint) {
      if (tagTemplate.constraint === 'no_oral' && currentConstraints.includes('oral_only'))
        continue;
      if (tagTemplate.constraint === 'oral_only' && currentConstraints.includes('no_oral'))
        continue;
    }
    selectedIndices.add(idx);
    let isHidden = false;
    const currentHiddenCount = partnerTags.filter((t) => !t.revealed).length;
    if (currentHiddenCount === 0 && tagTemplate.hiddenChance > 0) {
      const hiddenChance = Math.max(0, Math.min(0.95, tagTemplate.hiddenChance + hiddenRateBoost));
      isHidden = Math.random() < hiddenChance;
    }
    partnerTags.push({ ...tagTemplate, revealed: !isHidden });
  }
  if (partnerTags.every((t) => !t.revealed)) partnerTags[0].revealed = true;

  let activeDiseases = [];
  if (Math.random() < 0.08) {
    const keys = Object.keys(DISEASES);
    activeDiseases.push(keys[Math.floor(Math.random() * keys.length)]);
  }
  partnerTags.forEach((tag) => {
    if (tag.risk) {
      for (const [dKey, prob] of Object.entries(tag.risk)) {
        if (Math.random() < prob && !activeDiseases.includes(dKey)) activeDiseases.push(dKey);
      }
    }
    if (tag.safeChance && Math.random() < tag.safeChance) activeDiseases = [];
  });

  const behaviorRiskScore = partnerTags.reduce((sum, t) => sum + (t.behaviorRisk || 0), 0);
  const partnerMental = {
    impulse: Math.floor(Math.random() * 100),
    boundary: Math.floor(Math.random() * 100),
    stability: Math.floor(Math.random() * 100),
  };

  STATE.currentPartner = {
    tags: partnerTags,
    diseases: activeDiseases,
    diseaseStages: Object.fromEntries(activeDiseases.map((d) => [d, pickDiseaseStage(d)])),
    behaviorRiskScore,
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    payout:
      STATE.playerRole === 'provider'
        ? Math.max(
            18,
            Math.floor(
              partnerTags.reduce((sum, t) => sum + (t.payout || 0), 0) /
                Math.max(1, partnerTags.filter((t) => t.payout).length || 1),
            ),
          )
        : 0,
    genderIdentity: PARTNER_GENDERS[Math.floor(Math.random() * PARTNER_GENDERS.length)],
    mental: partnerMental,
  };

  STATE.encounterRiskMultiplier = 1;

  renderPartner();
}

function updateStatsUI() {
  const fBar = document.getElementById('frustration-bar');
  fBar.style.width = `${STATE.frustration}%`;
  document.getElementById('frustration-val').innerText = `${STATE.frustration}%`;

  const aBar = document.getElementById('anxiety-bar');
  aBar.style.width = `${STATE.anxiety}%`;
  document.getElementById('anxiety-val').innerText = `${STATE.anxiety}%`;

  const gameContent = document.getElementById('game-content');
  const panicWarn = document.getElementById('panic-warning');

  if (STATE.anxiety >= 80) {
    gameContent.classList.add('panic-mode');
    panicWarn.classList.remove('hidden');
    aBar.classList.add('bg-violet-500');
    aBar.classList.remove('bg-gradient-to-r');
  } else {
    gameContent.classList.remove('panic-mode');
    panicWarn.classList.add('hidden');
    aBar.classList.remove('bg-violet-500');
    aBar.classList.add('bg-gradient-to-r');
  }

  document.getElementById('turn-count').innerText = STATE.turn.toString().padStart(2, '0');
  const dayEl = document.getElementById('day-count');
  if (dayEl) dayEl.innerText = STATE.day.toString().padStart(2, '0');
  const identityEl = document.getElementById('identity-label');
  if (identityEl) identityEl.innerText = IDENTITY_LABELS[STATE.selectedIdentity] || '未选择';
  const moneyEl = document.getElementById('money-count');
  if (moneyEl) moneyEl.innerText = `${STATE.money}`;
  const energyEl = document.getElementById('energy-count');
  if (energyEl) energyEl.innerText = `${STATE.energy}`;
  const repEl = document.getElementById('reputation-count');
  if (repEl) repEl.innerText = `${STATE.reputation}`;
  const roleHintEl = document.getElementById('role-toggle-hint');
  if (roleHintEl)
    roleHintEl.innerText = STATE.playerRole === 'hunter' ? '当前：主动找人' : '当前：接单模式';
  const mentalPanicEl = document.getElementById('mental-panic');
  const mentalStressEl = document.getElementById('mental-stress');
  const mentalDepressEl = document.getElementById('mental-depress');
  const mentalInsomniaEl = document.getElementById('mental-insomnia');
  if (mentalPanicEl) mentalPanicEl.innerText = `${Math.round(STATE.mental.panic)}`;
  if (mentalStressEl) mentalStressEl.innerText = `${Math.round(STATE.mental.acuteStress)}`;
  if (mentalDepressEl) mentalDepressEl.innerText = `${Math.round(STATE.mental.depression)}`;
  if (mentalInsomniaEl) mentalInsomniaEl.innerText = `${Math.round(STATE.mental.insomnia)}`;
  document.getElementById('item-testkit').innerText = `x${STATE.items.testkit}`;
  const prepEl = document.getElementById('item-prep');
  if (prepEl) prepEl.innerText = `x${STATE.items.prep}`;
  const pepEl = document.getElementById('item-pep');
  if (pepEl) pepEl.innerText = `x${STATE.items.pep}`;

  const prepBuffEl = document.getElementById('buff-prep-turns');
  const pepBuffEl = document.getElementById('buff-pep-turns');
  if (prepBuffEl)
    prepBuffEl.innerText = STATE.buffs.prepTurns > 0 ? `${STATE.buffs.prepTurns}` : '0';
  if (pepBuffEl) pepBuffEl.innerText = STATE.buffs.pepTurns > 0 ? `${STATE.buffs.pepTurns}` : '0';

  if (STATE.items.testkit === 0)
    document.getElementById('item-testkit').className = 'text-xs font-bold text-slate-600';
}

function renderPartner() {
  const p = STATE.currentPartner;
  document.getElementById('avatar-emoji').innerText = p.avatar;
  document.getElementById('partner-status').classList.add('hidden');
  document.getElementById('partner-gender').innerText =
    `性别/身份：${getGenderLabel(p.genderIdentity)}`;
  document.getElementById('partner-mental').innerText =
    `心理状态：${getPartnerMentalLabel(p.mental)}`;
  const rolePrefix = STATE.playerRole === 'provider' ? `订单报价 $${p.payout} · ` : '';
  const riskTags = p.tags.filter(
    (t) =>
      (t.color || '').includes('rose') ||
      (t.color || '').includes('red') ||
      (t.behaviorRisk || 0) >= 2,
  ).length;
  const safeTags = p.tags.filter((t) => t.safetyBonus || t.safeChance).length;
  const idProfile = IDENTITY_RISK_PROFILE[STATE.selectedIdentity] || { safeLineBias: 0 };
  let linePool = FLIRT_LINES.neutral;
  if (STATE.playerRole === 'provider') {
    linePool = FLIRT_LINES.provider;
  } else if (safeTags > riskTags && Math.random() < 0.55 + idProfile.safeLineBias) {
    linePool = FLIRT_LINES.safe;
  } else if (riskTags > 0 && Math.random() < 0.58) {
    linePool = FLIRT_LINES.risky;
  }
  const line = linePool[Math.floor(Math.random() * linePool.length)];
  document.getElementById('flirt-text').innerText = `${rolePrefix}"${line}"`;

  const container = document.getElementById('tags-container');
  container.innerHTML = '';

  let constraints = [];
  let hiddenCount = 0;
  const isPanic = STATE.anxiety >= 80;

  p.tags.forEach((tag) => {
    const div = document.createElement('div');
    const forceHide = isPanic && Math.random() < 0.5;
    if (!tag.revealed || forceHide) {
      hiddenCount++;
      div.className =
        'tag-badge px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 bg-slate-900 border border-slate-700 shadow-sm mb-1 flex items-center gap-1.5 cursor-help';
      if (isPanic) {
        const span = document.createElement('span');
        span.className = 'blur-sm';
        span.textContent = '???';
        div.appendChild(span);
      } else {
        const iconSpan = document.createElement('span');
        iconSpan.textContent = '❓';
        div.appendChild(iconSpan);
        div.appendChild(document.createTextNode(' 隐藏信息'));
      }
    } else {
      if (tag.constraint) constraints.push(tag.constraint);
      div.className = `tag-badge tag-reveal px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg mb-1 flex items-center gap-1.5 border border-white/10 ${tag.color}`;
      let icon = '⏺';
      if (tag.color.includes('red')) icon = '⚠️';
      else if (tag.constraint) icon = '🚫';
      else if (tag.color.includes('emerald')) icon = '🛡️';
      const iconSpan = document.createElement('span');
      iconSpan.className = 'opacity-75';
      iconSpan.textContent = icon;
      div.appendChild(iconSpan);
      div.appendChild(document.createTextNode(` ${tag.text}`));
    }
    container.appendChild(div);
  });

  resetButtons();
  if (constraints.length > 0) applyConstraints(constraints);

  const chatBtn = document.getElementById('btn-chat');
  if (hiddenCount === 0 && !isPanic) {
    chatBtn.classList.add('opacity-50', 'cursor-not-allowed');
    chatBtn.disabled = true;
    chatBtn.innerHTML = '<span>💬</span> 已完全了解';
  } else {
    chatBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    chatBtn.disabled = false;
    chatBtn.innerHTML =
      '<span>💬</span> 试探 / 聊天 <span class="opacity-50 text-[10px] font-normal ml-1">(压抑值+3)</span>';
  }
}

function resetButtons() {
  const ids = [
    'btn-kiss-deep',
    'btn-handjob',
    'btn-oral-condom',
    'btn-oral-raw',
    'btn-sex-condom',
    'btn-sex-raw',
    'btn-anal-condom',
    'btn-anal-raw',
  ];
  ids.forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove('btn-disabled');
    const overlay = btn.querySelector('.disabled-overlay');
    if (overlay) overlay.remove();
  });
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function applyConstraints(constraints) {
  constraints.forEach((c) => {
    if (c === 'no_condom') {
      disableBtn('btn-oral-condom');
      disableBtn('btn-sex-condom');
      disableBtn('btn-anal-condom');
    } else if (c === 'condom_only') {
      disableBtn('btn-oral-raw');
      disableBtn('btn-sex-raw');
      disableBtn('btn-anal-raw');
    } else if (c === 'no_oral') {
      disableBtn('btn-oral-condom');
      disableBtn('btn-oral-raw');
    } else if (c === 'oral_only') {
      disableBtn('btn-sex-condom');
      disableBtn('btn-sex-raw');
      disableBtn('btn-anal-condom');
      disableBtn('btn-anal-raw');
    }
  });
}

function disableBtn(id) {
  const btn = document.getElementById(id);
  if (!btn) return;
  if (!btn.disabled) {
    btn.disabled = true;
    btn.classList.add('btn-disabled');
    const span = document.createElement('div');
    span.className =
      'disabled-overlay absolute inset-0 flex items-center justify-center bg-black/60 text-rose-500 font-bold rotate-[-3deg] text-[10px] uppercase border border-rose-500/30 rounded-xl backdrop-blur-[1px]';
    span.innerText = '对方拒绝';
    btn.appendChild(span);
  }
}

// --- ACTIONS & HISTORY ---

function advanceTime(fCost, aCost = 0) {
  STATE.turn++;
  STATE.day++;
  STATE.frustration += fCost;
  STATE.anxiety += aCost;
  const extraFatigue = STATE.mental.insomnia >= 55 ? 5 : 0;
  STATE.energy = Math.max(0, STATE.energy - (12 + extraFatigue));

  STATE.mental.acuteStress = Math.min(100, STATE.mental.acuteStress + Math.max(0, aCost * 0.45));
  STATE.mental.panic = Math.min(
    100,
    Math.max(0, STATE.mental.panic + (STATE.anxiety >= 70 ? 5 : -1)),
  );
  STATE.mental.insomnia = Math.min(
    100,
    Math.max(0, STATE.mental.insomnia + (STATE.anxiety >= 60 ? 3 : -1)),
  );
  STATE.mental.depression = Math.min(
    100,
    Math.max(0, STATE.mental.depression + (STATE.money < 60 ? 2 : -0.5)),
  );

  if (STATE.anxiety > 20) STATE.anxiety += CONFIG.anxietyGainPassive;
  if (STATE.frustration > 100) STATE.frustration = 100;
  if (STATE.anxiety > 100) STATE.anxiety = 100;

  if (STATE.mental.panic >= 70) {
    STATE.encounterRiskMultiplier = Math.max(STATE.encounterRiskMultiplier, 1.08);
  }

  if (STATE.buffs.prepTurns > 0) STATE.buffs.prepTurns--;
  if (STATE.buffs.pepTurns > 0) STATE.buffs.pepTurns--;

  updateStatsUI();

  if (STATE.frustration >= 100) {
    showGameOver(
      '欲火焚身',
      '长期的压抑让你彻底失去了理智。你无法再思考后果，在绝望中发生了一次随机的高危行为。',
      '🤯',
      STATE.infectionData,
      STATE.infectionMeta,
    );
    return true;
  }
  if (STATE.anxiety >= 100) {
    showGameOver(
      '精神崩溃',
      '巨大的心理压力压垮了你。你开始出现幻觉，被送往了精神病院，游戏结束。',
      '😵‍💫',
    );
    return true;
  }
  if (STATE.mental.acuteStress >= 100) {
    showGameOver('急性应激失控', '你的神经系统进入失控状态，无法继续做出稳定决策。', '🫨');
    return true;
  }
  if (STATE.energy <= 0) {
    showGameOver('体力透支', '长期高压与睡眠不足让你彻底倒下，无法继续维持生活。', '🥵');
    return true;
  }
  if (settlePeriodicCost()) {
    return true;
  }
  if (STATE.day > CONFIG.targetDays) {
    if (STATE.isInfected) {
      showGameOver(
        '期限结算失败',
        '你撑到了结算日，但健康状态未通过最终审查。',
        '🩺',
        STATE.infectionData,
        STATE.infectionMeta,
      );
    } else if (STATE.money < 180) {
      showGameOver('期限结算失败', '你活到了结算日，但资金未达最低安全线（$180）。', '📉');
    } else {
      showWin();
    }
    return true;
  }
  return false;
}

function settlePeriodicCost() {
  STATE.money -= CONFIG.dailyCost;
  if (STATE.day > 0 && STATE.day % CONFIG.rentCycleDays === 0) {
    STATE.money -= CONFIG.rentAmount;
  }
  if (STATE.money < 0) {
    showGameOver('资金断裂', '你已无力支付基本生活与房租，经营失败。', '💸');
    return true;
  }
  return false;
}

function recordHistory(action, infectedThisTurn) {
  const p = STATE.currentPartner;
  let outcomeLabel = '';
  let outcomeClass = '';

  const isDiseased = p.diseases.length > 0;

  if (action === 'refuse') {
    if (isDiseased) {
      outcomeLabel = '🛡️ 正确离开';
      outcomeClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-900/20';
    } else {
      outcomeLabel = '👋 遗憾错过';
      outcomeClass = 'text-slate-400 border-slate-500/30 bg-slate-800';
    }
  } else {
    if (infectedThisTurn) {
      outcomeLabel = '💀 被ta感染';
      outcomeClass = 'text-rose-500 border-rose-500/30 bg-rose-900/30';
    } else if (isDiseased) {
      outcomeLabel = '😰 死里逃生';
      outcomeClass = 'text-amber-400 border-amber-500/30 bg-amber-900/20';
    } else {
      outcomeLabel = '✅ 理智享受';
      outcomeClass = 'text-blue-400 border-blue-500/30 bg-blue-900/20';
    }
  }

  STATE.history.push({
    avatar: p.avatar,
    genderIdentity: p.genderIdentity,
    tags: p.tags,
    diseases: p.diseases,
    diseaseStages: p.diseaseStages,
    action,
    outcomeLabel,
    outcomeClass,
  });
}

function renderHistoryList() {
  const list = document.getElementById('history-list');
  list.innerHTML = '';

  STATE.history.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5';

    const avatarWrap = document.createElement('div');
    avatarWrap.className =
      'relative text-2xl bg-slate-900 rounded-full w-10 h-10 flex items-center justify-center border border-white/10 flex-shrink-0';
    avatarWrap.appendChild(document.createTextNode(item.avatar));
    if (item.diseases.length > 0) {
      const status = document.createElement('span');
      status.className = 'absolute -bottom-1 -right-1 text-[10px]';
      status.textContent = '🦠';
      avatarWrap.appendChild(status);
    }

    const main = document.createElement('div');
    main.className = 'flex-1 min-w-0';

    const gender = document.createElement('div');
    gender.className = 'text-[10px] text-slate-400 mb-1';
    gender.textContent = `对象：${getGenderLabel(item.genderIdentity)}`;
    main.appendChild(gender);

    const tags = document.createElement('div');
    tags.className = 'mb-1 leading-tight';
    item.tags.forEach((t) => {
      const tag = document.createElement('span');
      tag.className =
        'inline-block px-1.5 py-0.5 rounded bg-slate-700 text-[10px] text-slate-300 mr-1 mb-1';
      tag.textContent = t.text;
      tags.appendChild(tag);
    });
    tags.appendChild(document.createElement('br'));

    const disease = document.createElement('span');
    if (item.diseases.length > 0) {
      const diseaseText = item.diseases
        .map((d) => {
          const stage = item.diseaseStages?.[d];
          return `${DISEASES[d].name}${stage ? `（${stage.label}）` : ''}`;
        })
        .join(', ');
      disease.className = 'text-[10px] text-rose-400 font-bold';
      disease.textContent = `携带: ${diseaseText}`;
    } else {
      disease.className = 'text-[10px] text-emerald-500/50';
      disease.textContent = '健康';
    }
    tags.appendChild(disease);
    main.appendChild(tags);

    const right = document.createElement('div');
    right.className = 'flex-shrink-0 ml-2';
    const outcome = document.createElement('span');
    outcome.className = `px-2 py-1 rounded text-[10px] font-bold border ${item.outcomeClass}`;
    outcome.textContent = item.outcomeLabel;
    right.appendChild(outcome);

    row.appendChild(avatarWrap);
    row.appendChild(main);
    row.appendChild(right);
    list.appendChild(row);
  });
}

function useItem(type) {
  if (type === 'testkit' && STATE.items.testkit > 0) {
    STATE.items.testkit--;
    const p = STATE.currentPartner;
    let msg = '';
    let icon = '';
    if (p.diseases.length > 0) {
      const names = p.diseases
        .map((d) => {
          const stage = p.diseaseStages?.[d];
          return `${DISEASES[d].name}（${stage?.label || '未知阶段'}）`;
        })
        .join('、');
      msg = `<span class="text-rose-400 font-bold">⚠️ 阳性反应！</span><br>病原体：${escapeHTML(names)}。<br>请立即离开。`;
      icon = '🦠';
      document.getElementById('partner-status').classList.remove('hidden');
    } else {
      msg =
        '<span class="text-emerald-400 font-bold">✅ 阴性。</span><br>未检测到常见病原体。<br>(注：无法检测窗口期极短的病毒)';
      icon = '🛡️';
    }
    p.tags.forEach((t) => (t.revealed = true));
    renderPartner();
    updateStatsUI();
    showFeedback('检测结果', msg, icon, true, true);
  }
}

function usePrep() {
  if (STATE.items.prep <= 0 || STATE.buffs.prepTurns > 0) return;
  STATE.items.prep--;
  STATE.buffs.prepTurns = 3;
  updateStatsUI();
  showFeedback(
    'PrEP 生效',
    '你开始按时服用 PrEP，接下来 3 回合体液传播风险将显著下降。',
    '🛡️',
    true,
  );
}

function usePep() {
  if (STATE.items.pep <= 0 || STATE.buffs.pepTurns > 0) return;
  STATE.items.pep--;
  STATE.buffs.pepTurns = CONFIG.pepEffectiveTurns;
  updateStatsUI();
  showFeedback(
    'PEP 已启动',
    '你已开始暴露后阻断，接下来 2 回合若处于窗口期，有机会阻断感染。',
    '💊',
    true,
  );
}

function runHospitalCheck(testType = 'rapid') {
  const survive = !advanceTime(CONFIG.hospitalCost, 0);
  if (!survive) return;

  STATE.anxiety = 0;
  updateStatsUI();

  const profile = CONFIG.testProfiles[testType] || CONFIG.testProfiles.rapid;

  if (STATE.isInfected) {
    const effectiveFalseNegative = getWindowFalseNegativeRate(testType);
    if (Math.random() < effectiveFalseNegative) {
      showFeedback(
        `窗口期未检出（${profile.label}）`,
        '医院报告显示阴性，但你仍处在窗口期，结果可能是假阴性。',
        '🧪',
        true,
      );
      return;
    }
    showGameOver(
      '确诊感染',
      `很遗憾，医院的检查结果显示你已感染。<br>检测方式：${profile.label}<br>之前的侥幸心理终究没能救你。`,
      '🏥',
      STATE.infectionData,
      STATE.infectionMeta,
    );
  } else {
    showFeedback(
      `虚惊一场（${profile.label}）`,
      "<span class='text-emerald-400 font-bold'>检测结果阴性。</span><br>你身体是健康的。心理压力已清空，但你也为此浪费了宝贵的时间（压抑值大幅上升）。",
      '🏥',
      true,
      true,
    );
  }
}

function goToHospital() {
  showFeedback(
    '选择检测方式',
    `<div class='space-y-2'>
            <button onclick="document.getElementById('feedback-overlay').classList.add('hidden'); runHospitalCheck('rapid');" class='w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-xs'>快速筛查（更快，假阴性更高）</button>
            <button onclick="document.getElementById('feedback-overlay').classList.add('hidden'); runHospitalCheck('agab');" class='w-full py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg font-bold text-xs'>抗原抗体（平衡）</button>
            <button onclick="document.getElementById('feedback-overlay').classList.add('hidden'); runHospitalCheck('naat');" class='w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs'>核酸检测（更敏感）</button>
        </div>`,
    '🏥',
    true,
    true,
  );
}

function nextTurn() {
  document.getElementById('feedback-overlay').classList.add('hidden');
  toggleHistoryView(false);
  if (maybeTriggerSafetyEvent()) {
    return;
  }
  generateNewPartner();
}

function maybeTriggerSafetyEvent() {
  const eventRateBase = STATE.playerRole === 'provider' ? 0.22 : 0.12;
  const stressBoost = Math.min(
    0.16,
    (STATE.anxiety / 100) * 0.12 + (STATE.mental.panic / 100) * 0.1,
  );
  const triggerRate = eventRateBase + stressBoost;
  if (Math.random() >= triggerRate) {
    return false;
  }

  const event = SAFETY_EVENTS[Math.floor(Math.random() * SAFETY_EVENTS.length)];
  const optionButtons = event.options
    .map(
      (opt, idx) =>
        `<button onclick="resolveSafetyEvent(${idx})" class='w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold'>${opt.label}</button>`,
    )
    .join('');

  STATE.currentEvent = event;
  showFeedback(
    event.title,
    `${event.desc}<div class='space-y-2 mt-3'>${optionButtons}</div>`,
    event.icon,
    true,
    true,
  );
  return true;
}

function resolveSafetyEvent(optionIdx) {
  const event = STATE.currentEvent;
  if (!event) {
    document.getElementById('feedback-overlay').classList.add('hidden');
    return;
  }
  const option = event.options[optionIdx];
  if (!option) {
    document.getElementById('feedback-overlay').classList.add('hidden');
    return;
  }

  const effects = option.effects || {};
  STATE.money += effects.money || 0;
  STATE.anxiety = Math.max(0, Math.min(100, STATE.anxiety + (effects.anxiety || 0)));
  STATE.reputation = Math.max(0, Math.min(100, STATE.reputation + (effects.rep || 0)));
  STATE.encounterRiskMultiplier = effects.riskMul || 1;
  STATE.mental.acuteStress = Math.min(
    100,
    STATE.mental.acuteStress + Math.max(0, effects.anxiety || 0) * 0.6,
  );
  STATE.mental.panic = Math.min(100, STATE.mental.panic + Math.max(0, effects.anxiety || 0) * 0.4);

  STATE.currentEvent = null;
  updateStatsUI();
  document.getElementById('feedback-overlay').classList.add('hidden');
  generateNewPartner();
}

function takeAction(actionType) {
  if (STATE.frustration >= 100 || STATE.anxiety >= 100) return;

  if (actionType === 'chat') {
    const p = STATE.currentPartner;
    const hiddenIndices = p.tags.map((t, i) => (!t.revealed ? i : -1)).filter((i) => i !== -1);
    if (hiddenIndices.length > 0) {
      const idx = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
      p.tags[idx].revealed = true;
      applyChatEvent();
      if (!advanceTime(CONFIG.chatCost, 0)) renderPartner();
    } else {
      applyChatEvent();
      if (!advanceTime(CONFIG.chatCost, 0)) renderPartner();
    }
    return;
  }

  const partner = STATE.currentPartner;
  let infectedThisTurn = false;

  if (actionType === 'refuse') {
    recordHistory('refuse', false);
    if (!advanceTime(CONFIG.passiveGain + CONFIG.refuseCost, 0)) {
      showFeedback('继续寻找', '你选择了离开。压抑值上升，但至少你暂时是安全的。', '🏃');
    }
    return;
  }

  const exposureSite =
    actionType === 'sex_raw' ||
    actionType === 'sex_condom' ||
    actionType === 'anal_raw' ||
    actionType === 'anal_condom'
      ? 'anal'
      : actionType === 'oral_raw' || actionType === 'oral_condom' || actionType === 'kiss_deep'
        ? 'oral'
        : 'skin';

  const reduction = CONFIG.rewards[actionType];
  const anxietyGain = CONFIG.stress[actionType];
  const rolePayout = STATE.playerRole === 'provider' ? partner.payout || 25 : 0;

  if (!STATE.isInfected && partner.diseases.length > 0) {
    for (let dKey of partner.diseases) {
      const disease = DISEASES[dKey];
      let chance = (TRANSMISSION_BASE[dKey] && TRANSMISSION_BASE[dKey][actionType]) || 0;

      chance *= getStageMultiplier(partner, dKey);
      chance *= getBehaviorRiskMultiplier(partner);
      chance *= STATE.encounterRiskMultiplier;

      if (exposureSite === 'anal' && ['fluid', 'fluid_mucous', 'blood'].includes(disease.riskType))
        chance *= 1.25;
      if (exposureSite === 'oral' && ['fluid', 'fluid_mucous'].includes(disease.riskType))
        chance *= 0.75;
      if (exposureSite === 'skin' && ['contact', 'skin', 'skin_hair'].includes(disease.riskType))
        chance *= 1.15;

      if (
        STATE.buffs.prepTurns > 0 &&
        ['fluid', 'fluid_mucous', 'blood'].includes(disease.riskType)
      ) {
        chance *= 1 - CONFIG.prepRiskReduction;
      }
      chance = Math.min(0.65, chance);

      if (Math.random() < chance) {
        let blocked = false;
        if (STATE.buffs.pepTurns > 0 && Math.random() < CONFIG.pepRescueChance) {
          blocked = true;
          showFeedback('PEP 阻断成功', '这次高危暴露被 PEP 成功阻断，你暂时逃过一劫。', '💊', true);
        }
        if (blocked) {
          continue;
        }
        STATE.isInfected = true;
        STATE.infectionData = disease;
        STATE.infectionMeta = {
          turn: STATE.turn,
          partnerSummary: getPartnerStageSummary(partner),
          diseaseKey: dKey,
          stageLabel: partner?.diseaseStages?.[dKey]?.label || '未知阶段',
        };
        infectedThisTurn = true;
        break;
      }
    }
  }

  recordHistory(actionType, infectedThisTurn);
  STATE.encounterRiskMultiplier = 1;

  if (STATE.playerRole === 'provider') {
    STATE.money += rolePayout;
    STATE.reputation = Math.min(100, STATE.reputation + 2);
  } else {
    STATE.reputation = Math.min(100, STATE.reputation + 1);
  }

  STATE.frustration -= reduction;
  const frustrationDelta = CONFIG.passiveGain - reduction;

  if (advanceTime(frustrationDelta, anxietyGain)) return;

  if (STATE.frustration < 0) STATE.frustration = 0;

  if (actionType !== 'refuse' && actionType !== 'chat' && STATE.frustration > 0) {
    if (maybeTriggerPostActionIncident(actionType)) {
      return;
    }
  }

  if (STATE.frustration === 0) {
    if (STATE.isInfected) {
      showGameOver(
        '糟糕的胜利',
        '你的压抑值清零了，你感到无比轻松...<br>但在几天后，你的身体开始出现异常反应。<br>你虽然释放了欲望，却输掉了健康。',
        '🥀',
        STATE.infectionData,
        STATE.infectionMeta,
      );
    } else {
      showWin();
    }
  } else {
    let title = '宣泄与不安';
    let icon = '🍬';
    let msg = `欲望得到了释放。<br>生理压抑 <span class="text-emerald-400">-${reduction}</span>`;

    if (anxietyGain > 5) {
      msg += `<br>心理压力 <span class="text-violet-400">+${anxietyGain}</span>`;
      icon = '😰';
    }

    if (STATE.isInfected) {
      msg +=
        '<br><span class="text-xs text-slate-500 italic mt-2">你感觉到了一丝异样，但也许只是错觉...？</span>';
    } else if (partner.diseases.length > 0) {
      msg +=
        '<br><span class="text-xs text-slate-500 italic mt-2">虽然过程很惊险，但你似乎运气不错...暂时。</span>';
    }

    showFeedback(title, msg, icon, false, true);
  }
}

function applyChatEvent() {
  const roll = Math.random();
  if (roll < 0.28) {
    STATE.encounterRiskMultiplier = 0.9;
    STATE.anxiety = Math.max(0, STATE.anxiety - 3);
    showFeedback('边界沟通有效', '你把规则说清楚了，对方接受了防护边界。', '🗣️', true);
    return;
  }
  if (roll < 0.52) {
    STATE.encounterRiskMultiplier = 1.12;
    STATE.anxiety = Math.min(100, STATE.anxiety + 6);
    showFeedback('被话术带节奏', '对方持续施压，你的判断开始动摇。', '🌀', true);
    return;
  }
  STATE.encounterRiskMultiplier = 1;
}

function maybeTriggerPostActionIncident(lastActionType) {
  const partner = STATE.currentPartner;
  if (!partner) return false;

  const baseRate = lastActionType === 'anal_raw' || lastActionType === 'sex_raw' ? 0.32 : 0.18;
  const anxietyBoost = STATE.anxiety >= 70 ? 0.1 : 0;
  const impulseBoost = (partner.mental?.impulse || 0) >= 65 ? 0.08 : 0;
  const rate = Math.min(0.65, baseRate + anxietyBoost + impulseBoost);
  if (Math.random() >= rate) return false;

  const highRiskChoices = ['oral_raw', 'sex_raw', 'anal_raw'];
  const saferChoices = ['handjob', 'oral_condom', 'sex_condom', 'anal_condom'];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const randomA = Math.random() < 0.5 ? pick(saferChoices) : pick(highRiskChoices);
  let randomB = Math.random() < 0.5 ? pick(saferChoices) : pick(highRiskChoices);
  if (randomB === randomA) {
    const merge = [...saferChoices, ...highRiskChoices].filter((v) => v !== randomA);
    randomB = pick(merge);
  }

  const templates = [
    {
      title: '意外情况：对方要求再来一次',
      icon: '🔁',
      msg: '对方情绪上头，强烈要求继续。你可以拒绝，也可以从随机项目里选一项继续。',
      options: [
        { label: `继续：${ACTION_LABELS[randomA]}`, type: 'action', action: randomA },
        { label: `继续：${ACTION_LABELS[randomB]}`, type: 'action', action: randomB },
        { label: '拒绝并离开', type: 'leave' },
      ],
    },
    {
      title: '意外情况：临时改项目',
      icon: '🧾',
      msg: '对方临时改口，提出和原先不同的项目。你要重新决策。',
      options: [
        { label: `接受：${ACTION_LABELS[randomA]}`, type: 'action', action: randomA },
        { label: '坚持原边界', type: 'boundary' },
        { label: '拒绝并离开', type: 'leave' },
      ],
    },
    {
      title: '意外情况：情绪波动',
      icon: '🌧️',
      msg: '对方情绪突然波动，沟通变得困难。你需要迅速选择处理方式。',
      options: [
        { label: '安抚并重新协商', type: 'soothe' },
        { label: `直接结束：${ACTION_LABELS[randomB]}`, type: 'action', action: randomB },
        { label: '立即离开', type: 'leave' },
      ],
    },
  ];

  const chosen = templates[Math.floor(Math.random() * templates.length)];
  STATE.currentIncident = chosen;

  const buttons = chosen.options
    .map(
      (opt, idx) =>
        `<button onclick="resolvePostActionIncident(${idx})" class='w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold'>${opt.label}</button>`,
    )
    .join('');

  showFeedback(
    chosen.title,
    `${chosen.msg}<div class='space-y-2 mt-3'>${buttons}</div>`,
    chosen.icon,
    true,
    true,
  );
  return true;
}

function resolvePostActionIncident(optionIdx) {
  const incident = STATE.currentIncident;
  if (!incident) {
    document.getElementById('feedback-overlay').classList.add('hidden');
    return;
  }
  const option = incident.options?.[optionIdx];
  STATE.currentIncident = null;
  document.getElementById('feedback-overlay').classList.add('hidden');
  if (!option) return;

  if (option.type === 'action' && option.action) {
    STATE.anxiety = Math.min(100, STATE.anxiety + 4);
    updateStatsUI();
    takeAction(option.action);
    return;
  }
  if (option.type === 'boundary') {
    STATE.anxiety = Math.max(0, STATE.anxiety - 2);
    STATE.encounterRiskMultiplier = 0.94;
    showFeedback('边界守住了', '你坚持了边界，对方没有继续施压。', '🛡️', true);
    updateStatsUI();
    return;
  }
  if (option.type === 'soothe') {
    STATE.anxiety = Math.max(0, STATE.anxiety - 4);
    STATE.mental.panic = Math.max(0, STATE.mental.panic - 5);
    STATE.encounterRiskMultiplier = 0.96;
    showFeedback('协商成功', '你稳住了现场情绪，风险有所下降。', '🤝', true);
    updateStatsUI();
    return;
  }

  STATE.frustration = Math.min(100, STATE.frustration + 5);
  STATE.anxiety = Math.min(100, STATE.anxiety + 3);
  updateStatsUI();
  showFeedback('你选择离开', '你结束了这次接触，代价是压抑和焦虑小幅上升。', '🚶', true);
}

// --- UI HELPERS ---

function getStatsData() {
  let counts = { enjoy: 0, escape: 0, leave: 0, miss: 0, infected: 0 };
  let actionCounts = {
    kiss_deep: 0,
    handjob: 0,
    sex_raw: 0,
    sex_condom: 0,
    anal_raw: 0,
    anal_condom: 0,
    oral_raw: 0,
    oral_condom: 0,
    refuse: 0,
  };

  STATE.history.forEach((h) => {
    if (h.outcomeLabel.includes('理智享受')) counts.enjoy++;
    if (h.outcomeLabel.includes('死里逃生')) counts.escape++;
    if (h.outcomeLabel.includes('正确离开')) counts.leave++;
    if (h.outcomeLabel.includes('遗憾错过')) counts.miss++;
    if (h.outcomeLabel.includes('被ta感染')) counts.infected++;

    if (actionCounts[h.action] !== undefined) {
      actionCounts[h.action]++;
    }
  });

  return { counts, actionCounts, turns: STATE.turn - 1 };
}

function buildStatsPanel() {
  const { counts, actionCounts, turns } = getStatsData();
  const panel = document.createElement('div');
  panel.className = 'mt-4 bg-slate-950/50 rounded-xl p-3 border border-white/5 text-xs';

  const titleA = document.createElement('h4');
  titleA.className =
    'text-slate-500 font-bold uppercase tracking-widest mb-2 text-center text-[10px]';
  titleA.textContent = '生涯结果';
  panel.appendChild(titleA);

  const resultGrid = document.createElement('div');
  resultGrid.className = 'grid grid-cols-2 gap-y-2 gap-x-4 mb-4';
  const resultRows = [
    ['✅ 理智享受', counts.enjoy, 'text-blue-300'],
    ['🛡️ 正确离开', counts.leave, 'text-emerald-300'],
    ['😰 死里逃生', counts.escape, 'text-amber-300'],
    ['👋 遗憾错过', counts.miss, 'text-slate-400'],
  ];
  resultRows.forEach(([label, value, cls]) => {
    const row = document.createElement('div');
    row.className = 'flex justify-between items-center border-b border-white/5 pb-1';
    const left = document.createElement('span');
    left.className = cls;
    left.textContent = label;
    const right = document.createElement('span');
    right.className = 'font-mono font-bold text-white text-sm';
    right.textContent = String(value);
    row.appendChild(left);
    row.appendChild(right);
    resultGrid.appendChild(row);
  });
  const infected = document.createElement('div');
  infected.className =
    'col-span-2 flex justify-between items-center border-b border-white/5 pb-1 bg-rose-950/20 px-1 -mx-1 rounded';
  const infectedLabel = document.createElement('span');
  infectedLabel.className = 'text-rose-400 font-bold';
  infectedLabel.textContent = '💀 被感染次数';
  const infectedValue = document.createElement('span');
  infectedValue.className = 'font-mono font-black text-rose-400 text-sm';
  infectedValue.textContent = String(counts.infected);
  infected.appendChild(infectedLabel);
  infected.appendChild(infectedValue);
  resultGrid.appendChild(infected);
  panel.appendChild(resultGrid);

  const titleB = document.createElement('h4');
  titleB.className =
    'text-slate-500 font-bold uppercase tracking-widest mb-2 text-center text-[10px]';
  titleB.textContent = '行为统计 (次数)';
  panel.appendChild(titleB);

  const actionGrid = document.createElement('div');
  actionGrid.className = 'grid grid-cols-2 gap-2 mb-2';
  const actionRows = [
    [
      '💋 深吻',
      actionCounts.kiss_deep,
      'bg-slate-800/50 border border-white/10',
      'text-slate-300',
      'text-slate-200',
    ],
    [
      '✋ 手交',
      actionCounts.handjob,
      'bg-sky-900/20 border border-sky-500/20',
      'text-sky-300',
      'text-sky-200',
    ],
    [
      '无套性交',
      actionCounts.sex_raw,
      'bg-rose-900/20 border border-rose-500/20',
      'text-rose-300',
      'text-rose-200',
    ],
    [
      '无套肛交',
      actionCounts.anal_raw,
      'bg-red-900/20 border border-red-500/20',
      'text-red-300',
      'text-red-200',
    ],
    [
      '无套口交',
      actionCounts.oral_raw,
      'bg-amber-900/20 border border-amber-500/20',
      'text-amber-300',
      'text-amber-200',
    ],
    [
      '戴套性交',
      actionCounts.sex_condom,
      'bg-emerald-900/20 border border-emerald-500/20',
      'text-emerald-300',
      'text-emerald-200',
    ],
    [
      '戴套肛交',
      actionCounts.anal_condom,
      'bg-teal-900/20 border border-teal-500/20',
      'text-teal-300',
      'text-teal-200',
    ],
    [
      '戴套口交',
      actionCounts.oral_condom,
      'bg-slate-800/50 border border-white/10',
      'text-slate-400',
      'text-slate-300',
    ],
  ];
  actionRows.forEach(([label, value, boxClass, labelClass, valueClass]) => {
    const box = document.createElement('div');
    box.className = `${boxClass} rounded p-1 text-center`;
    const labelEl = document.createElement('div');
    labelEl.className = `text-[9px] ${labelClass} opacity-70`;
    labelEl.textContent = String(label);
    const valueEl = document.createElement('div');
    valueEl.className = `font-mono font-bold ${valueClass}`;
    valueEl.textContent = String(value);
    box.appendChild(labelEl);
    box.appendChild(valueEl);
    actionGrid.appendChild(box);
  });

  const refuse = document.createElement('div');
  refuse.className =
    'col-span-2 bg-slate-800 border border-white/5 rounded p-1 flex justify-between px-3 items-center';
  const refuseLabel = document.createElement('div');
  refuseLabel.className = 'text-[9px] text-slate-400';
  refuseLabel.textContent = '👋 拒绝/离开';
  const refuseValue = document.createElement('div');
  refuseValue.className = 'font-mono font-bold text-white';
  refuseValue.textContent = String(actionCounts.refuse);
  refuse.appendChild(refuseLabel);
  refuse.appendChild(refuseValue);
  actionGrid.appendChild(refuse);
  panel.appendChild(actionGrid);

  const footer = document.createElement('div');
  footer.className = 'mt-2 pt-2 border-t border-white/10 flex justify-between items-center';
  const footerLabel = document.createElement('span');
  footerLabel.className = 'font-bold text-slate-300';
  footerLabel.textContent = '⏱️ 存活回合';
  const footerValue = document.createElement('span');
  footerValue.className = 'font-mono font-black text-xl text-white';
  footerValue.textContent = String(turns);
  footer.appendChild(footerLabel);
  footer.appendChild(footerValue);
  panel.appendChild(footer);

  return panel;
}

function showFeedback(title, msg, icon, isSimpleAlert = false, allowHTML = false) {
  const el = document.getElementById('feedback-overlay');
  el.classList.remove('hidden');
  document.getElementById('feedback-title').innerText = title;
  document.getElementById('feedback-icon').innerText = icon;
  const messageEl = document.getElementById('feedback-message');
  if (allowHTML) {
    messageEl.innerHTML = msg;
  } else {
    messageEl.textContent = msg;
  }

  document.getElementById('disease-report').classList.add('hidden');
  toggleHistoryView(false);

  const nextBtn = document.getElementById('next-btn');
  const restartBtn = document.getElementById('restart-btn');
  const historyBtn = document.getElementById('view-history-btn');

  restartBtn.classList.add('hidden');
  nextBtn.classList.remove('hidden');
  historyBtn.classList.add('hidden');

  if (isSimpleAlert) {
    nextBtn.innerText = '关闭';
    nextBtn.onclick = function () {
      el.classList.add('hidden');
      nextBtn.onclick = nextTurn;
      nextBtn.innerText = '继续';
    };
  } else {
    nextBtn.innerText = '继续';
    nextBtn.onclick = nextTurn;
  }
}

function showGameOver(title, msg, icon, disease = null, infectionMeta = null) {
  STATE.isGameOver = true;
  const el = document.getElementById('feedback-overlay');
  el.classList.remove('hidden');

  const titleEl = document.getElementById('feedback-title');
  titleEl.innerText = title;
  titleEl.className = 'text-3xl font-black text-rose-500 uppercase tracking-tighter animate-pulse';
  document.getElementById('feedback-icon').innerText = icon;
  const feedbackMessage = document.getElementById('feedback-message');
  feedbackMessage.innerHTML = msg;
  feedbackMessage.appendChild(buildStatsPanel());

  if (disease) {
    const report = document.getElementById('disease-report');
    report.classList.remove('hidden');
    const stageText = infectionMeta?.stageLabel || '未知阶段';
    const sourceText = infectionMeta?.partnerSummary || '未知来源';
    const diseaseContent = document.getElementById('disease-content');
    diseaseContent.innerHTML = '';
    const lines = [
      ['确诊：', disease.name],
      ['阶段：', stageText],
      ['途径：', disease.transmission],
      ['可能暴露来源：', sourceText],
    ];
    lines.forEach(([label, value]) => {
      const p = document.createElement('p');
      const b = document.createElement('b');
      b.textContent = label;
      p.appendChild(b);
      p.appendChild(document.createTextNode(value));
      diseaseContent.appendChild(p);
    });
  } else {
    document.getElementById('disease-report').classList.add('hidden');
  }

  renderHistoryList();
  toggleHistoryView(false);

  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('restart-btn').classList.remove('hidden');
  document.getElementById('view-history-btn').classList.remove('hidden');
}

function showWin() {
  STATE.isGameOver = true;
  const el = document.getElementById('feedback-overlay');
  el.classList.remove('hidden');

  const titleEl = document.getElementById('feedback-title');
  titleEl.innerText = '幸存者';
  titleEl.className = 'text-3xl font-black text-emerald-400 uppercase tracking-tighter';
  document.getElementById('feedback-icon').innerText = '✨';
  const feedbackMessage = document.getElementById('feedback-message');
  feedbackMessage.textContent = '';
  feedbackMessage.appendChild(document.createTextNode('你成功清零了压抑值，且身体健康。'));
  feedbackMessage.appendChild(document.createElement('br'));
  feedbackMessage.appendChild(document.createElement('br'));
  feedbackMessage.appendChild(
    document.createTextNode('在这场充满迷雾和风险的游戏中，你靠着谨慎、策略和一点运气活了下来。'),
  );
  feedbackMessage.appendChild(buildStatsPanel());

  document.getElementById('disease-report').classList.add('hidden');
  renderHistoryList();
  toggleHistoryView(false);

  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('restart-btn').classList.remove('hidden');
  document.getElementById('view-history-btn').classList.remove('hidden');
}

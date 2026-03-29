export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple';
  question: string;
  options: QuizOption[];
  correctAnswer: string[]; // IDs of correct options
  explanation: string;
}

export interface KnowledgePoint {
  id: string;
  title: string;
  description: string;
  imageSeed?: string; // For picsum images
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  points: KnowledgePoint[];
}

export const ECONOMICS_CHAPTERS: Chapter[] = [
  {
    id: "ch1",
    title: "第一章：导论",
    description: "介绍经济学的研究对象、基本假设以及微观与宏观的区别。",
    points: [
      { id: "1-1", title: "经济学的研究对象", description: "稀缺性、选择与资源配置。" },
      { id: "1-2", title: "微观经济学与宏观经济学", description: "两者的区别与联系。" },
      { id: "1-3", title: "经济学研究方法", description: "实证分析与规范分析。" }
    ]
  },
  {
    id: "ch2",
    title: "第二章：需求、供给与均衡价格",
    description: "研究市场机制的核心：价格是如何形成的。",
    points: [
      { id: "2-1", title: "需求理论", description: "需求函数、需求曲线与需求定理。" },
      { id: "2-2", title: "供给理论", description: "供给函数、供给曲线与供给定理。" },
      { id: "2-3", title: "均衡价格的决定与变动", description: "市场均衡的形成及其变动。" },
      { id: "2-4", title: "弹性理论", description: "需求价格弹性、供给价格弹性等。" }
    ]
  },
  {
    id: "ch3",
    title: "第三章：消费者选择",
    description: "从效用角度分析消费者如何分配有限收入以获得最大满足。",
    points: [
      { id: "3-1", title: "效用论概述", description: "基数效用论与序数效用论。" },
      { id: "3-2", title: "无差异曲线", description: "边际替代率及其递减规律。" },
      { id: "3-3", title: "预算约束线", description: "消费者的预算空间。" },
      { id: "3-4", title: "消费者均衡", description: "效用最大化的条件。" }
    ]
  },
  {
    id: "ch4",
    title: "第四章：生产技术",
    description: "研究投入与产出之间的技术关系。",
    points: [
      { id: "4-1", title: "生产函数", description: "短期与长期生产函数。" },
      { id: "4-2", title: "一种可变要素的生产函数", description: "总产量、平均产量与边际产量。" },
      { id: "4-3", title: "等产量曲线", description: "边际技术替代率。" },
      { id: "4-4", title: "规模报酬", description: "规模收益递增、不变与递减。" }
    ]
  },
  {
    id: "ch5",
    title: "第五章：成本",
    description: "分析生产过程中的各种成本及其随产量的变化。",
    points: [
      { id: "5-1", title: "成本的概念", description: "机会成本、显性成本与隐性成本。" },
      { id: "5-2", title: "短期成本分析", description: "各类短期成本曲线的关系。" },
      { id: "5-3", title: "长期成本分析", description: "长期总成本、平均成本与边际成本。" }
    ]
  },
  {
    id: "ch6",
    title: "第六章：完全竞争市场",
    description: "分析最理想的市场结构下的厂商行为。",
    points: [
      { id: "6-1", title: "完全竞争市场的特征", description: "大量买者卖者、产品同质等。" },
      { id: "6-2", title: "完全竞争厂商的短期均衡", description: "P=MC原则。" },
      { id: "6-3", title: "完全竞争厂商的长期均衡", description: "零利润状态。" }
    ]
  },
  {
    id: "ch7",
    title: "第七章：不完全竞争市场",
    description: "研究垄断、垄断竞争和寡头市场。",
    points: [
      { id: "7-1", title: "完全垄断市场", description: "成因、均衡与价格歧视。" },
      { id: "7-2", title: "垄断竞争市场", description: "特征与均衡。" },
      { id: "7-3", title: "寡头市场", description: "古诺模型、斯威齐模型等。" }
    ]
  },
  {
    id: "ch8",
    title: "第八章：要素价格决定",
    description: "研究生产要素（劳动、资本等）的价格是如何决定的。",
    points: [
      { id: "8-1", title: "完全竞争厂商对要素的需求", description: "边际产品价值。" },
      { id: "8-2", title: "要素供给原则", description: "效用最大化与要素供给。" },
      { id: "8-3", title: "工资、利息、地租与利润", description: "各类要素价格的决定。" }
    ]
  },
  {
    id: "ch9",
    title: "第九章：一般均衡与福利经济学",
    description: "从整体角度研究所有市场的均衡以及社会福利的评价。",
    points: [
      { id: "9-1", title: "一般均衡理论", description: "局部均衡与一般均衡。" },
      { id: "9-2", title: "帕累托最优", description: "交换、生产及两者同时最优的条件。" },
      { id: "9-3", title: "社会福利函数", description: "公平与效率的权衡。" }
    ]
  },
  {
    id: "ch10",
    title: "第十章：市场失灵与微观经济政策",
    description: "分析市场机制在哪些情况下会失效，以及政府的对策。",
    points: [
      { id: "10-1", title: "垄断与低效率", description: "垄断导致的社会福利损失。" },
      { id: "10-2", title: "外部性", description: "正外部性与负外部性。" },
      { id: "10-3", title: "公共物品与公共资源", description: "非排他性与非竞争性。" },
      { id: "10-4", title: "信息不对称", description: "逆向选择与道德风险。" }
    ]
  }
];

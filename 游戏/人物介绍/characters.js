
// characters.js
const Chara = [
  {
    id: 1,
    name: "西弗勒斯·斯内普（Severus Snape）",
    desc: [
      "斯莱特林学院，痴迷黑魔法，崇拜纯血统理论，与詹姆敌对。",
      "莉莉幼年好友，因骂她“泥巴种”决裂，后因莉莉之死投靠邓布利多。",
      "标志事件：发明“神锋无影”等咒语；被詹姆当众用“倒挂金钟”羞辱。"
    ],
    image: "../images/char1.png",
    music: "../musics/Double Trouble.mp3"
  },

  {
    id: 2,
    name: "莉莉·伊万斯（Lily Evans）",
    desc: [
      "哈利母亲，麻瓜出身女巫，斯内普的青梅竹马，后与詹姆相爱结婚。",
      "魔药学天才，勇敢正直，格兰芬多级长。",
      "早期因詹姆欺凌斯内普厌恶他，后接受其改变。"
    ],
    image: "../images/char2.png",
    music: "../musics/Lily's Theme.mp3"
  },

  {
    id: 3,
    name: "詹姆·波特（James Potter）",
    desc: [
      "哈利父亲，纯血统巫师，格兰芬多学院。",
      "魁地奇天才（找球手）、成绩优异（魔药学除外）、擅长变形术。",
      "早期傲慢自负，爱捉弄斯内普，后期成熟勇敢。",
      "未注册的阿尼马格斯（化身为雄鹿，绰号“尖头叉子”）。"
    ],
    image: "../images/char3.png",
    music: "../musics/James and Lily.mp3"
  },

  {
    id: 4,
    name: "小天狼星·布莱克（Sirius Black）",
    desc: [
      "哈利教父，纯血统布莱克家族“逆子”，詹姆的挚友，格兰芬多学院。",
      "叛逆不羁、忠诚热情，厌恶家族纯血统理念。",
      "阿尼马格斯形态为大黑狗（绰号“大脚板”）。",
      "因与詹姆情同兄弟，被波特夫妇收留，视詹姆为真正的家人。"
    ],
    image: "../images/char4.png",
    music: "../musics/Sirius's Farewell.mp3"
  },

  {
    id: 5,
    name: "莱姆斯·卢平（Remus Lupin）",
    desc: [
      "狼人，因幼年被芬里尔·格雷伯克咬伤感染。格兰芬多学院。",
      "温和睿智，因狼人身份自卑。",
      "詹姆和小天狼星为陪伴他，自学阿尼马格斯（动物形态可安抚狼人）。",
      "绰号：“月亮脸”（因满月变身得名）。"
    ],
    image: "../images/char5.png",
    music: "../musics/A Window to the Past.mp3"
  },

  {
    id: 6,
    name: "小矮星·彼得（Peter Pettigrew）",
    desc: [
      "四人组中能力最弱、性格懦弱的成员，格兰芬多学院。",
      "崇拜詹姆和小天狼星，阿尼马格斯形态为老鼠（绰号“虫尾巴”）。",
      "毕业后成为凤凰社间谍，后因恐惧向伏地魔出卖波特夫妇，导致其遇害。"
    ],
    image: "../images/char6.png",
    music: "../musics/Betrayal of the Potters.mp3"
  },

  {
    id: 7,
    name: "卢修斯·马尔福（Lucius Malfoy）",
    desc: [
      "斯莱特林级长，出身纯血统家族，后成为食死徒。",
      "德拉科的父亲，精于权术与人脉经营。",
      "代表神圣二十八族的保守势力，信奉纯血统至上。"
    ],
    image: "../images/char7.png",
    music: "../musics/Lucius Malfoy.mp3"
  },

  {
    id: 8,
    name: "阿不思·邓布利多（Albus Dumbledore）",
    desc: [
      "霍格沃茨校长，智慧深邃，实力超群。",
      "知晓卢平狼人身份并默许掠夺者的阿尼马格斯计划以帮助他。",
      "与伏地魔长期对抗，波特夫妇及凤凰社的核心支柱。"
    ],
    image: "../images/char8.png",
    music: "../musics/Dumbledore's Farewell.mp3"
  },

  {
    id: 9,
    name: "米勒娃·麦格（Minerva McGonagall）",
    desc: [
      "格兰芬多院长，副校长，变形术教授。",
      "严厉公正，但认可詹姆在魁地奇上的非凡才能。",
      "秉持强烈正义感，是学生的坚实守护者。"
    ],
    image: "../images/char9.png",
    music: "../musics/Professor McGonagall.mp3"
  },

  {
    id: 10,
    name: "霍拉斯·斯拉格霍恩（Horace Slughorn）",
    desc: [
      "斯莱特林院长，魔药学教授。",
      "喜欢结交有才华和有前途的学生，开设“斯拉格俱乐部”。",
      "欣赏莉莉的魔药天赋与詹姆的魁地奇明星光环。"
    ],
    image: "../images/char10.png",
    music: "../musics/Slughorn's Confession.mp3"
  },

  {
    id: 11,
    name: "菲利乌斯·弗立维（Filius Flitwick）",
    desc: [
      "拉文克劳院长，魔咒学教授。",
      "魔咒大师，身材矮小却极具威严。",
      "擅长复杂的战斗咒语和防御魔法。"
    ],
    image: "../images/char11.png",
    music: "../musics/Flitwick's Charms.mp3"
  },

  {
    id: 12,
    name: "波莫娜·斯普劳特（Pomona Sprout）",
    desc: [
      "赫奇帕奇院长，草药学教授。",
      "擅长草药魔法，善良且极具耐心。",
      "在霍格沃茨之战中贡献巨大，运用草药对抗食死徒。"
    ],
    image: "../images/char12.png",
    music: "../musics/Sprout's Greenhouse.mp3"
  },

  {
    id: 13,
    name: "庞弗雷夫人（Madam Pomfrey）",
    desc: [
      "霍格沃茨校医，医术高超。",
      "常为受伤的学生治疗，包括卢平的变身后伤势。",
      "态度严厉但关怀学生，反复提醒他们注意安全。"
    ],
    image: "../images/char13.png",
    music: "../musics/Madam Pomfrey.mp3"
  },

  {
    id: 14,
    name: "阿格斯·费尔奇（Argus Filch）",
    desc: [
      "霍格沃茨管理员，哑炮。",
      "痛恨学生违反校规，常与掠夺者们持续对抗。",
      "多次搜查活点地图未果，心怀怨恨。"
    ],
    image: "../images/char14.png",
    music: "../musics/Filch's Theme.mp3"
  },

  {
    id: 15,
    name: "梅乐斯",
    desc: [
      "黑魔法防御术教授。",
      "著有《The Dark Forces: A Guide to Self-Protection》。",
      "强调防御魔法的重要性。"
    ],
    image: "../images/char15.png",
    music: "../musics/Dark Forces.mp3"
  },

  {
    id: 16,
    name: "埃弗里（Evan Avery）",
    desc: [
      "斯莱特林学生，纯血统巫师家族出身（神圣二十八族之一）。",
      "家境优越，常与卢修斯·马尔福等同辈交往。",
      "早期倾向食死徒阵营。"
    ],
    image: "../images/char16.png",
    music: "../musics/Death Eater Theme.mp3"
  },

  {
    id: 17,
    name: "穆尔塞伯（Mulciber）",
    desc: [
      "斯莱特林学生，擅长黑魔法。",
      "性格残忍，以发明和使用恶咒为乐。",
      "与斯内普等人同属黑魔法圈子。"
    ],
    image: "../images/char17.png",
    music: "../musics/Dark Curses.mp3"
  },
  {
    id: 18,
    name: "宾斯教授",
    desc: [
      "霍格沃茨魔法史教授，幽灵教师。",
      "常穿着褪色的教授长袍，在课堂上飘来飘去讲授冗长的魔法史。",
      "对学生的提问反应迟缓，因生前过于专注工作而忘记死亡，继续留校授课。"
    ],
    image: "../images/char18.png",
    music: "../musics/Dark Curses.mp3"
  }
  
];

// ...继续添加更多人物

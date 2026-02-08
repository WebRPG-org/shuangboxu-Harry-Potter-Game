// 所有结局列表
//introductions
const allCharacters = [
  { id: 1, name: "西弗勒斯·斯内普<br>（Severus Snape）", desc: "斯莱特林，精通黑魔法，后投靠邓布利多。" },

  { id: 2, name: "莉莉·伊万斯<br>（Lily Evans）", desc: "格兰芬多，魔药天才，詹姆之妻，哈利之母。" },

  { id: 3, name: "詹姆·波特<br>（James Potter）", desc: "格兰芬多，魁地奇高手，阿尼马格斯雄鹿。" },

  { id: 4, name: "小天狼星·布莱克<br>（Sirius Black）", desc: "格兰芬多，詹姆挚友，阿尼马格斯大黑狗。" },

  { id: 5, name: "莱姆斯·卢平<br>（Remus Lupin）", desc: "格兰芬多，狼人，温和睿智，外号“月亮脸”。" },

  { id: 6, name: "小矮星·彼得<br>（Peter Pettigrew）", desc: "格兰芬多，懦弱，阿尼马格斯老鼠，后背叛波特夫妇。" },

  { id: 7, name: "卢修斯·马尔福<br>（Lucius Malfoy）", desc: "斯莱特林级长，纯血统家族，后为食死徒。" },

  { id: 8, name: "阿不思·邓布利多<br>（Albus Dumbledore）", desc: "霍格沃茨校长，智慧强大，凤凰社领袖。" },

  { id: 9, name: "米勒娃·麦格<br>（Minerva McGonagall）", desc: "格兰芬多院长，严厉公正，变形术大师。" },

  { id: 10, name: "霍拉斯·斯拉格霍恩<br>（Horace Slughorn）", desc: "斯莱特林院长，魔药学教授，爱结交精英学生。" },

  { id: 11, name: "菲利乌斯·弗立维<br>（Filius Flitwick）", desc: "拉文克劳院长，魔咒大师，身材矮小却威严。" },

  { id: 12, name: "波莫娜·斯普劳特<br>（Pomona Sprout）", desc: "赫奇帕奇院长，草药学教授，善良耐心。" },

  { id: 13, name: "庞弗雷夫人<br>（Madam Pomfrey）", desc: "霍格沃茨校医，医术高超，关心学生安全。" },

  { id: 14, name: "阿格斯·费尔奇<br>（Argus Filch）", desc: "霍格沃茨管理员，哑炮，痛恨学生违规。" },

  { id: 15, name: "梅乐斯<br>（Professor Merrythought）", desc: "黑魔法防御术教授，著有《黑暗力量防身指南》。" },

  { id: 16, name: "埃弗里<br>（Evan Avery）", desc: "斯莱特林，纯血统家族，早期倾向食死徒。" },

  { id: 17, name: "穆尔塞伯<br>（Mulciber）", desc: "斯莱特林，擅长黑魔法，性格残忍。" },

  { id: 18, name: "宾斯教授<br>（Professor Binns）", desc: "魔法史教授，幽灵教师，授课冗长乏味。" }
];


// 解锁人物
function unlockCountCharacter(id, countKey = null, requiredTimes = 1, redirectUrl = null) {
  let currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return;

  let characters = JSON.parse(localStorage.getItem("characters") || "{}");
  if (!characters[currentUser]) characters[currentUser] = [];

  if (countKey) {
    // 多次计数逻辑
    let counts = JSON.parse(localStorage.getItem("characterCounts") || "{}");
    if (!counts[currentUser]) counts[currentUser] = {};

    counts[currentUser][countKey] = (counts[currentUser][countKey] || 0) + 1;
    localStorage.setItem("characterCounts", JSON.stringify(counts));

    if (counts[currentUser][countKey] >= requiredTimes && !characters[currentUser].includes(id)) {
      characters[currentUser].push(id);
      localStorage.setItem("characters", JSON.stringify(characters));

      let char = allCharacters.find(c => c.id === id);
      if (char) alert(`👤 已解锁人物：${char.name}\n${char.desc}`);
    }
  } else {
    // 单次解锁逻辑
    if (!characters[currentUser].includes(id)) {
      characters[currentUser].push(id);
      localStorage.setItem("characters", JSON.stringify(characters));

      // let char = allCharacters.find(c => c.id === id);
      // if (char) alert(`👤 已解锁人物：${char.name}\n${char.desc}`);
    }
  }

  if (redirectUrl) window.location.href = redirectUrl;
}

// 获取用户已解锁人物
function getUserCharacters() {
  let currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return [];

  let characters = JSON.parse(localStorage.getItem("characters") || "{}");
  return characters[currentUser] || [];
}

// 判断用户是否已解锁某人物
function hasCharacter(id) {
  return getUserCharacters().includes(id);
}

// 给 unlockCountCharacter 起一个别名
function unlockCharacter(id, redirectUrl) {
  unlockCountCharacter(id, null, 1, redirectUrl);
}


// <!-- 一次性解锁人物 -->
// <a href="javascript:void(0);" class="btn primary"
//    onclick="unlockCharacter(3, 'page.html')">解锁人物</a>

// <!-- 多次计数解锁人物，比如累计完成3次任务解锁 -->
// <button onclick="unlockCountCharacter(6, 'taskTimes', 3, 'index1.html')">
//   完成任务
// </button>

// 所有成就列表
const allAchievements = [
  { id: 1, name: "初来乍到", desc: "完成第一次登录" },
  { id: 2, name: "坚持不懈", desc: "解锁全部结局" },
  { id: 3, name: "魔法起源初探", desc: "进入背景页面" },
  { id: 4, name: "探索者", desc: "进入游戏页面" },
  { id: 5, name: "黑魔法对决", desc: "成功战胜伏地魔" },
  { id: 6, name: "意外邂逅彩蛋小游戏", desc: "玩过一次彩蛋中的小游戏" },
  { id: 7, name: "彩蛋秘玩三得手", desc: "小游戏成功3次" },
  { id: 8, name: "喷泉跃阶", desc: "喷泉成就达到不同等级" },
  



];

// 解锁成就
function unlockCountAchievement(id, countKey = null, requiredTimes = 1, redirectUrl = null) {
  let currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return;

  let achievements = JSON.parse(localStorage.getItem("achievements") || "{}");
  if (!achievements[currentUser]) achievements[currentUser] = [];

  if (countKey) {
    // 多次计数逻辑
    let counts = JSON.parse(localStorage.getItem("achievementCounts") || "{}");
    if (!counts[currentUser]) counts[currentUser] = {};

    counts[currentUser][countKey] = (counts[currentUser][countKey] || 0) + 1;
    localStorage.setItem("achievementCounts", JSON.stringify(counts));

    if (counts[currentUser][countKey] >= requiredTimes && !achievements[currentUser].includes(id)) {
      achievements[currentUser].push(id);
      localStorage.setItem("achievements", JSON.stringify(achievements));

      let ach = allAchievements.find(a => a.id === id);
      if (ach) alert(`🎉 已解锁成就：${ach.name}\n${ach.desc}`);
    }
  } else {
    // 单次解锁逻辑
    if (!achievements[currentUser].includes(id)) {
      achievements[currentUser].push(id);
      localStorage.setItem("achievements", JSON.stringify(achievements));

      let ach = allAchievements.find(a => a.id === id);
      if (ach) alert(`🎉 已解锁成就：${ach.name}\n${ach.desc}`);
    }
  }

  if (redirectUrl) window.location.href = redirectUrl;
}


// 获取用户已解锁成就
function getUserAchievements() {
  let currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return [];

  let achievements = JSON.parse(localStorage.getItem("achievements") || "{}");
  return achievements[currentUser] || [];
}

// 判断用户是否已解锁某成就
function hasAchievement(id) {
  return getUserAchievements().includes(id);
}
//给 unlockCountAchievement 起一个别名
function unlockAchievement(id, redirectUrl) {
  unlockCountAchievement(id, null, 1, redirectUrl);
}




// 使用方法示例：
//
// 一次性解锁成就（适合进入某个页面、首次触发等场景）
// unlockAchievement(成就ID, 跳转页面URL)
//
// 例子：进入主线剧情时解锁一次性成就
// <a href="javascript:void(0);" class="btn primary"
//    onclick="unlockAchievement(3, 'page.html')">进入</a>
//
//
// 多次计数解锁成就（适合累计次数，如累计登录、通关多次等）
// unlockCountAchievement(成就ID, 计数key, 需要次数, 跳转页面URL)
//
// 例子：玩小游戏累计3次后解锁成就
// <button onclick="unlockCountAchievement(6, 'completeTimes', 3, 'index1.html')">
//   更多游戏
// </button>

// 千万记住：  <script src="../achievements.js"></script>

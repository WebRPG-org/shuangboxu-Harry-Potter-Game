

// 所有结局列表
const allEndings = [
  { id: 1, name: "结局1", desc: "黑暗中一道光闪过，倒下的身影久久没有动静。有人赶来，局势骤然转向，尘埃落定时，一切都已不同。" },
  { id: 2, name: "结局2", desc: "怒火与咒语交织，直到权威的身影出现才得以停息。代价却早已写下，留下的沉默比责罚更沉重。" },
  { id: 3, name: "结局3", desc: "雄心未能成形，反而换来一连串失分与训斥。那段时间里，光亮似乎远离，信任与感情也一同消散。" },
  { id: 4, name: "结局4", desc: "秘密终究没能守住，风声一出，矛盾便如野火般蔓延。结果，是失落、惩戒，还有被夺走的珍贵之物。" },
  { id: 5, name: "结局5", desc: "历经磨砺，你们明白了自身的局限。可正因如此，新的道路被指向，新的盟约悄然缔结，一盏更大的火焰被点燃。" },
  { id: 6, name: "隐藏结局", desc: "你选择了逃避，没有去面对小游戏的考验。莉莉的眼神渐渐黯淡，她失望地摇了摇头。那一刻，你们之间的距离彻底拉开，关系也在沉默中画上了句点。" }
];

// --- 辅助：检查并在全部结局解锁时触发成就2 ---
function checkAllEndingsUnlocked(currentUser) {
  if (!currentUser) return;
  const endingsStore = JSON.parse(localStorage.getItem("endings") || "{}");
  const userEndings = endingsStore[currentUser] || [];
  const uniqueCount = new Set(userEndings).size;

  if (uniqueCount >= allEndings.length) {
    // 如果 unlockAchievement 可用则触发（不带跳转）
    if (typeof unlockAchievement === 'function') {
      try {
        unlockAchievement(2); // 自动解锁成就ID=2
      } catch (e) {
        // 若发生异常，不中断流程
        console.warn("自动解锁成就时出错：", e);
      }
    } else if (window && typeof window.unlockAchievement === 'function') {
      try {
        window.unlockAchievement(2);
      } catch (e) {
        console.warn("自动解锁成就时出错：", e);
      }
    } else {
      // 如果没有载入 achievements.js，可以选择在这里记录一个标记，待脚本后续加载时触发（可选）
      // localStorage.setItem("pendingUnlockAchievement2", "1");
    }
  }
}

// --- 解锁结局 ---
function unlockCountEnding(id, countKey = null, requiredTimes = 1, redirectUrl = null) {
  let currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return;

  let endings = JSON.parse(localStorage.getItem("endings") || "{}");
  if (!endings[currentUser]) endings[currentUser] = [];

  if (countKey) {
    // 多次计数逻辑
    let counts = JSON.parse(localStorage.getItem("endingCounts") || "{}");
    if (!counts[currentUser]) counts[currentUser] = {};

    counts[currentUser][countKey] = (counts[currentUser][countKey] || 0) + 1;
    localStorage.setItem("endingCounts", JSON.stringify(counts));

    if (counts[currentUser][countKey] >= requiredTimes && !endings[currentUser].includes(id)) {
      endings[currentUser].push(id);
      localStorage.setItem("endings", JSON.stringify(endings));

      let end = allEndings.find(e => e.id === id);
      if (end) alert(`🎬 已解锁结局：${end.name}\n${end.desc}`);

      // 检查是否全部结局已解锁，若是则自动解锁成就2
      checkAllEndingsUnlocked(currentUser);
    }
  } else {
    // 单次解锁逻辑
    if (!endings[currentUser].includes(id)) {
      endings[currentUser].push(id);
      localStorage.setItem("endings", JSON.stringify(endings));

      let end = allEndings.find(e => e.id === id);
      if (end) alert(`🎬 已解锁结局：${end.name}\n${end.desc}`);

      // 检查是否全部结局已解锁，若是则自动解锁成就2
      checkAllEndingsUnlocked(currentUser);
    }
  }

  if (redirectUrl) window.location.href = redirectUrl;
}

// 获取用户已解锁结局
function getUserEndings() {
  let currentUser = localStorage.getItem("currentUser");
  if (!currentUser) return [];

  let endings = JSON.parse(localStorage.getItem("endings") || "{}");
  return endings[currentUser] || [];
}

// 判断用户是否已解锁某结局
function hasEnding(id) {
  return getUserEndings().includes(id);
}

// 给 unlockCountEnding 起一个别名
function unlockEnding(id, redirectUrl) {
  unlockCountEnding(id, null, 1, redirectUrl);
}

// 页面脚本加载时再检查一次（覆盖已存在的本地存储状态）
(function initCheck() {
  let currentUser = localStorage.getItem("currentUser");
  if (currentUser) checkAllEndingsUnlocked(currentUser);
})();



// 使用方法示例：
//
// 一次性解锁结局（适合进入某个页面、首次触发等场景）
// unlockEnding(结局ID, 跳转页面URL)
//
// 例子：进入主线剧情时解锁一次性结局
// <a href="javascript:void(0);" class="btn primary"
//    onclick="unlockEnding(3, 'page.html')">进入</a>
//
//
// 多次计数解锁结局（适合累计次数，如累计登录、通关多次等）
// unlockCountEnding(结局ID, 计数key, 需要次数, 跳转页面URL)
//
// 例子：玩小游戏累计3次后解锁结局
// <button onclick="unlockCountEnding(6, 'completeTimes', 3, 'index1.html')">
//   更多游戏
// </button>

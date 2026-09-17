/*:
 * @target MZ
 * @plugindesc 插入小游戏（躲避.html），成功后回到当前点位继续游戏（关闭窗口也算失败）
 * @command StartMiniGame
 * @text 开始小游戏
 * @desc 打开小游戏窗口，成功则继续剧情，失败或直接关闭则给选择
 */

(() => {
  PluginManager.registerCommand("MiniGame", "StartMiniGame", () => {
    // 打开小游戏窗口
    const gameWindow = window.open("../小游戏/躲避.html", "MiniGame", "width=800,height=600");

    let resultReceived = false; // 标记是否收到小游戏结果

    // 监听小游戏返回结果
    function handler(e) {
      if (!e.data || e.data.type !== "MiniGameResult") return;
      resultReceived = true;

      if (e.data.success) {
        // 成功 -> 显示信息并继续游戏
        $gameMessage.add("✅ 成功冲出太阳！");
      } else {
        // 失败 -> 给玩家选择
        $gameMessage.add("❌ 被太阳淹没了！");
        $gameMessage.add("要重新挑战吗？");
        $gameMessage.setChoices(["重新开始", "不干了", "我尽力了"], 0, -1);
        $gameMessage.setChoiceCallback((n) => {
          if (n === 0) {
            // 重新开始小游戏
            PluginManager.callCommand(this, "MiniGame", "StartMiniGame", {});
          } else if (n === 1) {
            // 不干了 -> 跳转到 fail7
            window.location.href = "../失败/fail7.html";
          } else {
            // 我尽力了 -> 继续剧情
            $gameMessage.add("👍 你已经尽力了，继续前进吧！");
          }
        });
      }
      window.removeEventListener("message", handler);
    }
    window.addEventListener("message", handler);

    // 定时检测是否直接关闭了小游戏窗口
    const checkInterval = setInterval(() => {
      if (gameWindow.closed) {
        clearInterval(checkInterval);
        if (!resultReceived) {
          // 没有玩游戏就关闭 -> 当作失败
          $gameMessage.add("⚠️ 你没有完成小游戏！");
          $gameMessage.add("要重新挑战吗？");
          $gameMessage.setChoices(["重新开始", "不干了", "我尽力了"], 0, -1);
          $gameMessage.setChoiceCallback((n) => {
            if (n === 0) {
              PluginManager.callCommand(this, "MiniGame", "StartMiniGame", {});
            } else if (n === 1) {
              window.location.href = "../失败/fail7.html";
            } else {
              $gameMessage.add("👍 你已经尽力了，继续前进吧！");
            }
          });
        }
      }
    }, 500);
  });
})();

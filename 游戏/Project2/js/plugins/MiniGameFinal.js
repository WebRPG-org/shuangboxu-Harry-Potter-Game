/*:
 * @target MZ
 * @plugindesc 插入最终 Boss 小游戏（bossfinal.html），成功后回到当前点位继续游戏（关闭窗口也算失败）
 * @command StartMiniGameFinal
 * @text 最终 Boss 战小游戏
 * @desc 打开最终 Boss 战小游戏窗口，成功则继续剧情，失败或直接关闭则给选择
 */

(() => {
  PluginManager.registerCommand("MiniGameFinal", "StartMiniGameFinal", () => {
    // 打开最终 Boss 战小游戏窗口
    const gameWindow = window.open("../小游戏/bossfinal.html", "MiniGameFinal", "width=800,height=600");

    let resultReceived = false; // 标记是否收到小游戏结果

    // 监听小游戏返回结果
    function handler(e) {
      if (!e.data || e.data.type !== "MiniGameResult") return;
      resultReceived = true;

      if (e.data.success) {
        // 成功 -> 显示信息并继续游戏
        $gameMessage.add("🏆 你击败了最终 Boss！胜利属于你！");
      } else {
        // 失败 -> 只显示“不干了”，但不跳转
        $gameMessage.add("💀 最终 Boss 战斗失败了！");
        $gameMessage.setChoices(["不干了"], 0, -1);
        $gameMessage.setChoiceCallback((n) => {
          // 点击“不干了” -> 什么都不做，继续游戏
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
          // 没有玩游戏就关闭 -> 当作失败（给两个选项）
          $gameMessage.add("⚠️ 你没有完成最终 Boss 战斗！");
          $gameMessage.setChoices(["重新开始", "不干了"], 0, -1);
          $gameMessage.setChoiceCallback((n) => {
            if (n === 0) {
              // 重新开始小游戏
              PluginManager.callCommand(this, "MiniGameFinal", "StartMiniGameFinal", {});
            } else if (n === 1) {
              // 不干了 -> 这里也不跳转，继续游戏
            }
          });
        }
      }
    }, 500);
  });
})();

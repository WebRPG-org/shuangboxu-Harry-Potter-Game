/*:
 * @target MZ
 * @plugindesc 插入小游戏（许愿.html），没有输赢，作为彩蛋
 * @command StartMiniGame6
 * @text 许愿彩蛋小游戏
 * @desc 打开许愿小游戏窗口（全屏/新标签页），无论如何都会继续剧情
 */

(() => {
  PluginManager.registerCommand("MiniGame6", "StartMiniGame6", () => {
    // 在新标签页打开（全屏）
    const gameWindow = window.open("../小游戏/许愿.html", "_blank");

    // 监听小游戏返回结果（如果有传回信息）
    function handler(e) {
      if (!e.data || e.data.type !== "MiniGameResult") return;

      if (e.data.success) {
        $gameMessage.add("✨ 你许下了一个美好的愿望……");
      } else {
        $gameMessage.add("✨ 即使没有完成，你的心意也已传达……");
      }

      window.removeEventListener("message", handler);
    }
    window.addEventListener("message", handler);

    // 如果玩家直接关闭窗口，也继续剧情
    const checkInterval = setInterval(() => {
      if (gameWindow.closed) {
        clearInterval(checkInterval);
        $gameMessage.add("🌠 愿望随风而去，旅程仍要继续……");
      }
    }, 500);
  });
})();

//=============================================================================
// CustomTitleMenu.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 自定义标题界面菜单，添加“成就”和“结局”按钮，跳转外部网页。
 * @author 双博
 *
 * @param AchievementsURL
 * @text 成就页面地址
 * @desc 点击“成就”按钮时跳转的网页URL
 * @default achievements.html
 *
 * @param EndingsURL
 * @text 结局页面地址
 * @desc 点击“结局”按钮时跳转的网页URL
 * @default endings.html
 *
 * @help
 * 使用方法：
 * 1. 将本插件放入 js/plugins 文件夹并在插件管理器中启用。
 * 2. 配置插件参数，填写“成就”和“结局”的网页地址。
 * 3. 启动游戏时，标题界面会显示：
 *    - 重新开始
 *    - 继续游戏
 *    - 成就（跳转到设置的网页）
 *    - 结局（跳转到设置的网页）
 *
 * 注意：跳转时会在新窗口/标签页打开外部网页。
 */

(() => {
  const pluginName = "CustomTitleMenu";
  const parameters = PluginManager.parameters(pluginName);
  const achievementsUrl = String(parameters["AchievementsURL"] || "../成就系统/成就.html");
  const endingsUrl = String(parameters["EndingsURL"] || "../结局系统/结局.html");

  // 重写标题命令
  const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
  Window_TitleCommand.prototype.makeCommandList = function() {
    this.addCommand("开始新游戏", "newGame");
    this.addCommand("读取存档", "continue", this.isContinueEnabled());
    this.addCommand("成就", "achievements");
    this.addCommand("结局", "endings");
    this.addCommand("设置", "options");
  };

  // 处理新命令
  const _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
  Scene_Title.prototype.createCommandWindow = function() {
    _Scene_Title_createCommandWindow.call(this);
    this._commandWindow.setHandler("achievements", this.commandAchievements.bind(this));
    this._commandWindow.setHandler("endings", this.commandEndings.bind(this));
  };

Scene_Title.prototype.commandAchievements = function() {
  window.location.href = "../成就系统/成就.html?from=game";
};

Scene_Title.prototype.commandEndings = function() {
  window.location.href = "../结局系统/结局.html?from=game";
};

})();

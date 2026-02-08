/*:
 * @target MZ
 * @plugindesc 自动存档并跳转到外部网页（防止读档后再次跳转） 
 * @author ChatGPT
 *
 * @param TargetURL
 * @text 跳转目标网页
 * @desc 存档后要跳转到的网页地址
 * @default ../失败/fail1.html
 *
 * @command SaveAndJump
 * @text 存档并跳转
 * @desc 自动存档并跳转到指定网页
 */

(() => {
    const pluginName = "AutoSaveAndJump";

    PluginManager.registerCommand(pluginName, "SaveAndJump", args => {
        const targetUrl = PluginManager.parameters(pluginName)["TargetURL"] || "../失败/fail1.html";

        // 存档前清除事件执行状态，避免读档后再次触发
        $gameTemp.reserveCommonEvent(0);

        $gameSystem.onBeforeSave();
        DataManager.saveGame(1).then(() => {
            console.log("存档完成，跳转到网页:", targetUrl);
            window.location.href = targetUrl;
        }).catch(() => {
            console.error("存档失败");
        });
    });
})();

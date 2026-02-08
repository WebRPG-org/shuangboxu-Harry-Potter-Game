/*:
 * @target MZ
 * @plugindesc 快速存档/读档插件（支持指定存档槽）
 * @command QuickSave
 * @text 快速存档
 * @desc 自动保存游戏到指定存档槽
 *
 * @arg slot
 * @type number
 * @min 1
 * @default 1
 * @text 存档槽编号
 * @desc 存档到第几个槽位（1 = 第1个）
 *
 * @command QuickLoad
 * @text 快速读档
 * @desc 自动读取指定存档槽
 *
 * @arg slot
 * @type number
 * @min 1
 * @default 1
 * @text 存档槽编号
 * @desc 读取第几个存档槽（1 = 第1个）
 *
 * @help
 * 【QuickSaveLoad.js】
 *
 * 在事件中使用“插件命令”：
 *   - QuickSave → 存档到某个槽
 *   - QuickLoad → 从某个槽读取
 *
 * 例子：
 *   存档：存到第1个槽
 *   读档：读取第1个槽
 *
 * 注意事项：
 *   - 读档会立即切换场景，不会弹出确认框。
 *   - 请确保该槽位已有存档，否则会报错。
 */

PluginManager.registerCommand("QuickSaveLoad", "QuickSave", args => {
    const slot = args && args.slot ? Number(args.slot) : 1;
    DataManager.saveGame(slot).then(() => {
        console.log(`游戏已存档到槽 ${slot}`);
    }).catch(() => {
        console.error(`存档失败（槽 ${slot}）`);
    });
});

PluginManager.registerCommand("QuickSaveLoad", "QuickLoad", args => {
    const slot = args && args.slot ? Number(args.slot) : 1;
    DataManager.loadGame(slot).then(() => {
        console.log(`成功读取存档（槽 ${slot}）`);
        Scene_Load.prototype.reloadMapIfUpdated.call(SceneManager._scene);
        SceneManager.goto(Scene_Map);
    }).catch(() => {
        console.error(`读取失败（槽 ${slot} 可能没有存档）`);
    });
});

// 进入游戏时，检测 URL 参数是否需要自动读档
(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loadSlot = urlParams.get("load");
    if (loadSlot) {
        const slot = Number(loadSlot);
        DataManager.loadGame(slot).then(() => {
            console.log(`通过URL参数读取存档槽 ${slot}`);
            Scene_Load.prototype.reloadMapIfUpdated.call(SceneManager._scene);
            SceneManager.goto(Scene_Map);
        }).catch(() => {
            console.error(`存档槽 ${slot} 不存在，无法读取`);
        });
    }
})();

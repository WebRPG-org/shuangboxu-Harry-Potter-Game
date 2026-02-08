/*:
 * @target MZ
 * @plugindesc (v1.1) 自动将存档写入指定槽并设置 CGMZ_SaveFile 显示名称。提供插件指令：AutoSave, RenameSlot, AutosaveName。
 * @author ChatGPT
 *
 * @command AutoSave
 * @text AutoSave
 * @desc 将当前游戏保存到指定槽，并把 CGMZ_SaveFile 显示名设置为 title（0 为 autosave）。
 * @arg slot
 * @type number
 * @min 0
 * @default 1
 * @text 槽号
 * @desc 存档槽，0 为自动存档
 * @arg title
 * @type string
 * @text 显示名称
 * @desc 要设置的显示名称
 *
 * @command RenameSlot
 * @text RenameSlot
 * @desc 仅修改 DataManager._globalInfo[slot].cgmz_savefileName（即时显示），可选择是否持久化。
 * @arg slot
 * @type number
 * @min 0
 * @default 1
 * @text 槽号
 * @arg title
 * @type string
 * @text 显示名称
 * @arg persist
 * @type boolean
 * @text 是否持久化
 * @default true
 *
 * @command AutosaveName
 * @text AutosaveName
 * @desc 修改 autosave（slot 0）的显示名并保存。
 * @arg title
 * @type string
 * @text 显示名称
 *
 * @help
 * -----------------------------------------------------------------------------
 * 功能：
 *  - AutoSave <slot> <title>
 *      将当前游戏保存到指定槽（slot，0 为 autosave），并把 CGMZ_SaveFile 显示名设置为 title。
 *  - RenameSlot <slot> <title> <persist>
 *      仅修改 DataManager._globalInfo[slot].cgmz_savefileName（即时显示），persist=true 时同时把 global info 持久化到磁盘。
 *  - AutosaveName <title>
 *      修改 autosave（slot 0）的显示名并保存 autosave（相当于 AutoSave 0 "title"）。
 *
 * 使用说明（插件指令示例）：
 *  在 RPG Maker MZ 的插件指令面板中：
 *    - 指令：AutoSave
 *      参数：slot = 3
 *      参数：title = 序章 · 初遇
 *    - 指令：RenameSlot
 *      参数：slot = 5
 *      参数：title = 存档点：密林营地
 *      参数：persist = true
 *    - 指令：AutosaveName
 *      参数：title = 自动存档 · 进度A
 *
 * 注意：
 *  - 该插件依赖 RPG Maker MZ 的 DataManager、$gameSystem、CGMZ_SaveFile（插件只需要存在即可）。
 *  - 若要持久化显示名，请使用 AutoSave 或 RenameSlot 并将 persist 设为 true；仅使用 RenameSlot 且 persist=false 不会持久化到本地文件（重启后会丢失，除非手动保存）。
 *  - 若使用 autosave（slot 0），请注意 CGMZ_SaveFile 在读取 autosave 名称时会检查 DataManager._globalInfo[0]。
 *  - 推荐把本插件放在 CGMZ_SaveFile 之后（插件管理器中），以确保兼容。
 *
 * 安装步骤：
 * 1. 将本文件命名为 AutoSaveSlotWithTitle.js 并放入你的项目目录的 js/plugins 文件夹内。
 * 2. 打开 RPG Maker MZ，进入 插件 管理，启用 AutoSaveSlotWithTitle 插件（确保顺序在 CGMZ_SaveFile 之后）。
 * 3. 在 插件指令 面板里应能看到 AutoSave、RenameSlot、AutosaveName 三个指令。
 *
 * 常见问题：
 * - 如果插件启用但“插件指令”面板没有显示这些指令：
 *   1) 确认文件名（不含扩展名）是 AutoSaveSlotWithTitle 并与插件内部声明一致；
 *   2) 确认插件头部包含 @command/@arg（本文件已包含）；
 *   3) 重启 RPG Maker 编辑器（有时需要重启才会刷新指令列表）；
 *   4) 检查控制台（F8）是否有错误输出，可能是其它插件冲突或语法错误导致插件加载失败。
 *
 * 版权：免费，随意使用，保留作者信息（ChatGPT）
 * -----------------------------------------------------------------------------
 */

(() => {
  const PLUGIN_NAME = 'AutoSaveSlotWithTitle';

  // Helper: ensure globalInfo exists and is long enough
  function _ensureGlobalInfoLength(slot) {
    if (!DataManager._globalInfo) DataManager._globalInfo = [];
    while (DataManager._globalInfo.length <= slot) {
      DataManager._globalInfo.push(null);
    }
    if (!DataManager._globalInfo[slot]) DataManager._globalInfo[slot] = {};
  }

  // Core: set name into DataManager._globalInfo[slot]
  function setGlobalSaveName(slot, title) {
    slot = Number(slot) || 0;
    title = title == null ? '' : String(title);
    _ensureGlobalInfoLength(slot);
    DataManager._globalInfo[slot].cgmz_savefileName = title;
  }

  // Public: rename slot in memory, optionally persist global info file
  function renameSlot(slot, title, persistGlobalInfo = false) {
    setGlobalSaveName(slot, title);
    if (persistGlobalInfo) {
      try {
        DataManager.saveGlobalInfo(DataManager._globalInfo);
      } catch (e) {
        console.warn(PLUGIN_NAME + ': saveGlobalInfo failed', e);
      }
    }
  }

  // Public: set slot name and immediately save that slot
  function setSaveSlotNameThenSave(slot, title) {
    slot = Number(slot);
    if (isNaN(slot) || slot < 0) {
      console.warn(PLUGIN_NAME + ': invalid slot', slot);
      return;
    }

    // Ensure savefile info exists and set name
    setGlobalSaveName(slot, title);

    // Set $gameSystem._savefileId so that CGMZ's getSaveFileFilename which reads
    // $gameSystem.savefileId() will find the correct id when makeSavefileInfo runs.
    if ($gameSystem) {
      try {
        $gameSystem._savefileId = slot;
      } catch (e) {
        // ignore
      }
    }

    // Now call DataManager.saveGame to persist the actual save
    try {
      const result = DataManager.saveGame(slot);
      if (result && result.then) {
        result.then(() => {
          console.log(PLUGIN_NAME + ': saved slot', slot, 'with title', title);
        }).catch(err => {
          console.error(PLUGIN_NAME + ': saveGame failed for slot', slot, err);
        });
      } else {
        console.log(PLUGIN_NAME + ': triggered saveGame for slot', slot);
      }
    } catch (e) {
      console.error(PLUGIN_NAME + ': saveGame threw for slot', slot, e);
    }
  }

  // Public: set autosave name and save autosave (slot 0)
  function setAutosaveName(title) {
    setSaveSlotNameThenSave(0, title);
  }

  // Expose to global for script calls
  window.AutoSaveSlotWithTitle = window.AutoSaveSlotWithTitle || {};
  window.AutoSaveSlotWithTitle.renameSlot = renameSlot;
  window.AutoSaveSlotWithTitle.setSaveSlotNameThenSave = setSaveSlotNameThenSave;
  window.AutoSaveSlotWithTitle.setAutosaveName = setAutosaveName;

  // --- Plugin Commands (RPG Maker MZ) ---
  if (typeof PluginManager.registerCommand === 'function') {
    PluginManager.registerCommand(PLUGIN_NAME, 'AutoSave', args => {
      const slot = Number(args.slot || 0);
      const title = args.title || '';
      setSaveSlotNameThenSave(slot, title);
    });

    PluginManager.registerCommand(PLUGIN_NAME, 'RenameSlot', args => {
      const slot = Number(args.slot || 0);
      const title = args.title || '';
      const persist = (args.persist === undefined) ? true : (args.persist === 'true' || args.persist === true);
      renameSlot(slot, title, persist);
      console.log(PLUGIN_NAME + ': renamed slot', slot, 'to', title, 'persist=', persist);
    });

    PluginManager.registerCommand(PLUGIN_NAME, 'AutosaveName', args => {
      const title = args.title || '';
      setAutosaveName(title);
    });
  }

})();

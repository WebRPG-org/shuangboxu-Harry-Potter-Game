/*:
 * @target MZ
 * @plugindesc (v1.1) 强行插队显示操作提示 — 按 M 会立即清空当前消息并显示预设帮助文本（可开关）。作者: ChatGPT
 *
 * @help
 * 功能说明：
 * - 全局生效，按 M 时会强行插队：清空当前消息队列并立刻显示帮助文本（逐行）。
 * - 为避免短时间刷屏仍然保留去抖（默认 200ms）。
 * - 强行插队可能会中断事件对话与选项，请谨慎使用。
 *
 * 可用脚本（控制台/事件脚本）：
 *   // 关闭强行插队（恢复“消息忙时跳过”的默认行为）
 *   $rmmzHint.setForceMode(false);
 *
 *   // 开启强行插队（默认开启）
 *   $rmmzHint.setForceMode(true);
 *
 *   // 修改帮助文本（数组）
 *   $rmmzHint.setHelpLines(["行1","行2",...]);
 *
 *   // 手动触发（仅在地图场景有效）
 *   $rmmzHint.showNowIfMap();
 *
 * 警告：强行插队会调用 $gameMessage.clear() 并尝试关闭消息窗口，可能导致事件对话中断或相关逻辑异常。
 */

(() => {
  const scriptSrc = document.currentScript && document.currentScript.src ? document.currentScript.src : "";
  const pluginName = scriptSrc ? scriptSrc.split("/").pop().replace(/\.js$/, "") : "MapHintForceM";

  // 默认帮助文本（每行为一条消息）
  let HELP_LINES = [
    // "操作说明：",
    "移动：方向键 ↑ ↓ ← → 或 WASD; 疾跑：按住 Shift",
    "交互：回车 / 空格（与NPC对话、调查等）",
    "确认：回车 / Z",
    // "菜单：Esc / X",
    // "疾跑：按住 Shift",
    // "切换全屏：Alt + Enter",
    // "（按 M 随时查看 — 强行插队模式）"
  ];

  // 是否启用强行插队（默认开启）
  let FORCE_MODE = true;

  // 去抖（毫秒）
  const TRIGGER_DEBOUNCE_MS = 200;
  window._rmmz_hint_last_time = window._rmmz_hint_last_time || 0;

  // 对外 API
  window.$rmmzHint = window.$rmmzHint || {};

  window.$rmmzHint.setHelpLines = function(arr) {
    if (Array.isArray(arr)) {
      HELP_LINES = arr.map(a => String(a));
      console.log(`[${pluginName}] HELP_LINES 已更新，行数：${HELP_LINES.length}`);
    } else {
      console.warn(`[${pluginName}] setHelpLines 需要传入数组`);
    }
  };
  window.$rmmzHint.getHelpLines = function() {
    return HELP_LINES.slice();
  };

  window.$rmmzHint.setForceMode = function(flag) {
    FORCE_MODE = !!flag;
    console.log(`[${pluginName}] FORCE_MODE = ${FORCE_MODE}`);
  };
  window.$rmmzHint.getForceMode = function() {
    return FORCE_MODE;
  };

  window.$rmmzHint.showNowIfMap = function() {
    if (SceneManager._scene instanceof Scene_Map) {
      tryShowHelpForCurrentMap();
    }
  };

  // 强行清除当前消息与关闭消息窗口（尝试兼容不同 MZ 版本）
  function forceClearMessagesAndCloseWindow() {
    try {
      if ($gameMessage && typeof $gameMessage.clear === "function") {
        $gameMessage.clear();
      }
      const scene = SceneManager._scene;
      if (scene && scene._messageWindow) {
        try {
          // 强制关闭消息窗口（若存在）
          if (typeof scene._messageWindow.close === "function") {
            scene._messageWindow.close();
          }
          // 另外尝试复位窗口内部状态（兼容性尝试）
          if (scene._messageWindow._closing !== undefined) scene._messageWindow._closing = false;
          if (scene._messageWindow._opening !== undefined) scene._messageWindow._opening = false;
        } catch (e2) {
          // 忽略窗口关闭错误
        }
      }
    } catch (e) {
      // 忽略清空错误
    }
  }

  // 显示帮助（可强行插队）
  function tryShowHelpForCurrentMap() {
    try {
      if (!(SceneManager._scene instanceof Scene_Map)) return;
      if (!$gameMap || !$gameSystem) return;

      const now = Date.now();
      if (now - window._rmmz_hint_last_time < TRIGGER_DEBOUNCE_MS) return;
      window._rmmz_hint_last_time = now;

      // 如果消息系统忙且没有开启强行插队，则跳过
      if ($gameMessage && typeof $gameMessage.isBusy === "function" && $gameMessage.isBusy() && !FORCE_MODE) {
        return;
      }

      // 若强行插队，先尝试清空当前消息队列并关闭消息窗口（会中断当前对话）
      if (FORCE_MODE) {
        forceClearMessagesAndCloseWindow();
      } else {
        // 非强行插队模式且消息忙，已在上面返回
      }

      // 添加帮助文本为消息（逐行）
      for (let i = 0; i < HELP_LINES.length; i++) {
        $gameMessage.add(HELP_LINES[i]);
      }

      // 启动消息窗口（兼容不同 MZ 版本）
      const scene = SceneManager._scene;
      if (scene && scene._messageWindow && typeof scene._messageWindow.startMessage === "function") {
        scene._messageWindow.startMessage();
      } else if (scene && typeof scene.startMessage === "function") {
        scene.startMessage();
      }

      console.log(`[${pluginName}] 在地图 ${$gameMap.mapId()} 显示操作说明（强行插队=${FORCE_MODE}）`);
    } catch (e) {
      console.error(`[${pluginName}] 显示帮助时出错：`, e);
    }
  }

  // 原生键盘监听（只处理字母 M）
  if (!window._rmmz_hint_native_listener_added) {
    window._rmmz_hint_native_listener_added = true;
    window.addEventListener("keydown", function(ev) {
      try {
        if (!(SceneManager._scene instanceof Scene_Map)) return;
        const k = (ev.key || "").toString().slice(0, 1).toUpperCase();
        if (k === "M") {
          tryShowHelpForCurrentMap();
        }
      } catch (e) {
        // 忽略异常
      }
    }, false);
    console.log(`[${pluginName}] 已添加 M 键监听（强行插队模式默认 ${FORCE_MODE}）`);
  }

})();

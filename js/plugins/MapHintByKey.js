/*:
 * @target MZ
 * @plugindesc (v1.4) 按键唤醒地图多提示 — 每个地图可配置多个按键对应不同提示。作者: ChatGPT
 *
 * @help
 * 用法示例（事件的“插入脚本”里）：
 *   // 在当前地图上添加/更新按键提示（按 G 显示）
 *   $rmmzHint.setCurrentMapHint("去城东跟老王对话。", "G");
 *
 *   // 在当前地图上再添加一个按键 H 的提示（按 H 显示）
 *   $rmmzHint.setCurrentMapHint("在城西找铁匠。", "H");
 *
 *   // 给指定地图 id=5 添加按键 P 的提示
 *   $rmmzHint.setMapHint(5, "这是地图5的提示", "P");
 *
 *   // 移除当前地图的 G 按键提示
 *   $rmmzHint.removeMapHint($gameMap.mapId(), "G");
 *
 *   // 清空当前地图所有按键提示
 *   $rmmzHint.clearMapHints($gameMap.mapId());
 *
 *   // 取得当前地图所有按键提示（返回对象，如 {G: "文本", H: "文本2"}）
 *   console.log($rmmzHint.getCurrentMapHints());
 *
 *   // 禁用/恢复当前地图所有按键提示
 *   $rmmzHint.disableCurrentMap(true);
 *   $rmmzHint.disableCurrentMap(false);
 *
 *   // 控制台手动触发测试（传入按键字符）
 *   $rmmzHint._testTriggerWithKey("G");
 *
 * 说明：
 *  - 每个按键都是单字符（字母/数字等可输入字符），不区分大小写。
 *  - setMapHint(mapId, text, key)：当 text 为 null 时表示删除该键的提示；当 key 为 null 则无效（需指定按键）。
 *  - 如果消息窗口正在显示或忙碌，则会跳过本次显示以避免打断玩家。
 */

(() => {
  // plugin 名称（自动）
  const scriptSrc = document.currentScript && document.currentScript.src ? document.currentScript.src : "";
  const pluginName = scriptSrc ? scriptSrc.split("/").pop().replace(/\.js$/, "") : "MapHintMultiKey";

  // 辅助：标准化单字符按键（大写），null 表示无按键
  function normalizeKeyChar(ch) {
    if (ch == null) return null;
    const s = String(ch).toUpperCase();
    return s.length ? s.slice(0, 1) : null;
  }

  // --- 扩展 Game_System 保存每地图多个按键提示 ---
  const _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function() {
    _Game_System_initialize.call(this);
    // 存储结构：{ [mapId]: { hints: { 'G': '文本', 'H': '文本2' }, disabled: false } }
    this._rmmzHints = this._rmmzHints || {};
  };

  Game_System.prototype._ensureRmmzEntry = function(mapId) {
    const id = Number(mapId) || 0;
    this._rmmzHints = this._rmmzHints || {};
    if (!this._rmmzHints[id]) this._rmmzHints[id] = { hints: {}, disabled: false };
    return this._rmmzHints[id];
  };

  // 添加或更新某地图的某按键提示（key: 单字符），text 为 null 表示删除该键提示
  Game_System.prototype.setMapHint = function(mapId, text, key) {
    const e = this._ensureRmmzEntry(mapId);
    const k = normalizeKeyChar(key);
    if (!k) {
      console.warn("[MapHint] 必须提供按键字符（单字符），未设置按键，操作被忽略。");
      return;
    }
    if (text == null) {
      // 删除该键
      delete e.hints[k];
    } else {
      e.hints[k] = String(text);
    }
  };

  // 获取某地图按键对应的文本（单个 key），返回 null 或文本
  Game_System.prototype.getMapHintByKey = function(mapId, key) {
    const id = Number(mapId) || 0;
    if (!this._rmmzHints) return null;
    const e = this._rmmzHints[id];
    if (!e || !e.hints) return null;
    const k = normalizeKeyChar(key);
    if (!k) return null;
    return e.hints[k] || null;
  };

  // 获取某地图的所有按键提示（返回对象），若无则返回 {}
  Game_System.prototype.getMapHints = function(mapId) {
    const id = Number(mapId) || 0;
    if (!this._rmmzHints) return {};
    const e = this._rmmzHints[id];
    if (!e || !e.hints) return {};
    // 返回副本以防外部修改
    return Object.assign({}, e.hints);
  };

  Game_System.prototype.disableMapHint = function(mapId, flag) {
    const e = this._ensureRmmzEntry(mapId);
    e.disabled = !!flag;
  };

  Game_System.prototype.isMapHintDisabled = function(mapId) {
    const id = Number(mapId) || 0;
    if (!this._rmmzHints) return false;
    return this._rmmzHints[id] ? !!this._rmmzHints[id].disabled : false;
  };

  // 清空某地图所有按键提示
  Game_System.prototype.clearMapHints = function(mapId) {
    const e = this._ensureRmmzEntry(mapId);
    e.hints = {};
  };

  // --- 对外 API（window.$rmmzHint） ---
  window.$rmmzHint = window.$rmmzHint || {};

  // (mapId, text, key) : 若 text == null 则删除该键提示。key 必须填写单字符。
  window.$rmmzHint.setMapHint = function(mapId, text, key) {
    if (!$gameSystem) return;
    $gameSystem.setMapHint(mapId, text, key);
  };

  // (text, key) -> 当前地图
  window.$rmmzHint.setCurrentMapHint = function(text, key) {
    if (!$gameSystem || !$gameMap) return;
    $gameSystem.setMapHint($gameMap.mapId(), text, key);
  };

  // remove specific key
  window.$rmmzHint.removeMapHint = function(mapId, key) {
    if (!$gameSystem) return;
    $gameSystem.setMapHint(mapId, null, key);
  };

  // clear all keys for a map
  window.$rmmzHint.clearMapHints = function(mapId) {
    if (!$gameSystem) return;
    $gameSystem.clearMapHints(mapId);
  };

  // get hints object for mapId
  window.$rmmzHint.getMapHints = function(mapId) {
    if (!$gameSystem) return {};
    return $gameSystem.getMapHints(mapId);
  };

  window.$rmmzHint.getCurrentMapHints = function() {
    if (!$gameSystem || !$gameMap) return {};
    return $gameSystem.getMapHints($gameMap.mapId());
  };

  window.$rmmzHint.disableMap = function(mapId, flag) {
    if (!$gameSystem) return;
    $gameSystem.disableMapHint(mapId, !!flag);
  };

  window.$rmmzHint.disableCurrentMap = function(flag) {
    if (!$gameSystem || !$gameMap) return;
    $gameSystem.disableMapHint($gameMap.mapId(), !!flag);
  };

  window.$rmmzHint.isMapDisabled = function(mapId) {
    if (!$gameSystem) return false;
    return $gameSystem.isMapHintDisabled(mapId);
  };

  window.$rmmzHint.isCurrentMapDisabled = function() {
    if (!$gameSystem || !$gameMap) return false;
    return $gameSystem.isMapHintDisabled($gameMap.mapId());
  };

  // --- 显示提示函数（安全检查、日志） ---
  window._rmmzHint_lastTriggerTime = window._rmmzHint_lastTriggerTime || 0;
  const TRIGGER_DEBOUNCE_MS = 200;

  function tryShowHintForCurrentMapWithKey(keyChar) {
    try {
      if (!(SceneManager._scene instanceof Scene_Map)) return;
      if (!$gameMap || !$gameSystem) return;
      const now = Date.now();
      if (now - window._rmmzHint_lastTriggerTime < TRIGGER_DEBOUNCE_MS) {
        return; // 去抖
      }
      const mapId = $gameMap.mapId();
      if ($gameSystem.isMapHintDisabled(mapId)) {
        console.log(`[MapHint] 地图 ${mapId} 的提示被禁用`);
        return;
      }
      const k = normalizeKeyChar(keyChar);
      if (!k) return;
      const text = $gameSystem.getMapHintByKey(mapId, k);
      if (!text) {
        // 没有为该键设置提示
        //console.log(`[MapHint] 地图 ${mapId} 在按键 ${k} 上没有提示`); // 可选日志
        return;
      }
      if ($gameMessage && typeof $gameMessage.isBusy === "function" && $gameMessage.isBusy()) {
        console.log("[MapHint] 当前消息系统忙，跳过显示提示");
        return;
      }
      $gameMessage.add(text);
      const scene = SceneManager._scene;
      if (scene && scene._messageWindow && typeof scene._messageWindow.startMessage === "function") {
        scene._messageWindow.startMessage();
      } else if (scene && typeof scene.startMessage === "function") {
        scene.startMessage();
      }
      window._rmmzHint_lastTriggerTime = now;
      console.log(`[MapHint] 显示地图 ${mapId} 按键 ${k} 的提示：${text}`);
    } catch (e) {
      console.error("[MapHint] 显示提示时出错：", e);
    }
  }

  // --- Scene_Map.update 保持原样（不检测 Input.keyMapper） ---
  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
  };

  // --- 原生键盘监听（每地图多键支持） ---
  if (!window._rmmzHint_nativeListener) {
    window._rmmzHint_nativeListener = function(ev) {
      try {
        if (!(SceneManager._scene instanceof Scene_Map)) return;
        if (!$gameMap || !$gameSystem) return;
        // 取按键首字符并大写（只支持单字符按键）
        const pressed = (ev.key || "").toString().slice(0, 1).toUpperCase();
        if (!pressed) return;
        tryShowHintForCurrentMapWithKey(pressed);
      } catch (e) {
        // 忽略
      }
    };
    window.addEventListener("keydown", window._rmmzHint_nativeListener, false);
    console.log("[MapHint] 已添加原生 keydown 监听（支持每地图多个按键）");
  }

  // --- 便捷测试函数 ---
  window.$rmmzHint._testTriggerWithKey = function(keyChar) {
    console.log("[MapHint] 手动触发测试，按键:", keyChar);
    tryShowHintForCurrentMapWithKey(keyChar);
  };

})();

/*:
 * @target MZ
 * @plugindesc 按玩家朝向分支/触发事件（修正版：在解释器上提供方法）
 * @author crb
 * @help
 * 用法（在事件指令中）：
 *  1) 条件分歧 → 脚本：
 *       this.checkPlayerDir(8)   // 上
 *       this.checkPlayerDir(2)   // 下
 *       this.checkPlayerDir(4)   // 左
 *       this.checkPlayerDir(6)   // 右
 *
 *  2) 也可以在脚本命令里直接写：
 *       if (checkPlayerDir(8)) { ... }
 *
 *  附加：更易读的写法
 *       this.playerFacing('up'|'down'|'left'|'right')
 */

(() => {

    window.checkPlayerDir = function(dir) {
      return $gamePlayer.direction() === Number(dir);
    };
  

    Game_Interpreter.prototype.checkPlayerDir = function(dir) {
      return window.checkPlayerDir(dir);
    };
  
    Game_Interpreter.prototype.playerFacing = function(name) {
      const n = String(name).toLowerCase();
      if (n === 'up')    return this.checkPlayerDir(8);
      if (n === 'down')  return this.checkPlayerDir(2);
      if (n === 'left')  return this.checkPlayerDir(4);
      if (n === 'right') return this.checkPlayerDir(6);
      return false;
    };
  

    Game_Interpreter.prototype.isFacingEvent = function(eventId) {
      const ev = $gameMap.event(eventId || this.eventId());
      if (!ev) return false;
      const px = $gamePlayer.x, py = $gamePlayer.y;
      const ex = ev.x,         ey = ev.y;
      switch ($gamePlayer.direction()) {
        case 2: return px === ex && py + 1 === ey; // 下
        case 4: return px - 1 === ex && py === ey; // 左
        case 6: return px + 1 === ex && py === ey; // 右
        case 8: return px === ex && py - 1 === ey; // 上
        default: return false;
      }
    };
  })();
  
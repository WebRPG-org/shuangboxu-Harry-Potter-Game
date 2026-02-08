/*:
 * @target MZ
 * @plugindesc 强制玩家原地停留并在玩家头顶显示进度条与倒计时。作者: 许双博 (头顶版)
 *
 * @command ForceStay
 * @text 强制停留（秒）
 * @desc 让玩家在当前位置停留指定秒数（默认5秒）。期间玩家输入不会移动。
 * @arg seconds
 * @type number
 * @min 0
 * @default 5
 *
 * @command ForceStayFrames
 * @text 强制停留（帧）
 * @desc 用帧数指定停留时间（60帧≈1秒）。
 * @arg frames
 * @type number
 * @min 0
 * @default 300
 *
 * @help
 * 说明：
 * - 使用插件指令 ForceStay 或 ForceStayFrames，或脚本调用 `$gamePlayer.forceStay(5)`。
 * - 进度条会在玩家头顶显示并跟随玩家与镜头移动。
 *
 * 可在代码顶部调整样式常量：BAR_WIDTH、BAR_HEIGHT、PADDING、BG_COLOR、FG_COLOR、TEXT_FONT_SIZE、VERTICAL_OFFSET。
 *
 * 版本：1.2（头顶进度条 + 倒计时）
 */

(() => {
  const PLUGIN_NAME = "ForceStayHere_HeadBar";

  // ---------------- Game_Player 扩展：计数器与接口 ----------------
  const _Game_Player_initialize = Game_Player.prototype.initialize;
  Game_Player.prototype.initialize = function() {
    _Game_Player_initialize.call(this);
    this._forceStayCounter = 0;     // 剩余帧数
    this._forceStayMaxFrames = 0;   // 本次停留的最大帧数（用于进度计算）
  };

  // 以秒为单位的脚本接口
  Game_Player.prototype.forceStay = function(seconds) {
    const sec = Number(seconds) || 0;
    const frames = Math.max(0, Math.ceil(sec * 60));
    this.forceStayFrames(frames);
  };

  // 以帧为单位（内部/插件指令调用）
  Game_Player.prototype.forceStayFrames = function(frames) {
    const f = Math.max(0, Math.floor(Number(frames) || 0));
    // 使用较大的值，避免短的覆盖长的（如需覆盖行为可改成直接赋值）
    this._forceStayCounter = Math.max(this._forceStayCounter || 0, f);
    this._forceStayMaxFrames = Math.max(this._forceStayMaxFrames || 0, f);
  };

  // 拦截玩家输入移动（计时器>0时屏蔽）
  const _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
  Game_Player.prototype.moveByInput = function() {
    if (this._forceStayCounter > 0) {
      return; // 屏蔽玩家基于输入的移动
    }
    _Game_Player_moveByInput.call(this);
  };

  // 每帧递减计数器，结束时重置 maxFrames
  const _Game_Player_update = Game_Player.prototype.update;
  Game_Player.prototype.update = function(sceneActive) {
    if (this._forceStayCounter > 0) {
      this._forceStayCounter--;
      if (this._forceStayCounter <= 0) {
        this._forceStayCounter = 0;
        this._forceStayMaxFrames = 0;
      }
    }
    _Game_Player_update.call(this, sceneActive);
  };

  // ---------------- 插件指令注册 ----------------
  PluginManager.registerCommand(PLUGIN_NAME, "ForceStay", args => {
    const seconds = Number(args.seconds) || 0;
    if ($gamePlayer) $gamePlayer.forceStay(seconds);
  });

  PluginManager.registerCommand(PLUGIN_NAME, "ForceStayFrames", args => {
    const frames = Number(args.frames) || 0;
    if ($gamePlayer) $gamePlayer.forceStayFrames(frames);
  });

  // ---------------- HUD：头顶进度条精灵 ----------------
  function Sprite_ForceStayHead() {
    this.initialize.apply(this, arguments);
  }

  Sprite_ForceStayHead.prototype = Object.create(Sprite.prototype);
  Sprite_ForceStayHead.prototype.constructor = Sprite_ForceStayHead;

  Sprite_ForceStayHead.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);

    // ---------- 可调整的样式常量（按需改） ----------
    this.BAR_WIDTH = 120;        // 进度条宽（像素）
    this.BAR_HEIGHT = 10;        // 进度条高（像素）
    this.PADDING = 6;            // 内边距（像素）
    this.BG_COLOR = "rgba(0,0,0,0.6)";      // 背景色
    this.FG_COLOR = "rgba(0,200,0,0.95)";   // 前景色
    this.TEXT_FONT_SIZE = 14;    // 倒计时文字大小（像素）
    this.VERTICAL_OFFSET = -48;  // 相对于玩家 screenY 的垂直偏移（负数表示在上方）
    this.MARGIN_BOTTOM = 4;      // 进度条到文字底部的间距（像素）
    // ---------- end constants ----------

    // 计算位图高度：文字区 + 进度条区（这里留一点空间）
    const textHeight = this.TEXT_FONT_SIZE + 4;
    const totalH = textHeight + this.BAR_HEIGHT + this.MARGIN_BOTTOM;
    this._bitmapWidth = this.BAR_WIDTH + this.PADDING * 2 + 40; // 右侧留空间显示秒数
    this._bitmapHeight = totalH;

    this.bitmap = new Bitmap(this._bitmapWidth, this._bitmapHeight);
    this.bitmap.fontSize = this.TEXT_FONT_SIZE;

    // 初始不可见
    this.visible = false;

    // 设置锚点以便水平居中（用到 screenX 直接居中）
    if (this.anchor) {
      this.anchor.x = 0.5;
      this.anchor.y = 1.0; // 以底部为基准更好定位到玩家头顶
    }

    this.x = 0;
    this.y = 0;
    this.z = 9999;
  };

  Sprite_ForceStayHead.prototype.update = function() {
    Sprite.prototype.update.call(this);
    const player = $gamePlayer;
    if (!player) {
      this.visible = false;
      return;
    }
    const counter = player._forceStayCounter || 0;
    const maxFrames = player._forceStayMaxFrames || 0;

    if (counter > 0 && maxFrames > 0) {
      // 跟随玩家位置（screenX/Y 会随镜头滚动而变化）
      const sx = player.screenX();
      const sy = player.screenY();
      // 将精灵放在玩家头顶（使用 anchor.x=0.5 已居中）
      this.x = sx;
      this.y = sy + this.VERTICAL_OFFSET;
      this.visible = true;
      this.redraw(counter, maxFrames);
    } else {
      if (this.visible) {
        this.visible = false;
        this.bitmap.clear();
      }
    }
  };

  Sprite_ForceStayHead.prototype.redraw = function(counter, maxFrames) {
    const bmp = this.bitmap;
    bmp.clear();
    const w = this._bitmapWidth;
    const h = this._bitmapHeight;

    const pad = this.PADDING;
    const barW = this.BAR_WIDTH;
    const barH = this.BAR_HEIGHT;

    // 计算条的位置（居中）
    const barX = (w - barW) / 2 - 20; // 左移一些给秒数留空间（秒数在右侧）
    const textAreaHeight = this.TEXT_FONT_SIZE + 4;

    // 背景圆角矩形：这里使用简单 fillRect（没有圆角 API），所以绘制为矩形
    // 整体半透明背景（包进度条和文字）
    const bgRectX = barX - pad;
    const bgRectY = 0;
    const bgRectW = barW + pad * 2 + 40;
    const bgRectH = h;
    bmp.fillRect(bgRectX, bgRectY, bgRectW, bgRectH, "rgba(0,0,0,0.25)");

    // 进度条背景
    const barY = textAreaHeight;
    bmp.fillRect(barX, barY, barW, barH, this.BG_COLOR);

    // 进度条前景（从左到右）
    const ratio = Math.max(0, Math.min(1, counter / maxFrames));
    const fgW = Math.max(0, Math.round(barW * ratio));
    if (fgW > 0) {
      bmp.fillRect(barX, barY, fgW, barH, this.FG_COLOR);
    }

    // 倒计时文字（秒），向上取整
    const secondsLeft = Math.ceil(counter / 60);
    const txt = `${secondsLeft}s`;

    // 在右侧绘制秒数，垂直居中于进度条区域
    const txtX = barX + barW + 8;
    const txtY = barY - 2;
    const txtW = bgRectW - (txtX - bgRectX);
    bmp.drawText(txt, txtX, txtY, txtW, barH + 4, "left");

    // 可选：在进度条上居中显示百分比或秒数（注释掉）
    // const centerTxt = `${secondsLeft}s`;
    // bmp.drawText(centerTxt, barX, barY, barW, barH, "center");
  };

  // ---------------- 将 HUD 添加到 Scene_Map（并保证在场景创建后添加） ----------------
  const _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
  Scene_Map.prototype.createDisplayObjects = function() {
    _Scene_Map_createDisplayObjects.call(this);

    // 创建并添加头顶进度条精灵
    this._spriteForceStayHead = new Sprite_ForceStayHead();

    // 把它放到场景最顶层，确保不会被角色遮挡
    this.addChild(this._spriteForceStayHead);
  };

  // 清理
  const _Scene_Map_terminate = Scene_Map.prototype.terminate;
  Scene_Map.prototype.terminate = function() {
    if (this._spriteForceStayHead) {
      this.removeChild(this._spriteForceStayHead);
      this._spriteForceStayHead = null;
    }
    _Scene_Map_terminate.call(this);
  };

})();

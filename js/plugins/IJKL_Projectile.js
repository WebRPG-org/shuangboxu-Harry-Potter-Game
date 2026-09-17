/*: 
 * @target MZ
 * @plugindesc 使用 I J K L 键发射魔杖能量（美化版：发光魔法球 + 尾迹 + 火花），命中达到指定次数后 NPC 消失并被闪电劈中特效。 (v1.7：仅当地图含 <npc> 注释事件时才启用，且子弹只可通过玩家可通过的格子)
 * @author ChatGPT
 *
 * @param HitsToDestroy
 * @text NPC 被击中消失所需次数
 * @type number
 * @min 1
 * @default 3
 *
 * @param ProjectileSpeed
 * @text 子弹速度（每帧格子数）
 * @type number
 * @decimals 3
 * @default 0.2
 *
 * @param ProjectileRange
 * @text 子弹射程（格数）
 * @type number
 * @decimals 1
 * @default 10
 *
 * @help
 * 说明：
 * - 按 I 向上发射，J 向左，K 向下，L 向右。
 * - 只有在事件注释里写了 <npc> 的事件才会被子弹击中。
 * - 插件只在当前地图存在至少一个带有注释 <npc> 的事件时启用；否则插件不会响应键盘，也不会创建投射物容器和闪电特效。
 * - NPC 被击中达到 HitsToDestroy 次数后会先被闪电劈中（有特效与音效、屏幕闪白），闪电结束后 NPC 才真正消失，并提示一次“不准杀人！！！”。 
 * - **新增**：子弹只能通过玩家能通过的格子（基于 $gameMap.isPassable 判断）。玩家不能通过的地方，子弹也会在边界处被销毁。
 *
 * 使用方法：
 * 1. 将本文件放到项目的 js/plugins 目录。
 * 2. 在 RPG Maker MZ 的插件管理器中启用本插件（插件启用后会根据当前地图自动决定是否生效）。
 * 3. 在需要能被击中的事件中，添加注释：<npc>
 */

(() => {
  const PLUGIN_NAME = "IJKL_Projectile";
  const params = PluginManager.parameters(PLUGIN_NAME);
  const HITS_TO_DESTROY = Number(params["HitsToDestroy"] || 3);
  const PROJECTILE_SPEED = Number(params["ProjectileSpeed"] || 0.2);
  const PROJECTILE_RANGE = Number(params["ProjectileRange"] || 10);

  // 新增：闪电持续帧数（劈中后的等待时间）
  const LIGHTNING_DURATION = 30; // 帧数（约0.5秒 @60fps），可改

  Input.keyMapper[73] = "I";
  Input.keyMapper[74] = "J";
  Input.keyMapper[75] = "K";
  Input.keyMapper[76] = "L";

  function Projectile(px, py, dir, speed, range) {
    this.initialize(px, py, dir, speed, range);
  }

  Projectile.prototype.initialize = function(px, py, dir, speed, range) {
    this.x = px;
    this.y = py;
    this.dir = dir;
    this.speed = typeof speed === "number" ? speed : PROJECTILE_SPEED;
    this.range = typeof range === "number" ? range : PROJECTILE_RANGE;
    this.distanceTraveled = 0;
    this.active = true;
    switch (this.dir) {
      case 8: this.vx = 0; this.vy = -1; break;
      case 2: this.vx = 0; this.vy = 1; break;
      case 4: this.vx = -1; this.vy = 0; break;
      case 6: this.vx = 1; this.vy = 0; break;
      default: this.vx = 0; this.vy = 0;
    }
    this._sprite = null;
  };

  // 关键：移动时先判断“下一格”对玩家是否可通行（若不可通行则销毁子弹）
  Projectile.prototype.update = function() {
    if (!this.active) return;

    // 计算下一帧位置
    const dx = this.vx * this.speed;
    const dy = this.vy * this.speed;
    const nextX = this.x + dx;
    const nextY = this.y + dy;

    // 将浮点位置映射为地图格坐标（使用 Math.round 更贴近 tile 中心判断）
    const curTileX = Math.round(this.x);
    const curTileY = Math.round(this.y);
    const nextTileX = Math.round(nextX);
    const nextTileY = Math.round(nextY);

    // 如果要跨格（即下一格与当前格不同），则判断该方向是否对玩家可通行
    const crossingTile = (nextTileX !== curTileX) || (nextTileY !== curTileY);
    if (crossingTile) {
      // 先判断 nextTile 是否在地图有效范围内
      if (typeof $gameMap.isValid === 'function' && !$gameMap.isValid(nextTileX, nextTileY)) {
        this.active = false;
        return;
      }
      // 使用 $gameMap.isPassable 对当前格向 this.dir 的通行性做判断
      // 注意：$gameMap.isPassable(x,y,d) 的 d 是方向（2/4/6/8）
      try {
        // 如果当前格本身就不在地图可通过范围，也直接销毁
        if (!$gameMap.isValid(curTileX, curTileY) || !$gameMap.isPassable(curTileX, curTileY, this.dir)) {
          this.active = false;
          return;
        }
      } catch (e) {
        // 若调用失败（兼容性），不阻塞子弹（回退：继续移动）
      }
    }

    // 执行移动
    this.x = nextX;
    this.y = nextY;
    this.distanceTraveled += Math.sqrt(dx * dx + dy * dy);
    if (this.distanceTraveled >= this.range) {
      this.active = false;
    }
  };

  function Sprite_Projectile(projectile) {
    this.initialize(projectile);
  }
  Sprite_Projectile.prototype = Object.create(Sprite.prototype);
  Sprite_Projectile.prototype.constructor = Sprite_Projectile;

  Sprite_Projectile.prototype.initialize = function(projectile) {
    Sprite.prototype.initialize.call(this);
    this._projectile = projectile;
    this.container = new PIXI.Container();
    this.addChild(this.container);

    this._trailPoints = []; // 最近的位置，用于尾迹
    this._trailMax = 14;

    this._sparkles = []; // firework-like small particles

    // 主体：多层圆形成的发光魔球（中心亮 + 外层雾）
    this.core = new PIXI.Graphics();
    this.core.blendMode = PIXI.BLEND_MODES.ADD;
    this.container.addChild(this.core);

    // 额外的环，用于动态脉冲
    this.halo = new PIXI.Graphics();
    this.halo.blendMode = PIXI.BLEND_MODES.ADD;
    this.container.addChild(this.halo);

    // trail graphics（尾迹使用一个 Graphics 渲染多段半透明小圆）
    this.trailGfx = new PIXI.Graphics();
    this.trailGfx.blendMode = PIXI.BLEND_MODES.ADD;
    this.container.addChildAt(this.trailGfx, 0);

    // 调整锚点（使用 container 位置来定位）
    this.container.x = 0;
    this.container.y = 0;

    // 参数：颜色、半径，基于 tile 尺寸自适应
    const tileSize = ($gameMap.tileWidth ? $gameMap.tileWidth() : 48);
    this._baseRadius = Math.max(6, Math.floor(tileSize * 0.14));
    this._time = 0;

    this.visible = !!(this._projectile && this._projectile.active);
    this.update(true);
  };

  Sprite_Projectile.prototype.update = function(force) {
    Sprite.prototype.update.call(this);
    if (!this._projectile) return;

    const tileW = $gameMap.tileWidth ? $gameMap.tileWidth() : 48;
    const tileH = $gameMap.tileHeight ? $gameMap.tileHeight() : 48;
    const screenX = (this._projectile.x - $gameMap.displayX()) * tileW + tileW / 2;
    const screenY = (this._projectile.y - $gameMap.displayY()) * tileH + tileH / 2;
    this.x = screenX;
    this.y = screenY;
    this.visible = this._projectile.active;

    if (!this.visible) return;

    this._time += 1;

    // push trail point
    this._trailPoints.unshift({ x: this.x, y: this.y, t: this._time });
    if (this._trailPoints.length > this._trailMax) this._trailPoints.pop();

    // occasionally spawn sparkles
    if (Math.random() < 0.18) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 0.5 + 0.3) * ($gameMap.tileWidth ? $gameMap.tileWidth() : 48) * 0.02;
      this._sparkles.push({
        x: this.x + Math.cos(angle) * 4,
        y: this.y + Math.sin(angle) * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 0.4,
        life: 24 + Math.floor(Math.random() * 20),
        age: 0,
        r: Math.random() * 1.6 + 0.6
      });
    }

    // update sparkles
    for (let i = this._sparkles.length - 1; i >= 0; i--) {
      const s = this._sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.04; // gravity-ish
      s.age++;
      if (s.age >= s.life) this._sparkles.splice(i, 1);
    }

    // draw trail
    this.trailGfx.clear();
    const maxTrail = this._trailPoints.length;
    for (let i = 0; i < maxTrail; i++) {
      const p = this._trailPoints[i];
      const k = 1 - i / (maxTrail + 1);
      const rad = this._baseRadius * (0.6 + 0.6 * k);
      const alpha = 0.18 * k * k;
      // color: 紫 - 金混合（靠紫多一些）
      const color = 0x9b5fff; // 紫色主调
      this.trailGfx.beginFill(color, alpha);
      this.trailGfx.drawCircle(p.x - this.x, p.y - this.y, rad);
      this.trailGfx.endFill();
    }

    // draw halo (outer glow pulse)
    this.halo.clear();
    const pulse = 0.85 + Math.sin(this._time * 0.18) * 0.12;
    const haloRadius = this._baseRadius * (1.8 + pulse);
    const haloColor = 0xd9b3ff;
    this.halo.beginFill(haloColor, 0.12);
    this.halo.drawCircle(0, 0, haloRadius);
    this.halo.endFill();
    this.halo.beginFill(haloColor, 0.07);
    this.halo.drawCircle(0, 0, haloRadius * 1.9);
    this.halo.endFill();

    // draw core (bright center + inner glow)
    this.core.clear();
    const coreColor = 0xfff2d6; // warm core（带一点金色）
    this.core.beginFill(coreColor, 1.0);
    this.core.drawCircle(0, 0, this._baseRadius * (0.6 + 0.08 * Math.sin(this._time * 0.4)));
    this.core.endFill();

    // small inner purple sheen
    this.core.beginFill(0xc08bff, 0.8);
    this.core.drawCircle(-this._baseRadius * 0.15, -this._baseRadius * 0.12, this._baseRadius * 0.38);
    this.core.endFill();

    // draw sparkles on top
    for (let s of this._sparkles) {
      const lifeFrac = 1 - s.age / s.life;
      const a = lifeFrac * 0.9;
      const r = s.r * (0.6 + lifeFrac * 0.8);
      this.core.beginFill(0xfff2d6, a);
      this.core.drawCircle(s.x - this.x, s.y - this.y, r);
      this.core.endFill();
      this.core.beginFill(0xe6d3ff, a * 0.6);
      this.core.drawCircle(s.x - this.x + 0.8, s.y - this.y - 0.6, r * 0.6);
      this.core.endFill();
    }

    // slight rotation for movement feel
    this.container.rotation = Math.sin(this._time * 0.06) * 0.12;
  };

  // ensure we clean up PIXI children when removing sprite
  Sprite_Projectile.prototype.destroy = function(options) {
    try {
      if (this.container && this.container.parent) this.container.parent.removeChild(this.container);
      this.container.destroy({ children: true, texture: false, baseTexture: false });
    } catch (e) {
      // ignore
    }
    Sprite.prototype.destroy.call(this, options);
  };

  const _Scene_Map_create = Scene_Map.prototype.create;
  Scene_Map.prototype.create = function() {
    _Scene_Map_create.call(this);
    this._projectiles = this._projectiles || [];
    this._warningSprite = null;
    this._warningTimer = 0;

    // 新增：闪电特效列表，用于管理生命周期
    this._lightnings = [];
    // spriteset 引用（由 Spriteset_Map 填充）
    this._spritesetRef = this._spritesetRef || null;

    // 初始化插件是否在当前地图启用（会在 update 中动态检测）
    this._ijklEnabled = this._checkIJKLEnabled();
  };

  // 检测当前地图是否至少有一个事件注释包含 <npc>
  Scene_Map.prototype._checkIJKLEnabled = function() {
    try {
      if (!$gameMap) return false;
      const events = $gameMap.events();
      for (let ev of events) {
        if (ev && ev.event && ev.event().note && ev.event().note.includes("<npc>")) {
          return true;
        }
      }
    } catch (e) {
      // 容错：若出错则视为未启用
    }
    return false;
  };

  const _Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
  Spriteset_Map.prototype.createUpperLayer = function() {
    _Spriteset_Map_createUpperLayer.call(this);

    // 只有当地图含 <npc> 注释事件时才创建 projectileContainer（节省资源并避免与其它插件冲突）
    let hasNpc = false;
    try {
      if ($gameMap && $gameMap.events) {
        hasNpc = $gameMap.events().some(e => e && e.event && e.event().note && e.event().note.includes("<npc>"));
      }
    } catch (e) { hasNpc = false; }

    if (hasNpc) {
      this._projectileContainer = new Sprite();
      if (this._baseSprite) {
        this._baseSprite.addChild(this._projectileContainer);
      } else {
        this.addChild(this._projectileContainer);
      }
    } else {
      // 不创建 container，但仍保留字段以避免其它代码报错
      this._projectileContainer = null;
    }

    // 警告提示 sprite（在 spriteset 中渲染，但保存回 scene 引用以便 scene 控制计时）
    this._warningSprite = new Sprite(new Bitmap(Graphics.width, 64));
    this._warningSprite.bitmap.fontSize = 32;
    this._warningSprite.bitmap.textColor = "#ff0000";
    // 将文本水平居中
    this._warningSprite.anchor.x = 0.5;
    this._warningSprite.x = Graphics.width / 2;
    this._warningSprite.y = 20;
    this._warningSprite.visible = false;
    this.addChild(this._warningSprite);

    // 把 spriteset 引用回 Scene，用于在 scene.spawnLightning 时把闪电加入到 spriteset 的 projectileContainer
    if (SceneManager._scene) {
      SceneManager._scene._warningSprite = this._warningSprite;
      SceneManager._scene._spritesetRef = this;
      // 保证场景有计时器字段（兼容性）
      SceneManager._scene._warningTimer = SceneManager._scene._warningTimer || 0;
    }

    if (SceneManager._scene) {
      SceneManager._scene._spritesetRef = this;
    }

    // 如果场景之前已经有 projectiles（极少情况），为它们创建 sprite（仅当 container 存在）
    if (SceneManager._scene && SceneManager._scene._projectiles && this._projectileContainer) {
      for (const p of SceneManager._scene._projectiles) {
        if (p && !p._sprite) {
          const sp = new Sprite_Projectile(p);
          p._sprite = sp;
          this._projectileContainer.addChild(sp);
        }
      }
    }
  };

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    // 每帧更新启用状态（容错且能应对地图事件动态改变/读写）
    this._ijklEnabled = this._checkIJKLEnabled();
    this.updateIJKLProjectiles();
    this.updateWarningMessage();
    this.updateLightningEffects(); // 新增：更新闪电动画与待擦除事件计时
  };

  Scene_Map.prototype.createProjectile = function(dir) {
    // 创建前再检查一次启用状态，避免误触发
    if (!this._ijklEnabled) return;

    const sx = $gamePlayer._realX !== undefined ? $gamePlayer._realX : $gamePlayer.x;
    const sy = $gamePlayer._realY !== undefined ? $gamePlayer._realY : $gamePlayer.y;
    const proj = new Projectile(sx, sy, dir, PROJECTILE_SPEED, PROJECTILE_RANGE);
    this._projectiles.push(proj);
    if (this._spritesetRef && this._spritesetRef._projectileContainer) {
      const sp = new Sprite_Projectile(proj);
      proj._sprite = sp;
      this._spritesetRef._projectileContainer.addChild(sp);
    }
  };

  Scene_Map.prototype.updateIJKLProjectiles = function() {
    // 如果当前地图没有任何 <npc> 注释事件，则插件不响应按键和投射相关逻辑
    if (!this._ijklEnabled) return;

    if (Input.isTriggered("I")) this.createProjectile(8);
    if (Input.isTriggered("J")) this.createProjectile(4);
    if (Input.isTriggered("K")) this.createProjectile(2);
    if (Input.isTriggered("L")) this.createProjectile(6);

    if (!this._projectiles || this._projectiles.length === 0) return;

    for (let i = this._projectiles.length - 1; i >= 0; i--) {
      const p = this._projectiles[i];
      if (!p.active) {
        if (p._sprite && p._sprite.parent) {
          try { p._sprite.destroy(); } catch (e) { if (p._sprite.parent) p._sprite.parent.removeChild(p._sprite); }
        }
        this._projectiles.splice(i, 1);
        continue;
      }
      p.update();

      // 如果 update 后变为 inactive（例如撞墙），及时移除 sprite
      if (!p.active) {
        if (p._sprite && p._sprite.parent) {
          try { p._sprite.destroy(); } catch (e) { if (p._sprite.parent) p._sprite.parent.removeChild(p._sprite); }
        }
        this._projectiles.splice(i, 1);
        continue;
      }

      const events = $gameMap.events();
      for (let ev of events) {
        if (ev._erased) continue;
        // 只有注释里包含 <npc> 的事件可被击中（此处再次确认，双保险）
        if (!ev.event().note || !ev.event().note.includes("<npc>")) continue;

        // 如果已经处于等待被闪电劈中并延迟擦除状态，则跳过碰撞检测（避免重复触发）
        if (ev._willBeErased) continue;

        const dx = Math.abs(p.x - ev.x);
        const dy = Math.abs(p.y - ev.y);
        const HIT_THRESHOLD = 0.45;
        if (dx <= HIT_THRESHOLD && dy <= HIT_THRESHOLD) {
          ev._projectileHitCount = (ev._projectileHitCount || 0) + 1;
          p.active = false;
          // 如果命中次数达标：先生成闪电特效，然后延迟擦除
          if (ev._projectileHitCount >= HITS_TO_DESTROY) {
            // spawn lightning effect at event, set pending erase timer
            this.spawnLightningAtEvent(ev);
            // 延迟擦除：在 spawnLightningAtEvent 中会设置 ev._willBeErased 与 ev._eraseTimer
          }
          break;
        }
      }
    }
  };

  // 用于在事件处生成闪电特效（会将特效加入 spriteset 的 projectileContainer）
  Scene_Map.prototype.spawnLightningAtEvent = function(ev) {
    if (!ev || ev._erased) return;
    // 防止重复启动
    if (ev._willBeErased) return;

    // 事件屏幕坐标
    const tileW = $gameMap.tileWidth ? $gameMap.tileWidth() : 48;
    const tileH = $gameMap.tileHeight ? $gameMap.tileHeight() : 48;
    const screenX = (ev.x - $gameMap.displayX()) * tileW + tileW / 2;
    const screenY = (ev.y - $gameMap.displayY()) * tileH + tileH / 2;

    // 创建 container 与 graphics
    const cont = new PIXI.Container();
    cont.x = screenX;
    cont.y = screenY;
    cont.zIndex = 1000000;
    // 生成闪电形状
    const g = new PIXI.Graphics();
    g.blendMode = PIXI.BLEND_MODES.ADD;
    cont.addChild(g);

    // 记录特效数据
    const lightning = {
      container: cont,
      gfx: g,
      age: 0,
      duration: LIGHTNING_DURATION,
      screenX: screenX,
      screenY: screenY
    };

    // 将特效加入场景 spriteset 的 projectile 容器（优先使用 scene._spritesetRef）
    try {
      if (this._spritesetRef && this._spritesetRef._projectileContainer) {
        this._spritesetRef._projectileContainer.addChild(cont);
      } else if (this._spriteset && this._spriteset._projectileContainer) {
        this._spriteset._projectileContainer.addChild(cont);
      } else {
        // 兜底：直接 addChild 到 Scene_Map，如果不可行则忽略（通常不会）
        this.addChild(cont);
      }
    } catch (e) {
      // ignore
    }

    // draw initial bolt (we'll redraw each frame for flicker)
    // (draw logic 放到 update 中以便每帧抖动)
    try {
      AudioManager.playSe({ name: "Thunder1", volume: 90, pitch: 100, pan: 0 });
    } catch (e) {}

    // 屏幕瞬间闪白（短暂），使用 $gameScreen.startFlash
    $gameScreen.startFlash([255, 255, 255, 120], 6);

    // push 到场景管理的闪电列表
    this._lightnings.push(lightning);

    // 将事件标记为待擦除并设置计时器（等闪电特效结束再擦除）
    ev._willBeErased = true;
    ev._eraseTimer = LIGHTNING_DURATION;
    // 保证后续不会再触发额外闪电
    ev._projectileHitCount = HITS_TO_DESTROY;
  };

  // 更新闪电特效与处理待擦除的事件
  Scene_Map.prototype.updateLightningEffects = function() {
    // 更新闪电动画并移除过期的
    if (this._lightnings && this._lightnings.length > 0) {
      for (let i = this._lightnings.length - 1; i >= 0; i--) {
        const L = this._lightnings[i];
        L.age++;
        const t = L.age / L.duration;
        // redraw for flicker
        try {
          L.gfx.clear();
          const baseLen = 160;
          const startY = -baseLen;
          const endY = 0;
          const segments = 8;
          const jitter = 28;
          // 背景 glow
          L.gfx.lineStyle(10, 0xffffee, 0.06 * (1 - t) + Math.random() * 0.04);
          let px = 0, py = startY;
          L.gfx.moveTo(px, py);
          for (let j = 1; j <= segments; j++) {
            const frac = j / segments;
            const nx = (Math.random() - 0.5) * jitter * (1 - frac * 0.7);
            const ny = startY + (endY - startY) * frac;
            L.gfx.lineTo(px + nx, ny);
            px += nx;
            py = ny;
          }
          // 主线
          L.gfx.lineStyle(3 + Math.floor(Math.random() * 3), 0xffffff, 0.9 * (1 - t * 0.6));
          px = 0; py = startY;
          L.gfx.moveTo(px, py);
          for (let j = 1; j <= segments; j++) {
            const frac = j / segments;
            const nx = (Math.random() - 0.5) * (jitter * 0.6) * (1 - frac * 0.6);
            const ny = startY + (endY - startY) * frac;
            L.gfx.lineTo(px + nx, ny);
            px += nx;
            py = ny;
          }
          // 末端光晕
          L.gfx.beginFill(0xffffcc, 0.6 * (1 - t) + Math.random() * 0.08);
          L.gfx.drawCircle(0, 0, 10 + 12 * (1 - t));
          L.gfx.endFill();
          // 轻微缩放/抖动效果
          L.container.scale.x = 1 + (Math.random() - 0.5) * 0.04;
          L.container.scale.y = 1 + (Math.random() - 0.5) * 0.04;
          L.container.alpha = 1 - t;
        } catch (e) {
          // ignore drawing errors
        }
        if (L.age >= L.duration) {
          // remove graphic from parent and list
          try {
            if (L.container && L.container.parent) {
              L.container.parent.removeChild(L.container);
              L.container.destroy({ children: true, texture: false, baseTexture: false });
            }
          } catch (e) {}
          this._lightnings.splice(i, 1);
        }
      }
    }

    // 处理被标记为待擦除的事件计时器（闪电结束后擦除并显示警告）
    const events = $gameMap.events();
    for (let ev of events) {
      if (ev._willBeErased) {
        if (typeof ev._eraseTimer === "number") {
          ev._eraseTimer--;
          if (ev._eraseTimer <= 0) {
            // 真正擦除事件并显示提示
            $gameMap.eraseEvent(ev.eventId());
            // 在这里显示一次警告（使用更稳健的显示函数）
            this.showWarningMessage("不准杀人！！！");

            // 清理标志（虽然事件已被擦除，但为了安全起见）
            try { ev._willBeErased = false; } catch (e) {}
          }
        } else {
          // 容错：若没有 timer，直接擦除
          $gameMap.eraseEvent(ev.eventId());
          this.showWarningMessage("不准杀人！！！");
          try { ev._willBeErased = false; } catch (e) {}
        }
      }
    }
  };

  // 更稳健的显示警告函数：兼容 scene 或 spriteset 引用不一致的情况
  Scene_Map.prototype.showWarningMessage = function(text) {
    // 优先使用 Scene 的 _warningSprite 引用
    if (this._warningSprite) {
      try {
        this._warningSprite.bitmap.clear();
        this._warningSprite.bitmap.drawText(text, 0, 0, Graphics.width, 64, "center");
        this._warningSprite.visible = true;
        this._warningSprite.opacity = 255;
      } catch (e) {
        // 如果位图操作失败，忽略（防止报错阻断流程）
      }
    } else {
      // 回退：尝试从 spritesetRef 获取
      try {
        const ss = this._spritesetRef || (SceneManager._scene && SceneManager._scene._spritesetRef);
        if (ss && ss._warningSprite) {
          ss._warningSprite.bitmap.clear();
          ss._warningSprite.bitmap.drawText(text, 0, 0, Graphics.width, 64, "center");
          ss._warningSprite.visible = true;
          ss._warningSprite.opacity = 255;
          // 保持 scene 的引用，便于后续 update 隐藏
          this._warningSprite = ss._warningSprite;
        }
      } catch (e) {}
    }
    // 将计时器（统一在 scene 上维护）
    this._warningTimer = 120;
  };

  // 更稳健的更新与隐藏逻辑：计时到达后一定清除位图并将 visible 设置为 false
  Scene_Map.prototype.updateWarningMessage = function() {
    if (this._warningTimer > 0) {
      this._warningTimer--;
      if (this._warningTimer <= 0) {
        if (this._warningSprite) {
          try {
            this._warningSprite.visible = false;
            // 清空位图内容，避免残留
            this._warningSprite.bitmap.clear();
          } catch (e) {
            // ignore
          }
        } else {
          // 回退：尝试 spritesetRef
          try {
            const ss = this._spritesetRef || (SceneManager._scene && SceneManager._scene._spritesetRef);
            if (ss && ss._warningSprite) {
              ss._warningSprite.visible = false;
              ss._warningSprite.bitmap.clear();
            }
          } catch (e) {}
        }
      }
    }
  };

  const _Scene_Map_terminate = Scene_Map.prototype.terminate;
  Scene_Map.prototype.terminate = function() {
    if (this._projectiles) {
      for (const p of this._projectiles) {
        try {
          if (p._sprite && p._sprite.parent) p._sprite.destroy();
        } catch (e) {
          if (p._sprite && p._sprite.parent) p._sprite.parent.removeChild(p._sprite);
        }
      }
      this._projectiles = [];
    }
    // 清理闪电特效
    if (this._lightnings) {
      for (const L of this._lightnings) {
        try {
          if (L.container && L.container.parent) L.container.parent.removeChild(L.container);
          L.container.destroy({ children: true, texture: false, baseTexture: false });
        } catch (e) {}
      }
      this._lightnings = [];
    }
    // 如果有 warning sprite 的引用，尝试清理它（防止跨场景残留）
    try {
      if (this._warningSprite) {
        if (this._warningSprite.parent) {
          this._warningSprite.parent.removeChild(this._warningSprite);
        }
        try { this._warningSprite.bitmap.clear(); } catch (e) {}
        this._warningSprite = null;
      }
      if (this._spritesetRef && this._spritesetRef._warningSprite) {
        // spriteset 负责销毁自身 children，scene 这里只清引用
        this._spritesetRef = null;
      }
      this._warningTimer = 0;
    } catch (e) {
      // ignore
    }

    _Scene_Map_terminate.call(this);
  };
})();

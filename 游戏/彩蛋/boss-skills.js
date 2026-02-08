// boss-skills.js 
// 负责：createBoss / scheduleNextBossSkill / bossDoSkill / 各技能实现 / 小怪生成 / avada 预警与发射 / 狂暴触发等
// 依赖全局：CONFIG, state, uid, randInt, randPick, now, clamp, cellCount, spawnParticles, spawnRing, showMessageTransient, spawnParticles, applyDamageToPlayer

(function(){
  'use strict';

  function createBoss(gx, gy){
    const t = now();
    const b = {
      id: uid(),
      x: gx, y: gy,
      animX: gx, animY: gy,
      size: CONFIG.boss.size,
      hp: CONFIG.boss.hp, maxHp: CONFIG.boss.hp,
      lastSkillAt: t,
      nextSkillDelay: randInt(CONFIG.boss.skillMinDelay, CONFIG.boss.skillMaxDelay),
      dashing: false, dashUntil: 0, dashStepsLeft: 0, dashDir: {x:0,y:0}, dashNextStepAt: 0,
      shielded: false, shieldUntil: 0,
      nextMinionAt: t + randInt(CONFIG.boss.minion.minDelay, CONFIG.boss.minion.maxDelay),
      enraged: false,
      enragedAt: 0,
      enrageBurstAdd: 8,
      enrageConeAdd: 6,
      enrageAvadaAdd: 1,
      enrageAvadaSpeedMult: 1.6,
      enrageDashExtraSteps: 4,
      enrageConeDamageMult: 1.5,
      enrageSummonAdd: Math.floor(CONFIG.boss.summon.count * 0.6)
    };
    return b;
  }

  function scheduleNextBossSkill(b){
    b.nextSkillDelay = randInt(CONFIG.boss.skillMinDelay, CONFIG.boss.skillMaxDelay);
    b.lastSkillAt = now();
  }

  function bossDoSkill(b){
    const r = randInt(1,100);
    if(!b.enraged){
      if(r <= 20) bossBurst(b);
      else if(r <= 36) bossCone(b);
      else if(r <= 52) bossSummon(b);
      else if(r <= 66) bossAvada(b);
      else if(r <= 74) bossLegilimens(b);
      else if(r <= 84) bossDarkMark(b);
      else if(r <= 90) bossCruciatus(b);
      else if(r <= 95) bossDash(b);
      else if(r <= 98) bossTeleport(b);
      else bossShield(b);
    } else {
      if(r <= 30) bossBurst(b);
      else if(r <= 60) bossAvada(b);
      else if(r <= 78) bossCone(b);
      else if(r <= 88) bossDash(b);
      else if(r <= 94) bossSummon(b);
      else if(r <= 97) bossTeleport(b);
      else bossShield(b);
    }
    scheduleNextBossSkill(b);
  }

  // 原技能实现（保留并略作与狂暴相关增强）
  function bossBurst(b){
    const centerX = b.x + b.size/2;
    const centerY = b.y + b.size/2;
    const extra = b.enraged ? b.enrageBurstAdd : 0;
    const count = CONFIG.boss.burst.count + extra;
    const speedMul = b.enraged ? 1.25 : 1;
    for(let i=0;i<count;i++){
      const ang = (i/count) * Math.PI*2 + (Math.random()-0.5)*0.2;
      const vx = Math.cos(ang) * CONFIG.boss.burst.speed * speedMul;
      const vy = Math.sin(ang) * CONFIG.boss.burst.speed * speedMul;
      state.bullets.push({
        id: uid(), x: centerX, y: centerY, vx, vy, life: CONFIG.bullet.lifeFrames, from:'enemy', damage: CONFIG.enemyBulletDamage, homing: !!CONFIG.boss.burst.homing, homingStrength: CONFIG.bullet.homingSteer
      });
    }
    spawnParticles(centerX, centerY, 20 + extra*2, 1.3, true);
    showMessageTransient(b.enraged ? '伏地魔 进入 摄魂狂暴，释放 致命弹幕！' : '伏地魔 使用了 追踪弹幕！', 900);
  }

  function bossCone(b){
    const centerX = b.x + b.size/2;
    const centerY = b.y + b.size/2;
    const px = state.player.x + 0.001, py = state.player.y + 0.001;
    const baseAng = Math.atan2(py - centerY, px - centerX);
    const extra = b.enraged ? b.enrageConeAdd : 0;
    const rays = CONFIG.boss.cone.rays + extra;
    const half = CONFIG.boss.cone.spread / 2;
    const damage = Math.round(CONFIG.boss.cone.damage * (b.enraged ? b.enrageConeDamageMult : 1));
    for(let i=0;i<rays;i++){
      const t = i/(rays-1 || 1);
      const ang = baseAng - half + t * (half*2) + (Math.random()-0.5)*0.06;
      const vx = Math.cos(ang) * CONFIG.boss.cone.speed;
      const vy = Math.sin(ang) * CONFIG.boss.cone.speed;
      state.bullets.push({ id: uid(), x: centerX, y: centerY, vx, vy, life: CONFIG.bullet.lifeFrames, from:'enemy', damage, homing:false });
    }
    spawnParticles(centerX, centerY, 18 + extra, 1.6, true);
    showMessageTransient(b.enraged ? '伏地魔 疯狂发射 死亡射线！' : '伏地魔 发射了 死亡射线！', 900);
  }

  function bossSummon(b){
    const centerX = b.x + b.size/2;
    const centerY = b.y + b.size/2;
    const base = CONFIG.boss.summon.count;
    const extra = b.enraged ? b.enrageSummonAdd : 0;
    const count = base + extra;
    for(let i=0;i<count;i++){
      const ang = Math.random()*Math.PI*2;
      const r = 0.6 + Math.random()*0.8;
      const sx = centerX + Math.cos(ang)*r;
      const sy = centerY + Math.sin(ang)*r;
      state.bullets.push({ id: uid(), x: sx, y: sy, vx: 0, vy: 0, life: CONFIG.boss.summon.life, from:'enemy', damage: CONFIG.boss.summon.damage, homing:true, homingStrength: 0.06, isMinion:true });
    }
    spawnParticles(centerX, centerY, 24 + extra*2, 1.8, true);
    showMessageTransient(b.enraged ? '伏地魔 狂暴召唤了 更多摄魂怪！' : '伏地魔 召唤了 摄魂怪！', 900);
  }

  function bossTeleport(b){
    const margin = CONFIG.boss.teleport.margin;
    let attempts = 0;
    let nx, ny;
    do{
      nx = randInt(margin, cellCount - b.size - margin);
      ny = randInt(margin, cellCount - b.size - margin);
      attempts++;
      const dist = Math.hypot(nx - state.player.x, ny - state.player.y);
      if(dist > cellCount/3) break;
    } while(attempts < 40);
    spawnRing(b.x + b.size/2, b.y + b.size/2, b.size*0.9, 24);
    b.x = nx; b.y = ny;
    b.animX = b.x; b.animY = b.y;
    spawnParticles(b.x + b.size/2, b.y + b.size/2, 30, 1.5, true);
    showMessageTransient('伏地魔 瞬移！', 700);
  }

  function bossDash(b){
    const dx = Math.sign(state.player.x - (b.x + b.size/2));
    const dy = Math.sign(state.player.y - (b.y + b.size/2));
    let dir = {x: dx, y: dy};
    if(dir.x === 0 && dir.y === 0){
      const r = randInt(0,3);
      dir = (r===0?{x:1,y:0}:r===1?{x:-1,y:0}:r===2?{x:0,y:1}:{x:0,y:-1});
    }
    b.dashing = true;
    b.dashStepsLeft = CONFIG.boss.dash.steps + (b.enraged ? b.enrageDashExtraSteps : 0);
    b.dashDir = dir;
    b.dashNextStepAt = now() + 20;
    showMessageTransient(b.enraged ? '伏地魔 疯狂突进！' : '伏地魔 突进！', 700);
  }

  function bossShield(b){
    b.shielded = true;
    b.shieldUntil = now() + CONFIG.boss.shield.duration;
    spawnParticles(b.x + b.size/2, b.y + b.size/2, 22, 1.6, true);
    showMessageTransient('伏地魔 启动 结界（护盾）！', 900);
  }

  /* === 阿瓦达（预警 -> 发射） === */
  function bossAvada(b){
    const cx = b.x + b.size/2, cy = b.y + b.size/2;
    const baseCount = CONFIG.boss.avada.count || 1;
    const extra = b.enraged ? b.enrageAvadaAdd : 0;
    const count = baseCount + extra;
    const angleToPlayer = Math.atan2(state.player.y - cy, state.player.x - cx);
    const warnBaseMs = CONFIG.boss.avada.warnMs || 800;
    const warnMs = b.enraged ? Math.max(300, Math.floor(warnBaseMs * 0.7)) : warnBaseMs;
    const createdAt = now();
    const fireAt = createdAt + warnMs;
    for(let i=0;i<count;i++){
      const spread = (Math.random()-0.5)*0.06;
      state.avadaWarnings.push({
        id: uid(),
        x: cx, y: cy,
        angle: angleToPlayer + spread,
        createdAt,
        fireAt,
        count: randInt(1,2),
        speedMult: b.enraged ? b.enrageAvadaSpeedMult : 1,
        damage: b.enraged ? Math.round(CONFIG.boss.avada.damage * 1.2) : CONFIG.boss.avada.damage
      });
    }
    showMessageTransient(b.enraged ? '警报！伏地魔 进入 摄魂狂暴，准备 阿瓦达索命咒！' : '警告！伏地魔 正在蓄力 阿瓦达索命咒！', warnMs);
    spawnParticles(cx, cy, 22 + extra*4, 1.0, true);
  }

  function fireAvadaWarning(warn){
    const cx = warn.x, cy = warn.y;
    const cnt = warn.count || 1;
    const speedBase = CONFIG.boss.avada.speed;
    const speed = speedBase * (warn.speedMult || 1);
    const damage = warn.damage || CONFIG.boss.avada.damage;
    for(let k=0;k<cnt;k++){
      const ang = warn.angle + (Math.random()-0.5)*0.08;
      const vx = Math.cos(ang) * speed;
      const vy = Math.sin(ang) * speed;
      state.bullets.push({
        id: uid(), x: cx, y: cy, vx, vy, life: CONFIG.boss.avada.life, from:'enemy', damage: damage, avada:true
      });
    }
    spawnParticles(cx, cy, 26, 1.6, true);
    showMessageTransient('阿瓦达索命咒 发射！', 700);
  }

  /* === 摄神取念 / 黑魔标记 / 钻心咒 === */
  function bossLegilimens(b){
    const dur = CONFIG.boss.legilimens.durationMs;
    state.player.controlReversedUntil = now() + dur;
    showMessageTransient('摄神取念 —— 操作反转！', 1100);
    spawnParticles(state.player.x, state.player.y, 20, 1.2, true);
  }
  function bossDarkMark(b){
    const margin = 1;
    const gx = randInt(margin, cellCount - margin - 1);
    const gy = randInt(margin, cellCount - margin - 1);
    const dur = CONFIG.boss.darkmark.durationMs;
    const radius = CONFIG.boss.darkmark.radius;
    state.fogs.push({ x: gx + 0.5, y: gy + 0.5, radius, until: now() + dur });
    spawnParticles(gx + 0.5, gy + 0.5, 28, 1.2, false);
    showMessageTransient('黑魔标记 —— 黑雾降临！', 1000);
  }
  function bossCruciatus(b){
    const dur = CONFIG.boss.cruciatus.durationMs;
    state.player.rootedUntil = now() + dur;
    showMessageTransient('钻心咒！你受到剧痛折磨……', 1000);
    spawnParticles(state.player.x, state.player.y, 26, 1.3, true);
  }

  /* === 小怪生成 === */
  function spawnMinionNearBoss(){
    if(!state.boss) return;
    if(state.enemies.length >= CONFIG.enemy.maxCount) return;

    const b = state.boss;
    const cx = b.x + b.size/2;
    const cy = b.y + b.size/2;

    const ang = Math.random()*Math.PI*2;
    const r = 2 + Math.random()*2.5;
    let x = clamp(cx + Math.cos(ang)*r, 0.5, cellCount-0.5);
    let y = clamp(cy + Math.sin(ang)*r, 0.5, cellCount-0.5);

    const type = randPick(['chaser','wander','shooter_homing','shooter_straight']);
    const nowT = now();
    const enemy = {
      id: uid(),
      type,
      x, y, animX: x, animY: y,
      hp: CONFIG.enemy.hp, maxHp: CONFIG.enemy.hp,
      dir: {x: (Math.random()<0.5?-1:1), y:0},
      nextThinkAt: nowT + randInt(400,900),
      nextFireAt: nowT + randInt(600,1200),
      lastMoveDir: {x:1,y:0},
    };
    state.enemies.push(enemy);
  }
  function bossTrySpawnMinions(b){
    const t = now();
    if(t >= b.nextMinionAt){
      const n = randInt(CONFIG.boss.minion.batchMin, CONFIG.boss.minion.batchMax) + (b.enraged ? 1 : 0);
      for(let i=0;i<n;i++) spawnMinionNearBoss();
      b.nextMinionAt = t + randInt(CONFIG.boss.minion.minDelay, CONFIG.boss.minion.maxDelay);
      showMessageTransient(b.enraged ? '伏地魔 在狂暴中召唤了更多摄魂怪！' : '伏地魔 召唤了 摄魂怪！', 700);
    }
  }

  /* === 狂暴触发函数 === */
  function bossEnterEnrage(b){
    if(!b || b.enraged) return;
    b.enraged = true;
    b.enragedAt = now();
    b.nextSkillDelay = Math.max(350, Math.floor((b.nextSkillDelay || CONFIG.boss.skillMinDelay) * 0.5));
    spawnParticles(b.x + b.size/2, b.y + b.size/2, 48, 1.8, true);
    showMessageTransient('伏地魔 进入 摄魂狂暴（摄魂狂暴）！小心！', 1400);
  }

  // 暴露到全局供主脚本调用
  window.createBoss = createBoss;
  window.scheduleNextBossSkill = scheduleNextBossSkill;
  window.bossDoSkill = bossDoSkill;
  window.bossBurst = bossBurst;
  window.bossCone = bossCone;
  window.bossSummon = bossSummon;
  window.bossTeleport = bossTeleport;
  window.bossDash = bossDash;
  window.bossShield = bossShield;
  window.bossAvada = bossAvada;
  window.fireAvadaWarning = fireAvadaWarning;
  window.bossLegilimens = bossLegilimens;
  window.bossDarkMark = bossDarkMark;
  window.bossCruciatus = bossCruciatus;
  window.spawnMinionNearBoss = spawnMinionNearBoss;
  window.bossTrySpawnMinions = bossTrySpawnMinions;
  window.bossEnterEnrage = bossEnterEnrage;
})();

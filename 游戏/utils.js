//这个文件包含一些工具函数

//把分钟转换成 “MM:SS” 格式
function mmss(seconds) {
  const sign = seconds < 0 ? "-" : ""; // 如果是负数，加上负号
  const s = Math.abs(Math.floor(seconds)); // 取绝对值
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sign + String(m).padStart(2, '0') + ":" + String(sec).padStart(2, '0');
}
//写入日志
function logMsg(text) {
  game.log.push(text);
  $log.textContent = game.log.join('\n');
}

// 消耗时间（秒为单位）
function spend(secs) {
  game.remaining -= secs;

  // 把消耗时间转成 mm:ss
  const spent = mmss(secs);

  // 剩余时间（允许负数）
  const remaining = mmss(game.remaining);

  if (game.remaining >= 0) {
    logMsg(`- 花费 ${spent} | 剩余 ${remaining}`);
  } else {
    logMsg(`- 花费 ${spent} | 😱 已经迟到 ${remaining.replace('-', '')}`);
  }
}

function setState(text) { $state.textContent = text; }
// 渲染时格式化 mm:ss
function renderClock() { 
  $clock.textContent = mmss(game.remaining); 
}
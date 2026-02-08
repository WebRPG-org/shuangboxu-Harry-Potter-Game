// 入口文件：这个文件是游戏的主逻辑入口，负责初始化和事件绑定

// 入口文件：这个文件是游戏的主逻辑入口，负责初始化和事件绑定

document.getElementById('howBtn').onclick = ()=> ruleDlg.showModal();
document.getElementById('ruleClose').onclick = ()=> ruleDlg.close();


// 首次渲染
renderClock();
setState('准备中');

// （可选）占位存档：示范如何保存/恢复
function saveProgress() {
  const data = JSON.stringify(game);
  localStorage.setItem('liangxiang_save', data);
}
function loadProgress() {
  const raw = localStorage.getItem('liangxiang_save');
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    Object.assign(game, data);
    return true;
  } catch { return false; }
}



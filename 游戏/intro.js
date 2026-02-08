// intro.js
document.addEventListener("DOMContentLoaded", () => {
  // 1. 闪烁标题
  const title = document.getElementById("introTitle");
  setInterval(() => {
    title.style.opacity = (title.style.opacity === "0.5" ? "1" : "0.5");
  }, 500);

  // 2. 打字机效果
const introText = document.getElementById("introText");
const content = `你正躺在 <strong style="color:#f0f0f0;">格兰芬多宿舍</strong> 的床上，午后阳光洒在石墙上。<br>
突然，猫头鹰拍打着翅膀落在窗边，带来一封急信——<br>
<em style="color:#4ade80;">“詹姆·波特，还有 <strong style="color:#facc15;">60 分钟</strong> 就要开始 <strong style="color:#93c5fd;">霍格沃茨魔法试炼</strong>！<br>
准备好你的魔杖，迎接挑战吧！”</em><br>
<span style="color:#f87171; font-weight:bold; font-size:20px;">⚡ 学习魔咒，面对对手，掠夺者的冒险开始了！ ⚡</span>`;

  let i = 0;
  function typeWriter() {
    if (i < content.length) {
      introText.innerHTML = content.slice(0, i+1);
      i++;
      setTimeout(typeWriter, 40); // 打字速度（40ms一个字）
    }
  }
  typeWriter();
});

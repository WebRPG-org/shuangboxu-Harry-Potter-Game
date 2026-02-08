const canvas = document.getElementById("magicCanvas");
const ctx = canvas.getContext("2d");
let w, h;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// 粒子类
class Particle {
  constructor(x, y, color, vx, vy, life, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.size = size;
    this.color = color;
    this.alpha = 1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.02; // 重力
    this.life--;
    this.alpha = this.life / 60;
  }
  draw() {
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    g.addColorStop(0, this.color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

let particles = [];

// 魔法烟花
// function fireworks() {
//   const x = Math.random() * w * 0.8 + w * 0.1;
//   const y = Math.random() * h * 0.4 + h * 0.1;
//   const colors = ["#ffd700", "#66ccff", "#cc66ff", "#ff6699", "#00ffcc", "#ff9966"];
//   const color = colors[Math.floor(Math.random() * colors.length)];
//   for (let i = 0; i < 80; i++) {
//     const angle = Math.random() * Math.PI * 2;
//     const speed = Math.random() * 4 + 2;
//     particles.push(
//       new Particle(
//         x, y, color,
//         Math.cos(angle) * speed,
//         Math.sin(angle) * speed,
//         60, 4
//       )
//     );
//   }
// }
// setInterval(fireworks, 3000);

// 魔杖指针
document.addEventListener("mousemove", (e) => {
  const colors = ["#ffd700", "#66ccff", "#cc66ff", "#ff6699", "#00ffcc"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  for (let i = 0; i < 5; i++) {
    particles.push(
      new Particle(
        e.pageX, e.pageY, color,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        40, 3
      )
    );
  }
});

// 动画循环
function animate() {
  ctx.clearRect(0, 0, w, h);
  particles.forEach((p, i) => {
    p.update();
    p.draw();
    if (p.life <= 0) particles.splice(i, 1);
  });
  requestAnimationFrame(animate);
}
animate();

// 漂浮符文
const runes = ["ᚠ","ᚢ","ᚦ","ᚨ","ᛇ","✦","★","☽","☾","✧"];
const gradients = [
  "linear-gradient(45deg, #66ccff, #cc66ff)",
  "linear-gradient(45deg, #ffd700, #ff9966)",
  "linear-gradient(45deg, #ffffff, #99ccff)",
  "linear-gradient(45deg, #00ffcc, #66ccff)"
];

function createRune() {
  const rune = document.createElement("div");
  rune.className = "rune";
  rune.innerText = runes[Math.floor(Math.random() * runes.length)];

  rune.style.left = Math.random() * window.innerWidth + "px";
  rune.style.fontSize = (24 + Math.random() * 16) + "px";

  const gradient = gradients[Math.floor(Math.random() * gradients.length)];
  rune.style.background = gradient;
  rune.style.webkitBackgroundClip = "text";
  rune.style.webkitTextFillColor = "transparent";

  rune.style.textShadow = "0 0 8px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6)";

  document.body.appendChild(rune);
  setTimeout(() => rune.remove(), 7000);
}
setInterval(createRune, 1000);

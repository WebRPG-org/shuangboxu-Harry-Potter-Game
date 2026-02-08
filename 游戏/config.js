//这个文件中是游戏的配置和路线数据

const TICK_PER_REAL_SECOND = 1; // 调快可改成 2、3……
const GAME_START_SECONDS = 60 * 60; // 60 分钟 = 3600 秒

// 统一的时间处理，全部用“秒”为单位（整数为主，必要时可用小数）
let game = {
  remaining: GAME_START_SECONDS, // 直接用秒
  route: null,                   // 当前路线 id
  stepIndex: 0,                  // 路线中的第几个节点
  log: [],                       // 文本日志
  running: false,                // 是否在倒计时
  hp: 100,                       // 体力（给路线4示例用）
};

// DOM
const $clock = document.getElementById('clock').querySelector('strong');
const $state = document.getElementById('state').querySelector('strong');
const $intro = document.getElementById('intro');
const $routes = document.getElementById('routes');
const $nodeCard = document.getElementById('node');
const $nodeTitle = document.getElementById('nodeTitle');
const $nodeDesc = document.getElementById('nodeDesc');
const $nodeActions = document.getElementById('nodeActions');
const $logWrap = document.getElementById('logWrap');
const $log = document.getElementById('log');
const $ending = document.getElementById('ending');
const $endingText = document.getElementById('endingText');
const ruleDlg = document.getElementById('ruleDlg');
const qteDlg = document.getElementById('qteDlg');
const qteBtn = document.getElementById('qteBtn');
const qteGiveup = document.getElementById('qteGiveup');

let tickHandle = null;

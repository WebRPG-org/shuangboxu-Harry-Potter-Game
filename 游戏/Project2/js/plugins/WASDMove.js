/*:
 * @target MZ
 * @plugindesc 使用WASD键进行移动 (同时支持方向键)，兼容浏览器运行
 * @author 你
 *
 * @help
 * 这个插件允许玩家用WASD键来移动角色。
 * - W = 上
 * - A = 左
 * - S = 下
 * - D = 右
 *
 * 插件没有参数，直接启用即可。
 */

(() => {
  // 保存原始输入映射
  const oldKeyMapper = Input.keyMapper;

  // 扩展 keyMapper
  Input.keyMapper = Object.assign({}, oldKeyMapper, {
    87: "up",    // W
    65: "left",  // A
    83: "down",  // S
    68: "right"  // D
  });
})();

/*:
 * @target MZ
 * @plugindesc 通用失败跳转插件，可跳转到 fail1.html ~ fail6.html
 * @help
 * 使用方法：
 * 在事件里 → 脚本调用：
 * 
 * JumpToFailPage(1); // 跳转到 fail1.html
 * JumpToFailPage(2); // 跳转到 fail2.html
 * ...
 * JumpToFailPage(6); // 跳转到 fail6.html
 * 
 */

(() => {

    // 定义全局函数，支持传入 fail 编号
    window.JumpToFailPage = function(num) {
        if (!num || num < 1 || num > 6) {
            console.error("JumpToFailPage: 参数必须是 1~6 的数字");
            return;
        }
        // 拼接路径
        window.location.href = `../失败/fail${num}.html`;
    };

})();



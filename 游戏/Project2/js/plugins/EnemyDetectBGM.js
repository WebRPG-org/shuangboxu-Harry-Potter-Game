/*:
 * @target MZ
 * @plugindesc 玩家被敌人发现时切换BGM，逃脱后恢复原BGM
 * @author CRB
 *
 * @param DetectBGM
 * @text 警戒BGM文件名
 * @desc audio/bgm/ 文件夹下的音乐文件名（不带扩展名）
 * @default Alert
 *
 * @param Volume
 * @text 音量
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param Pitch
 * @text 音高
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param Pan
 * @text 声道
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 */

(() => {
    const parameters = PluginManager.parameters("EnemyDetectBGM");
    const detectBgmName = String(parameters["DetectBGM"] || "Alert");
    const detectBgmVol  = Number(parameters["Volume"] || 90);
    const detectBgmPitch= Number(parameters["Pitch"] || 100);
    const detectBgmPan  = Number(parameters["Pan"] || 0);

    // 覆盖 DetectedPlayer，插入播放警戒BGM
    const _SoR_ESE_GameEvent_DetectedPlayer = Game_Event.prototype.DetectedPlayer;
    Game_Event.prototype.DetectedPlayer = function() {
        _SoR_ESE_GameEvent_DetectedPlayer.call(this);
        if (this.event().meta.EnemySymbol) {
            if (!$gameTemp.detectedDefaultBGM) {
                $gameTemp.detectedDefaultBGM = AudioManager.saveBgm();
                if (detectBgmName) {
                    AudioManager.playBgm({
                        name: detectBgmName,
                        volume: detectBgmVol,
                        pitch: detectBgmPitch,
                        pan: detectBgmPan
                    });
                }
            }
        }
    };

    // 覆盖 FleePlayer，插入恢复BGM
    const _SoR_ESE_GameEvent_FleePlayer = Game_Event.prototype.FleePlayer;
    Game_Event.prototype.FleePlayer = function() {
        _SoR_ESE_GameEvent_FleePlayer.call(this);
        if (this.event().meta.EnemySymbol) {
            if ($gameTemp.detectedDefaultBGM) {
                AudioManager.replayBgm($gameTemp.detectedDefaultBGM);
                $gameTemp.detectedDefaultBGM = null;
            }
        }
    };
})();

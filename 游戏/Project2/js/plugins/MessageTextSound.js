/*:
 * @plugindesc
 * v1.00 - 为事件的“显示文字”动作添加音效。
 *
 * @help
 * 功能描述
 *     本插件可以为事件的“显示文字”动作添加音效，让一些特定音效随文字一起出现。
 * 使用方式
 *     直接启用插件即可为文字添加音效。
 *     你可以通过在事件中调用本系统提供的自定义脚本来修改音效的属性。（这些修改会永久生效，直到你下一次修改它们）
 * 自定义脚本
 *     set_text_sound_name("sound_name") # (字符串)将文字显示时播放的音效文件设置为sound_name（不含后缀名），音效存于audio/se目录下，你可以将"sound_name"改为null或""来关闭音效。
 *     set_text_sound_interval(interval) # (整数)  设置为每interval个字播放一次音效
 *     set_text_sound_volume(volume)     # (整数)  设置文字音效的音量
 *     set_text_sound_pitch(pitch)       # (整数)  设置文字音效的音调
 *     set_text_sound_pan(pan)           # (整数)  设置文字音效的偏移

 * @param Text Sound Interval
 * @desc 每多少个字播放一次音效，默认7
 * @default 7
 *
 * @param Text Sound Name
 * @desc 文字音效的文件名，默认Cursor1
 * @default Cursor1
 *
 * @param Text Sound Volume
 * @desc 文字音效的音量，默认100
 * @default 100
 *
 * @param Text Sound Pitch
 * @desc 文字音效的音调，默认100
 * @default 100
 *
 * @param Text Sound Pan
 * @desc 文字音效的偏移，默认0
 * @default 0
 */

(function() {


        var parameters = PluginManager.parameters('MessageTextSound');

        var text_current_frame      = 0;                                                   
        var text_se_interval        = (parseInt(parameters['Text Sound Interval']) || 7);       
        var text_se_object          = new Object();
        text_se_object.name         = String(parameters['Text Sound Name']       || "Cursor1"); 
        text_se_object.volume       = (parseInt(parameters['Text Sound Volume']) || 100);    
        text_se_object.pitch        = (parseInt(parameters['Text Sound Pitch'])  || 100);       
        text_se_object.pan          = (parseInt(parameters['Text Sound Pan'])    || 0);       

        var _Window_Message_updateShowFast = Window_Message.prototype.updateShowFast;
        Window_Message.prototype.updateShowFast = function() {
            _Window_Message_updateShowFast.call(this);
            if (!this._showFast && text_se_object.name != null && text_se_object.name != "") {
                if (text_current_frame >= text_se_interval) {
                    text_current_frame = 1;
                    AudioManager.playSe(text_se_object);
                } else {
                    text_current_frame = text_current_frame + 1;
                }
            }
        };


        var _Window_Message_newPage = Window_Message.prototype.newPage;
        Window_Message.prototype.newPage = function(textState) {
            _Window_Message_newPage.call(this, textState);
            text_current_frame = text_se_interval;
        };
        set_text_sound_name = function (text) {
            if (text == "" || text == null) { text_se_object.name = null; }
            else                            { text_se_object.name = text; }
        }
        set_text_sound_interval = function (interval) { text_se_interval = interval; }
        set_text_sound_volume = function (volume) { text_se_object.volume = volume; }
        set_text_sound_pitch = function (pitch) { text_se_object.pitch = pitch; }
        set_text_sound_pan = function (pan) { text_se_object.pan = pan; }

})();

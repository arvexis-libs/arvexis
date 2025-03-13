// TipsNoticeUtil.ts
import { GameEvent } from "../../common/config/GameEvent";
import { UIID } from "../../common/config/GameUIConfig";
import { oops } from "db://oops-framework/core/Oops";

export class TipsNoticeUtil {
    /**
     * 
     * @param text 
     * @param showBg true
     */
    public static PlayNotice(text: string, showBg: boolean = true, iconType: string = ""): void {
        // let result=oops.gui.has(UIID.UITips);

        // if (result) {
        //     oops.message.dispatchEvent(GameEvent.OnShowNoticeTips, [text, showBg]);
        // } else 
        // {
        //     oops.gui.open(UIID.UITips,[text, showBg]);

        // }
        oops.gui.toast(text, showBg, iconType);
    }
}

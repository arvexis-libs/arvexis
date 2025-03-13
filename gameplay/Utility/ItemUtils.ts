import { Texture2D } from "cc";
import { ImageAsset } from "cc";
import { SpriteFrame } from "cc";
import { Vec3 } from "cc";
import { tween } from "cc";
import { Sprite } from "cc";
import { TimerManager } from "db://oops-framework/core/common/timer/TimerManager";
import { UICallbacks } from "db://oops-framework/core/gui/layer/Defines";
import { oops } from "db://oops-framework/core/Oops";
import { tips } from "../../common/prompt/TipsManager";
import { UIID } from "../../common/config/GameUIConfig";

export class ItemUtils
{
    public static ShowGetAwardUI(ids:number[],nums:number[])
    {
        let operate: any = {
            ids: ids,
            nums: nums,
        };
        oops.gui.open(UIID.UICommonGetAwardView, operate, tips.getPopCommonEffect());
    }
	public static ShowGetAwardUI1( id:number, num:number,)
	{
		ItemUtils.ShowGetAwardUI([id], [num]);
	}
	public static  ShowMoneyAward(num:number)
	{
		ItemUtils.ShowGetAwardUI1(1, num);
	}
}
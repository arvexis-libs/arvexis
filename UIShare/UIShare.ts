import { _decorator, Component, Label, Button, Node } from 'cc';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { Utility } from '../gameplay/Utility/Utility';
import { ItemUtils } from '../gameplay/Utility/ItemUtils';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';

const { ccclass, property } = _decorator;

@ccclass('UIShare')
export class UIShare extends Component {
    @property(Label) private rewardTxt: Label = null!;
    @property(Button) private shareBtn: Button = null!;
    @property(Node) private finishGo: Node = null!;

    private get data() {return GameData.PlayerData.ShareData;}

    private clickShareTimeCache: number = 0;

    onLoad() {
        this.RefreshUI();
    }

    private RefreshUI() {
        this.rewardTxt.string = Utility.FormatBigNumber(this.data.GetShareReward());
        this.shareBtn.node.active = !this.data.IsTodayFinish;
        this.finishGo.active = this.data.IsTodayFinish;
    }

    private OnClickShare() {
        
        const reward = this.data.GetShareReward();
        GameData.PlayerData.GlobalData.AddWealth(reward);
        this.data.SetLastShareDate(oops.timer.getClientDate());
        this.RefreshUI();
        ItemUtils.ShowMoneyAward(reward);


        // this.clickShareTimeCache = oops.timer.getClientDate();

        // WXSDKTool.Share(1, () => {
        //     const elapsedTime = oops.timer.getClientDate() - this.clickShareTimeCache;
        //     if (elapsedTime >= 3000) { // 3
        //         const reward = this.data.GetShareReward();
        //         GameData.PlayerData.GlobalData.AddWealth(reward);
        //         this.data.SetLastShareDate(TimeUtility.GetDateTime());
        //         this.RefreshUI();

        //         ItemUtils.ShowMoneyAward(reward);
        //         TipsNoticeUtil.PlayNotice("ShareSuccess".GetLanguageString());
        //     } else {
        //         TipsNoticeUtil.PlayNotice("ShareFail".GetLanguageString());
        //     }
        // });
    }

    private OnClose() {
        oops.gui.remove(UIID.UIShare);
    }
}
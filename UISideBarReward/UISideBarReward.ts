import { Label } from 'cc';
import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { UIID } from '../common/config/GameUIConfig';
import { SdkManager } from '../../modules/sdk/SdkManager';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { TipsNoticeUtil } from '../gameplay/Utility/TipsNoticeUtil';
const { ccclass, property } = _decorator;

@ccclass('UISideBarReward')
export class UISideBarReward extends CCComp {

    @property(Label)
    private rewardStatusLabel: Label = null!;
    @property(Button)
    private rewardBtn: Button = null!;
    @property(Button)
    private closeBtn: Button = null!;

    onClickRewardBtn(){
        oops.gui.remove(UIID.UITTReward);

        if(this.rewardStatusLabel.string === ""){
            //
            GameData.PlayerData.GlobalData.AddWealth(50000);
            TipsNoticeUtil.PlayNotice("50000"); 
            oops.storage.set("tt_side_reward_status", "1");
        }
        else{
            SdkManager.inst.showSideBar();
        }
        
    }

    onClickCloseBtn(){
        oops.gui.remove(UIID.UITTReward);
    }

    protected onLoad(): void {
       let isClaim =  oops.storage.get("tt_side_reward_status", "");
       if(isClaim === ""){
            let launchParam = SdkManager.inst.getLaunchInfo();
            if(launchParam && launchParam.scene === "sidebar"){
                this.rewardStatusLabel.string = "";
            }
            else{
                this.rewardStatusLabel.string = "";
            }
            
        }
        else{
            this.rewardStatusLabel.string = "";
        }
    }

    reset(): void {
        
    }
}



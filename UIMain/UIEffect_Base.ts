import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { MagicBoxRewardType } from '../gameplay/GameDataModel/GameEnum';
import { HeroineDataManager } from './HeroineDataManager';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { TrMagicBoxRandom } from '../schema/schema';
const { ccclass, property } = _decorator;

@ccclass('UIEffect_Base')
export class UIEffect_Base extends CCComp {
    private _trMagicBoxRandom: TrMagicBoxRandom = null!;
    onAdded(args: any) {
        this._trMagicBoxRandom = args.trMagicBoxRandom;
    }
    start() {
        console.error("OOOOOOpen_Base");
        this.GiveReward(this._trMagicBoxRandom.Award1);
        this.GiveReward(this._trMagicBoxRandom.Award2);
        this.GiveReward(this._trMagicBoxRandom.Award3);
    }

    update(deltaTime: number) {
        
    }

    protected GiveReward(arrReward : number[]) { 
        let rewardType=arrReward[0]
        let rewardId=arrReward[1]
        let rewardValue=arrReward[2]
        switch (rewardType) {
            case MagicBoxRewardType.Item:
                //
                break;
            case MagicBoxRewardType.Identity:
                HeroineDataManager.Instance.GiveIdentity(rewardId)

                break;
            case MagicBoxRewardType.Currency:
                GameData.updateCurrency(rewardId,rewardValue)
                break;
                
            case MagicBoxRewardType.Property:
                HeroineDataManager.Instance.SetProp(rewardId,rewardValue)
                break;
                
            case MagicBoxRewardType.Exp:
                HeroineDataManager.Instance.AddExp(rewardValue)
                break;
                
            default:
                break;
        }
    }

    reset() {
        
    }

    BtnClose_Click() {
        oops.gui.remove(UIID.UIEffect_0);
    }
}



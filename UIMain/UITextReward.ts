import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { Label } from 'cc';
import { TrMagicBoxRandom } from '../schema/schema';
import ConfigManager from '../manager/Config/ConfigManager';
import { instantiate } from 'cc';
import { Sprite } from 'cc';
import { Utility } from '../gameplay/Utility/Utility';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { HeroineDataManager } from './HeroineDataManager';
import { MagicBoxRewardType } from '../gameplay/GameDataModel/GameEnum';
const { ccclass, property } = _decorator;

@ccclass('UITextReward')
export class UITextReward extends CCComp {
    @property(Node) LayoutContainer: Node = null!;
    @property(Node) RewardItem: Node = null!;
    @property(Label) TxtTitleDesc: Label = null!;

    private _trMagicBoxRandom: TrMagicBoxRandom= null!;
    onAdded(args: any) {
        this._trMagicBoxRandom = args.trMagicBoxRandom;
    }
    start() {
        this.TxtTitleDesc.string = this._trMagicBoxRandom.StrText;
        this.creatRewardItem(this._trMagicBoxRandom.Award1);
        this.creatRewardItem(this._trMagicBoxRandom.Award2);
        this.creatRewardItem(this._trMagicBoxRandom.Award3);

        this.scheduleOnce(() => {
            oops.gui.remove(UIID.UITextReward);
        }, 2)
    }

    update(deltaTime: number) {
        
    }

    reset() {

    }

    async creatRewardItem(reward : number[])
    {
        let r = this.getRewardData(reward)
        let rewardItem = instantiate(this.RewardItem);
        rewardItem.parent = this.LayoutContainer;
        rewardItem.active = true;
        let sprite = rewardItem.getChildByPath("Layout/Icon")?.getComponent(Sprite)
        let spF = await Utility.loadImage(r.iconName, "CommonRes");
        if (spF) {
            sprite!.spriteFrame = spF
        }

        let label = rewardItem.getChildByPath("Layout/RewardValue")?.getComponent(Label)!
        label.string = r.rewardValue.toString();

        let label2 = rewardItem.getChildByPath("Layout/RewardName")?.getComponent(Label)!
        label2.string = r.rewardName;
        this.giveReward(reward);
    }

    private giveReward(arrReward : number[]) { 
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

    getRewardData(arrReward:number[]):{iconName:string, rewardName:string, rewardValue:number}
    {
        let type =arrReward[0];
        let id =arrReward[1];
        let value =arrReward[2];

        switch (type) {
            case MagicBoxRewardType.Item:
                break;
            case MagicBoxRewardType.Identity:
                break;
            case MagicBoxRewardType.Currency:
                return {iconName:Utility.GetCurrencyIcon(id), rewardName:Utility.GetCurrencyName(id), rewardValue:value};
            case MagicBoxRewardType.Property:
                return {iconName:HeroineDataManager.Instance.GetPropIcon(id), rewardName:HeroineDataManager.Instance.GetPropName(id), rewardValue:value};
            case MagicBoxRewardType.Exp:
                return {iconName:HeroineDataManager.Instance.GetExpIcon(), rewardName:HeroineDataManager.Instance.GetExpName(), rewardValue:value};
            default:
                break;
        }

        return {iconName:"", rewardName:"", rewardValue:0};
    }
}

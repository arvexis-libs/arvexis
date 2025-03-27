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
    }

    private giveReward(rewardId: number, rewardValue: number) { 
        GameData.updateCurrency(rewardId, rewardValue);
    }

    getRewardData(arrReward:number[]):{iconName:string, rewardName:string, rewardValue:number}
    {
        let type =arrReward[0];
        let id =arrReward[1];
        let value =arrReward[2];

        switch (type) {
            case 1:
                break;
            case 2:
                break;
            case 3:
                return {iconName:Utility.GetCurrencyIcon(id), rewardName:Utility.GetCurrencyName(id), rewardValue:value};
            case 4:
                return {iconName:Utility.GetHeroineIcon(id), rewardName:Utility.GetHeroineName(id), rewardValue:value};
            case 5:
                return {iconName:Utility.GetExpIcon(), rewardName:Utility.GetExpName(), rewardValue:value};
            default:
                break;
        }

        return {iconName:"", rewardName:"", rewardValue:0};
    }
}

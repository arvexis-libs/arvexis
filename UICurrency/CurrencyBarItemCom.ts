import { NodeEventType, Sprite } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { GameEvent } from '../common/config/GameEvent';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { Util } from '../../modules/base/Util';
import { Utility } from '../gameplay/Utility/Utility';
import ConfigManager from '../manager/Config/ConfigManager';
import { SpriteFrame } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
const { ccclass, property } = _decorator;

@ccclass('CurrencyBarItemCom')
export class CurrencyBarItemCom extends CCComp {

    @property(Sprite)
    itemIcon:Sprite = null!
    @property(Label)
    itemCount:Label = null!

    mItemType = 0

    protected onLoad(): void {
        this.on(GameEvent.OnItemValueChanged, this.updateCount, this);
    }
    async show(itemType: number) {
        this.mItemType = itemType;
        let trItem = ConfigManager.tables.TbItem.get(itemType);
        let icon = trItem?.Icon;
        if(icon){
            let sp = await oops.res.loadAsync<SpriteFrame>("CommonRes", icon + "/spriteFrame");
            if(sp && this.isValid){
                this.itemIcon.spriteFrame = sp;
            }
        }
        this.updateCount();

        this.itemIcon.node.on(NodeEventType.TOUCH_END,()=>
        {
            Utility.OpenItemTips(itemType,this.itemIcon.node);
        });
    }

    updateCount(){
        const v = GameData.getCurrency(this.mItemType);
        this.itemCount.string = Utility.FormatBigNumber(v);
    }

    reset() {

    }
}



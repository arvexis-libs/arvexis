import { _decorator, Component, Node } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { UIID } from '../common/config/GameUIConfig';
import ConfigManager from '../manager/Config/ConfigManager';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { Button } from 'cc';
import { find } from 'cc';
import { Label } from 'cc';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { Utility } from '../gameplay/Utility/Utility';
import { Sprite } from 'cc';
import { GameEvent } from '../common/config/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('UIStoryLineSelect')
export class UIStoryLineSelect extends CCComp {

    @property({ type: Node })
    private content: Node = null!;
    @property({ type: Node })
    private item: Node = null!;

    @property({ type: Node })
    private closeBtn: Node = null!;
    start(): void {
        this.refresh();
    }
    protected onLoad(): void {
        this.closeBtn.on(Button.EventType.CLICK, this.onClose, this);
    }
    private onClose(): void {
        oops.gui.remove(UIID.UIStoryLineSelect)
    }
    
    reset(): void {
        
    }

    private async refresh(): Promise<void> {
        const cfgData = ConfigManager.tables.TbPlayer.getDataList();
        for (const data of cfgData) {
            const newNode = instantiate(this.item);
            newNode.parent = this.content;
            newNode.active = true;

            const itemName = find("name", newNode)?.getComponent(Label)!;
            itemName.string = data.Name;

            const lv = find("lv", newNode)?.getComponent(Label)!;
            lv.string = PlayerSystem.Instance.GetPlayerData(data.Id).level.toString();

            const icon = find("icon", newNode)?.getComponent(Sprite)!;
            let spF = await Utility.loadImage("Head/" + data.IconPath, "CommonRes");
            if (spF) {
                icon.spriteFrame = spF;
            }
            // oops.res.loadAsync<SpriteFrame>("CommonRes", "Head/" + data.IconPath + "/spriteFrame").then((sp)=>{
            //     if(this.isValid){
            //         icon.spriteFrame = sp;
            //     }
            // });

            const switchBtn = find("switchBtn", newNode)!;
            switchBtn.on(Button.EventType.CLICK, ()=>{
                oops.message.dispatchEvent(GameEvent.UIStoryLineRefresh, data.Id)
                oops.gui.remove(UIID.UIStoryLineSelect)
            }, this);
        }
    }
}



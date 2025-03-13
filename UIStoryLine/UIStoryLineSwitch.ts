import {
    Node, EventTouch, _decorator, Component, Label, Button, Vec3, Vec2, tween, Tween, UIOpacity,
    CCInteger, CCString, CCBoolean, CCFloat, log, error, input, NodePool, instantiate, Prefab, UITransform, director
} from "cc";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "db://assets/script/game/common/config/GameUIConfig";
import { GameData } from "db://assets/script/game/gameplay/GameDataModel/GameData";
import { PlayerSystem } from "db://assets/script/game/gameplay/Manager/PlayerSystem";
import { Utility } from "db://assets/script/game/gameplay/Utility/Utility";
import { GameEvent } from "../common/config/GameEvent";
import { Toggle } from "cc";
import { Sprite } from "cc";
import ConfigManager from "../manager/Config/ConfigManager";
import { ScrollView } from "cc";
import { find } from "cc";
import { SpriteFrame } from "cc";
import { Texture2D } from "cc";
import { ImageAsset } from "cc";
import { TrStoryLine } from "../schema/schema";
import { count } from "console";

const { ccclass, property } = _decorator;

/**  */
@ccclass('UIStoryLineSwitch')
export class UIStoryLineSwitch extends CCComp {

    @property({ type: Node })
    private content: Node = null!;
    @property({ type: Node })
    private item: Node = null!;

    @property({ type: Node })
    private closeBtn: Node = null!;

    reset(): void {

    }
    start(): void {
        this.refresh();
    }
    protected onLoad(): void {
        this.closeBtn.on(Button.EventType.CLICK, this.onClose, this);
    }
    private onClose(): void {
        oops.gui.remove(UIID.UIStoryLineSwitch)
    }

    private async refresh(): Promise<void> {
        const cfgData = ConfigManager.tables.TbPlayer.getDataList();
        for (const data of cfgData) {
            if (!PlayerSystem.Instance.PlayerIsUnlock(data.Id)) {
                continue;
            }

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
                oops.gui.remove(UIID.UIStoryLineSwitch)
            }, this);
        }
    }
}
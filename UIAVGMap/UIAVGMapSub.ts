import {
    Node, EventTouch, _decorator, Component, Label, Button, SpriteFrame, Vec3, Vec2, tween, Tween, UIOpacity,
    CCInteger, CCString, CCBoolean, CCFloat, log, error, input, NodePool, instantiate, Prefab, UITransform, director, Sprite
} from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { smc } from "db://assets/script/game/common/ecs/SingletonModuleComp";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "db://assets/script/game/common/config/GameUIConfig";
import { GameData } from "db://assets/script/game/gameplay/GameDataModel/GameData";
import { TapSystem } from "db://assets/script/game/gameplay/Manager/TapSystem";
import { PlayerSystem } from "db://assets/script/game/gameplay/Manager/PlayerSystem";
import { TaskSystem } from "db://assets/script/game/gameplay/Manager/TaskSystem";
import { FunctionOpenSystem } from "db://assets/script/game/gameplay/Manager/FunctionOpenSystem";
import { Utility } from "db://assets/script/game/gameplay/Utility/Utility";
import { GameEvent } from "../common/config/GameEvent";
import { ItemUtils } from "../gameplay/Utility/ItemUtils";
import { ADEnum } from "../gameplay/Manager/GameDot";
import { color } from "cc";
import { Color } from "cc";
import { TipsNoticeUtil } from "../gameplay/Utility/TipsNoticeUtil";
import ConfigManager from "../manager/Config/ConfigManager";

const { ccclass, property } = _decorator;

/**  */
@ccclass('UIAVGMapSub')
@ecs.register('UIAVGMapSub', false)
export class UIAVGMapSub extends CCComp {
    @property([Node])
    private buttonList: Node[] = [];

    private Id: number = 0;

    /**  */
    start() {
        // this.closeBtn.node.on('click', this.onClickClose, this);

    }
    protected onEnable(): void {
    }

    /**  ecs.Entity.remove(UIMakeMoneyRootViewComp)  */
    reset() {
    }

    onDestroy() {

    }

    private onClickClose() {
        oops.gui.remove(UIID.UIAVGMap);
    }


    private onClickTest1() {
        const cfg = ConfigManager.tables.TbAVGSceneGroup.get(10101)!;
        oops.gui.open(UIID.UIAVGScene, cfg.Initialscene);
    }

    private onClickTest2() {
        const cfg = ConfigManager.tables.TbAVGSceneGroup.get(10102)!;
        oops.gui.open(UIID.UIAVGScene, cfg.Initialscene);
    }


    public Init(id: number) {
        this.Id = id;
        const cfg = ConfigManager.tables.TbAVGMap.get(this.Id)!;
        for (let i = 0; i < cfg.ScenegroupId.length; i++) {
            this.initBtn(i, cfg.ScenegroupId[i]);
        }
    }

    private initBtn(i: number, id: number) {
        let btn = this.buttonList[i]!;
        const cfg = ConfigManager.tables.TbAVGSceneGroup.get(id)!;
        if (!cfg) {
            console.log(`[AVGMap] , .i:${i},id:${id}`);
            return;
        }
        // btn.node
        const label = btn.getChildByName('Layout')?.getChildByName('Label')?.getComponent(Label)!;
        if (!label) {
            console.log(`[AVGMap] label is null, i:${i}`);
        }
        label.string = cfg.Name;

        const sprite = btn.getChildByName('Layout')?.getChildByName('Sprite')?.getComponent(Sprite);

        let isUnlock = true;
        if (!isUnlock) {
            btn.active = false;
            return;
        }
        console.log(`[AVGMap] .i:${i},id:${id}, id:${cfg.Initialscene}`);

        btn.on(Button.EventType.CLICK, () => { 
            console.log(`[AVGMap] .i:${i},id:${id}, id:${cfg.Initialscene}`);
            oops.gui.open(UIID.UIAVGScene, cfg.Initialscene); 
        }, this);

        btn.active = true;
    }

    private refresh() {
    }

}


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
@ccclass('UIAVGScene')
@ecs.register('UIAVGScene', false)
export class UITapUp extends CCComp {
    @property(Button)
    private closeBtn: Button = null!;
    @property(Button)
    private testBtn: Button = null!;

    private Id: number = 0;
    onAdded(id: any) {
        this.Id = id;
        return true;
    }

    /**  */
    start() {
        this.closeBtn.node.on('click', this.onClickClose, this);
        this.testBtn.node.on('click', this.onClickTest, this);
    }
    protected onEnable(): void {
        this.refresh();
    }

    /**  ecs.Entity.remove(UIMakeMoneyRootViewComp)  */
    reset() {
    }

    onDestroy() {

    }

    private onClickClose() {
        oops.gui.remove(UIID.UIAVGScene);
    }

    private onClickTest() {
        oops.gui.remove(UIID.UIAVGScene);

        let nextId = 2;
        oops.gui.open(UIID.UIAVGScene, nextId);
    }

    private refresh() {
        if (this.Id == 0) {
            return;
        }

        const cfg = ConfigManager.tables.TbAVGScene.get(this.Id)!;

        
    }    
}


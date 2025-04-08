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
import { find } from "cc";

const { ccclass, property } = _decorator;

/**  */
@ccclass('UIAVGGoBtn')
@ecs.register('UIAVGGoBtn', false)
export class UITapUp extends CCComp {
    @property(Number)
    public Id: number = 0;

    @property(Node)
    private btn: Node = null!;

    /**  */
    start() {
        this.btn.on('click', this.onClick, this);
    }
    protected onEnable(): void {

        this.refresh();
    }

    /**  ecs.Entity.remove(UIMakeMoneyRootViewComp)  */
    reset() {
    }

    onDestroy() {

    }

    private refresh() {
        
    }


    private onClick() {
        oops.gui.remove(UIID.UIAVGScene);

        oops.gui.open(UIID.UIAVGScene, this.Id);
    }


}


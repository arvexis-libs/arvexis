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
@ccclass('UIAVGMap')
@ecs.register('UIAVGMap', false)
export class UIAVGMap extends CCComp {
    @property(Button)
    private closeBtn: Button = null!;
    @property(Button)
    private testBtn1: Button = null!;
    @property(Button)
    private testBtn2: Button = null!;

    private Id: number = 0;
    onAdded(id: any) {
        this.Id = id;
        return true;
    }

    /**  */
    start() {
        this.closeBtn.node.on('click', this.onClickClose, this);
        this.testBtn1.node.on('click', this.onClickTest1, this);
        this.testBtn2.node.on('click', this.onClickTest2, this);
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
}


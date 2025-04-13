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
import { UIAVGMapSub } from "./UIAVGMapSub";

const { ccclass, property } = _decorator;

/**  */
@ccclass('UIAVGMap')
@ecs.register('UIAVGMap', false)
export class UIAVGMap extends CCComp {
    @property(Node)
    private Root: Node = null!;
    @property(Button)
    private closeBtn: Button = null!;

    private go: Node = null!;
    private Id: number = 0;
    onAdded(id: any) {
        this.Id = id;
        return true;
    }

    /**  */
    start() {
        this.closeBtn.node.on('click', this.onClickClose, this);
        this.init();
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


    private async init() {
        if (this.Id == 0) {
            return;
        }
        const cfg = ConfigManager.tables.TbAVGMap.get(this.Id)!;

        let prb = await this.loadPrefab(cfg.Path);
        if (prb) {
            if (this.go != null) {
                this.go.destroy();
            }

            this.go = instantiate(prb);
            this.go.getComponent(UIAVGMapSub)!.Init(this.Id);
            this.Root.addChild(this.go);
        }
    }

    private async loadPrefab(urlPath: string): Promise<Prefab> {
        let go = await oops.res.loadAsync<Prefab>("UIAVGMap", "Prefab/Map/" + urlPath);
        return go;
    }
}


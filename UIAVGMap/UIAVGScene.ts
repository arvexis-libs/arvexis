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
import { StorySystem } from "../gameplay/Manager/StorySystem";

const { ccclass, property } = _decorator;

/**  */
@ccclass('UIAVGScene')
@ecs.register('UIAVGScene', false)
export class UIAVGScene extends CCComp {
    @property(Node)
    private Scene: Node = null!;
    @property(Button)
    private closeBtn: Button = null!;
    @property(Button)
    private backBtn: Button = null!;

    private go: Node = null!;
    private Id: number = 0;
    onAdded(id: any) {
        this.Id = id;
        return true;
    }

    /**  */
    start() {
        this.closeBtn.node.on('click', this.onClickClose, this);
        this.backBtn.node.on('click', this.onClickBack, this);
        oops.message.on(GameEvent.UIAVGSceneInit, this.UIAVGSceneInit, this);

        this.init();
    }

    private UIAVGSceneInit(a: any, id: any) {
        this.Id = id;
        this.init();
    }

    protected onEnable(): void {
    }

    /**  ecs.Entity.remove(UIMakeMoneyRootViewComp)  */
    reset() {
    }

    onDestroy() {
        oops.message.off(GameEvent.UIAVGSceneInit, this.UIAVGSceneInit, this);
    }

    private onClickClose() {
        oops.gui.open(UIID.UIAVGCloseWindow);
    }

    private onClickBack() {
        oops.gui.remove(UIID.UIAVGScene);
    }

    private async init() {
        if (this.Id == 0) {
            return;
        }
        const cfg = ConfigManager.tables.TbAVGScene.get(this.Id)!;
        
        let prb = await this.loadPrefab(cfg.Path);
        if (prb) {
            if (this.go != null) {
                this.go.destroy();
            }

            this.go = instantiate(prb);
            this.Scene.addChild(this.go);
        }

        // (/)
        if (!this.EventStory()) {
            if (!this.EventGame()) {
                
            }
        }
    }    

    private async loadPrefab(urlPath: string):Promise<Prefab>
    {
        let go = await oops.res.loadAsync<Prefab>("UIAVGMap", "Prefab/Scene/" + urlPath);
        return go;
    }


    private EventStory(): boolean {
        const cfg = ConfigManager.tables.TbAVGScene.get(this.Id)!;
        if (cfg.EventStoryId.length <= 0) {
            return false;
        }
        // 
        let storyId = -1;

        storyId = 0;
        if (storyId < 0) {
            return false;
        }

        // ()
        console.error("TODO: () ", cfg.EventStoryId[storyId]);
        StorySystem.Instance.Play(cfg.EventStoryId[storyId]);
        return true;
    }

    private EventGame(): boolean {
        const cfg = ConfigManager.tables.TbAVGScene.get(this.Id)!;
        if (cfg.EventGameId.length <= 0) {
            return false;
        }
        // 
        let gameId = -1;

        gameId = 0;
        if (gameId < 0) {
            return false;
        }

        // ()
        console.error("TODO: () ", cfg.EventGameId[gameId]);
        return true;
    }
}


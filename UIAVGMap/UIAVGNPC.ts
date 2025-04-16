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
import { StorySystem } from "../gameplay/Manager/StorySystem";
import { Skeleton } from "cc";
import { sp } from "cc";

const { ccclass, property } = _decorator;

/**  */
@ccclass('UIAVGNPC')
@ecs.register('UIAVGNPC', false)
export class UIAVGNPC extends CCComp {
    @property(Number)
    public Id: number = 0;

    @property(Node)
    private role: Node = null!;
    @property(Node)
    private choice: Node = null!;
    @property(Node)
    private btnBase: Node = null!;
    @property(Node)
    private Spine: Node = null!;

    /**  */
    start() {
        this.role.on('click', this.onClickRole, this);

        this.choice.active = false;
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
        if (this.Id == 0) {
            return;
        }

        const cfg = ConfigManager.tables.TbAVGNPC.get(this.Id)!;
        for (let i = 0; i < cfg.ChoiceStory.length; i++) {
            this.refreshBtn(i);
        }

        this.Spine.children.forEach(element => {
            let skeleton = element.getComponent(sp.Skeleton)!;
            skeleton.setAnimation(0, "idle", true);
            // element.active = false;
        });
    }

    private refreshBtn(id: number) {
        let btn = instantiate(this.btnBase);
        btn.parent = this.btnBase.parent;
        btn.active = true;
        const cfg = ConfigManager.tables.TbAVGNPC.get(this.Id)!;

        btn.on(Button.EventType.CLICK, () => { this.OnChoice(cfg.ChoiceStory[id]); }, this);

        const itemName = find("name", btn)?.getComponent(Label)!;
        itemName.string = cfg.ChoiceText[id];

    }



    private onClickRole() {
        const cfg = ConfigManager.tables.TbAVGNPC.get(this.Id)!;
        if (cfg.ChoiceStory.length == 0) {
            return;
        }

        this.choice.active = !this.choice.active;
    }


    private OnChoice(id: number): void {
        StorySystem.Instance.Play(id);

    }


}


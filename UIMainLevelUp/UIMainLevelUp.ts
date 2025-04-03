import { _decorator } from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { Label, Animation, Node } from "cc";
import { HeroineDataManager } from "db://assets/script/game/UIMain/HeroineDataManager";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "db://assets/script/game/common/config/GameUIConfig";
import { AnimationUtil } from "db://assets/script/modules/Utils/NodeExtend/AnimationUtil";
import ConfigManager from "db://assets/script/game/manager/Config/ConfigManager";
import { LevelData } from "./LevelData";

const { ccclass, property } = _decorator;

/**  */
@ccclass('UIMain/LevelUp')
@ecs.register('UIMainLevelUp', false)
export class UIMainLevelUp extends CCComp {
    @property({type: Label, displayName: ""})
    leftLvLabel: Label = null!;

    @property({type: Label, displayName: ""})
    rightLvLabel: Label = null!;

    @property({type: Label, displayName: ""})
    toLvLabel: Label = null!;

    @property({type: AnimationUtil, displayName: ""})
    animationUtil: AnimationUtil = null!;

    @property({type: Boolean, displayName: ""})
    enableClose: boolean = false;

    @property({type: Node, displayName: ""})
    dataNode: Node = null!;

    onAdded(_isClick: boolean) {


    }

    start() {
        let toLv = HeroineDataManager.Instance.getLvCur();
        const minLv = 2; // , 1
        if (toLv < minLv) toLv = minLv;
        this.leftLvLabel.string = (toLv - 1).toString();
        this.rightLvLabel.string = toLv.toString();
        this.toLvLabel.string = toLv.toString();
        this.animationUtil.onTriggerEvent = this.onTriggerEvent.bind(this);
        this.enableClose = false;
        // data
        this.refreshData(toLv);
        // animation
        const animation = this.animationUtil.node.getComponent(Animation)!;
        animation.play();
        // animation.on(Animation.EventType.FINISHED, this.onTriggerEvent, this);
    }
    /**
     * 
     * @param lv  
     */
    refreshData(lv: number) {
        let toLvConfig = ConfigManager.tables.TbLevel.get(lv)!;
        let preLvConfig = ConfigManager.tables.TbLevel.get(lv - 1)!;
        for (let i = 0; i < this.dataNode.children.length; i++) {
            let child = this.dataNode.children[i];
            let data = child.getComponent(LevelData)!;
            data.refresh(preLvConfig, toLvConfig);
        }
    }


    reset() {
    }

    onDestroy() {
        this.animationUtil.onTriggerEvent = null!;
    }

    onClose() {
        if (!this.enableClose) return;
        oops.gui.remove(UIID.UIMainLevelUp);
    }

    onTriggerEvent(node: Node, event: string) {
        if (event === "step4") {
            this.enableClose = true;
        }
        console.log(`[LevelUp]onTriggerEvent: ${event}, enableClose: ${this.enableClose}`);
    }
}
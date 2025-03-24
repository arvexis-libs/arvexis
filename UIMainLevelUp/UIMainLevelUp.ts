import { _decorator } from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { Label, Animation } from "cc";
import { HeroineDataManager } from "db://assets/script/game/UIMain/HeroineDataManager";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "db://assets/script/game/common/config/GameUIConfig";
import { AnimationUtil } from "db://assets/script/modules/Utils/NodeExtend/AnimationUtil";

const { ccclass, property } = _decorator;

/**  */
@ccclass('UIMainLevelUp')
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
    

    onAdded(_isClick: boolean) {


    }

    start() {
        const toLv = HeroineDataManager.Instance.getLvCur();
        this.leftLvLabel.string = (toLv - 1).toString();
        this.rightLvLabel.string = toLv.toString();
        this.toLvLabel.string = toLv.toString();
        this.animationUtil.onTriggerEvent = this.onTriggerEvent.bind(this);
        this.enableClose = false;
        const animation = this.animationUtil.node.getComponent(Animation)!;
        animation.play();
        // animation.on(Animation.EventType.FINISHED, this.onTriggerEvent, this);
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

    onTriggerEvent(event: string) {
        if (event === "step4") {
            this.enableClose = true;
        }
        console.log(`[LevelUp]onTriggerEvent: ${event}, enableClose: ${this.enableClose}`);
    }
}
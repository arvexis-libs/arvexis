import {
    Node, EventTouch, _decorator, Component, Button, Vec3, Vec2, tween, Tween, UIOpacity,
    CCInteger, CCString, CCBoolean, CCFloat, log, error, input, NodePool, instantiate, Prefab, UITransform, director
} from "cc";
import { CCComp } from "db://oops-framework/module/common/CCComp";
const { ccclass, property } = _decorator;

/**  */
@ccclass('UIStoryMask')
export class UIStoryMask extends CCComp {
    reset(): void {

    }
    start(): void {
    }
    protected onLoad(): void {
        
    }

    onAdded(data: any) {
        let callback = data.callback;
        if (callback) {
            callback();
        }
    }

    onDestroy() {
    }
}
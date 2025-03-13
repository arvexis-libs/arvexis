import { tween } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { UIID } from '../common/config/GameUIConfig';
import { GameEvent } from '../common/config/GameEvent';
const { ccclass, property } = _decorator;

/**
 *  
 */
@ccclass('UITransformWaitComp')
export class UITransformWaitComp extends CCComp {

    private callback?: Function;

    reset(): void {

    }

    start() {

    }

    protected onEnable(): void {
        this.on(GameEvent.UITransformToCloseEvent, this.playFadeOut, this);
        this.playFadeIn();
    }

    protected onDisable(): void {
        this.off(GameEvent.UITransformToCloseEvent);
    }

    private playFadeIn() {
        tween(this.node).to(0.25, { opacity: 255 }).start();
        this.scheduleOnce(()=>{
            this.callback && this.callback();
        }, 0.25);
    }

    private playFadeOut(){
        tween(this.node).to(0.25, { opacity: 0 }).start();
        this.scheduleOnce(()=>{
            oops.gui.remove(UIID.UITransformWait);
        }, 0.25);
    }

    update(deltaTime: number) {
        
    }

    onAdded(args: any) {
        this.callback = args.callback as Function;
    }

}


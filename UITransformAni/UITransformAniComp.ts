import { Animation } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('UITransformAniComp')
export class UITransformAniComp extends CCComp {

    mPlayAniName:string = '';
    private time: number = 0;
    private callback?: Function;

    @property(Animation)
    XuanJueAni:Animation = null!;

    @property(Animation)
    HeiPingZhuanChang:Animation = null!;

    private scheduleOnceFunction: Function = null!;

    private isOnce = true;
    start() {
        this.scheduleOnceFunction = () => {
            if  (!this.isOnce) return;

            this.isOnce = false;
            this.callback && this.callback();
            oops.gui.remove(UIID.UITransformAni);
            this.unscheduleAllCallbacks();
        }

        switch (this.mPlayAniName) {
            case 'XuanJueAni':
                this.XuanJueAni.node.active = true;
                this.XuanJueAni.play("Effect_XuanJueZhuanChang");

                let dur = this.XuanJueAni.defaultClip?.duration;
                this.scheduleOnce(this.scheduleOnceFunction , dur);
                // this.scheduleOnce(() => {
                //     oops.gui.remove(UIID.UITransformAni);
                // },dur);
                break;

            case 'HeiPingZhuanChang':
                this.HeiPingZhuanChang.node.active = true;
                this.HeiPingZhuanChang.play("Effect_HeiPingZhuanChang_01");

                let dur2 = this.HeiPingZhuanChang.defaultClip?.duration;

                this.scheduleOnce(this.scheduleOnceFunction ,dur2);
                break;   
        }

        this.scheduleOnce(this.scheduleOnceFunction, this.time)
    }

    update(deltaTime: number) {
        
    }

    reset(): void {
        
    }

    onAdded(args: any) {
        this.mPlayAniName = args.name as string;
        this.time = args.time as number;
        this.callback = args.callback as Function;
    }

    protected onLoad(): void {


    }
}



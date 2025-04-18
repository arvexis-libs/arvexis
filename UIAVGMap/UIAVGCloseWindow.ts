import { _decorator, Component, Node } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('UIAVGCloseWindow')
export class UIAVGCloseWindow extends CCComp {

    @property({ type: Node })
    private btn1: Node = null!;
    @property({ type: Node })
    private btn2: Node = null!;
    @property({ type: Node })
    private btn3: Node = null!;

    reset(): void {
    }

    start() {
        this.btn1.on('click', this.onClick1, this);
        this.btn2.on('click', this.onClick2, this);
        this.btn3.on('click', this.onClick3, this);

    }

    private onClick1() {
        oops.gui.remove(UIID.UIAVGCloseWindow);
        oops.gui.remove(UIID.UIAVGScene);
        oops.gui.remove(UIID.UIAVGMap);
        //  
    }

    private onClick2() {
        oops.gui.remove(UIID.UIAVGCloseWindow);
        oops.gui.remove(UIID.UIAVGScene);
        oops.gui.remove(UIID.UIAVGMap);
        
    }

    private onClick3() {
        oops.gui.remove(UIID.UIAVGCloseWindow);
        
    }

}
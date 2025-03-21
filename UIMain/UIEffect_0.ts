import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('UIEffect_0')
export class UIEffect_0 extends CCComp {
    start() {

    }

    update(deltaTime: number) {
        
    }

    reset() {
        
    }

    BtnClose_Click() {
        oops.gui.remove(UIID.UIEffect_0);
    }
}



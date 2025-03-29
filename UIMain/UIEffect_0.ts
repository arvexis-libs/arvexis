import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { UIEffect_Base } from './UIEffect_Base';
const { ccclass, property } = _decorator;

@ccclass('UIEffect_0')
export class UIEffect_0 extends UIEffect_Base {
    start() {
        console.error("OOOOOOpen_0");
        super.start();
    }

    update(deltaTime: number) {
        
    }

    reset() {
        
    }

    BtnClose_Click() {
        oops.gui.remove(UIID.UIEffect_0);
    }
}



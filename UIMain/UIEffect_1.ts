import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { UIEffect_Base } from './UIEffect_Base';
const { ccclass, property } = _decorator;

@ccclass('UIEffect_1')
export class UIEffect_1 extends UIEffect_Base {
    start() {

    }

    update(deltaTime: number) {
        
    }

    reset() {
        
    }
    
    BtnClose_Click() {
            oops.gui.remove(UIID.UIEffect_1);
    }
}



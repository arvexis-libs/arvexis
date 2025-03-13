import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { ConstellationTool } from './ConstellationTool';
import ConfigManager from '../manager/Config/ConfigManager';
import { Label } from 'cc';
import { Sprite } from 'cc';
import { ConditionState } from '../gameplay/GameDataModel/ConstellationData';
import { changeSpriteImage } from '../common/UIExTool';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { UITransform } from 'cc';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { GameEvent } from '../common/config/GameEvent';
import { ProgressBar } from 'cc';
import { RichText } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIConstellationLevelUp')
export class UIConstellationLevelUp extends CCComp {

    @property(Node)
    effectNode: Node = null!;

    
    private _onCloseCall: Function | null = null;
    reset(): void {
    }


    /**
     * 
     * @param args  roleId 
     * starId
     * @returns 
     */
    onAdded(args: any) {        
        
        this.effectNode.active = false;
        this._updateInfo();
        return true;
    }


    protected start(): void {
        this._updateInfo();
    }

    private _updateInfo() {
        this.labDesc.string = this._showContent;
        if(this._onCloseCall == null) {
            this._onCloseCall = this.onClose.bind(this);
        }
        this.effectNode.active = true;
        this.unschedule(this._onCloseCall);
        this.scheduleOnce(this._onCloseCall, 1); 
    }

    onClose() {
        this.effectNode.active = false;
        oops.gui.remove(UIID.UIConstellationLevelUp);
    }
}



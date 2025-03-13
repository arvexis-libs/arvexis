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

@ccclass('UIConstellationTips')
export class UIConstellationTips extends CCComp {

    @property(Label)
    labDesc: Label = null!;

    private _showContent: string = "";
    
    private _onClickCall: Function | null = null;
    reset(): void {
    }


        /**
     * 
     * @param args  roleId 
     * starId
     * @returns 
     */
    onAdded(args: any) {        
        this._showContent = args ?? "";
        this._updateInfo();
        return true;
    }


    protected start(): void {
        this._updateInfo();
    }

    private _updateInfo() {
        this.labDesc.string = this._showContent;
        if(this._onClickCall == null) {
            this._onClickCall = this.onClick.bind(this);
        }
        this.unschedule(this._onClickCall);
        this.scheduleOnce(this._onClickCall, 1); 
    }

    onClick() {
        oops.gui.remove(UIID.UIConstellationTips);
    }
}



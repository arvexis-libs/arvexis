import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { GameData } from '../gameplay/GameDataModel/GameData';
const { ccclass, property } = _decorator;

@ccclass('UIConstellationNew')
export class UIConstellationNew extends CCComp {

    @property(Label)
    labDesc: Label = null!;


    private _laterCallCloseCallback: Function = null!;
    // private _clickCd: number = 0;
    reset(): void {
    }

    protected onLoad(): void {        
        this._laterCallCloseCallback = this._laterCallClose.bind(this);
    }

    // protected update(dt: number): void {
    //     if(this._clickCd > 0) {
    //         this._clickCd -= dt;
    //     }
    // }

    start() {
        oops.gui.openAsync(UIID.UIConstellationMain);
        // this._clickCd = 0.5;
        // GameData.PlayerData.ConstellationData.IsFirstUnlock = true;
        this.unschedule(this._laterCallCloseCallback);
        this.scheduleOnce(this._laterCallCloseCallback, 0.8);
    }

    public onClickClose() {
        // if(this._clickCd > 0) {
        //     return;
        // }
        // oops.gui.remove(UIID.UIConstellationNew);
    }

    private _laterCallClose() {
        oops.gui.remove(UIID.UIConstellationNew);

    }
}



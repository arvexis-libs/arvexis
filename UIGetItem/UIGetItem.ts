import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import ConfigManager from '../manager/Config/ConfigManager';
import { ConditionState } from '../gameplay/GameDataModel/ConstellationData';
import { StorySystem } from '../gameplay/Manager/StorySystem';
import { Label } from 'cc';
import { RichText } from 'cc';
import { Button } from 'cc';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { Utility } from '../gameplay/Utility/Utility';
import { Sprite } from 'cc';
import { UIHome } from '../UIHome/UIHome';
import { TrAudio } from '../schema/schema';
const { ccclass, property } = _decorator;

@ccclass('UIGetItem')
export class UIGetItem extends CCComp {

    private closeUIList: UIID[] = [];
    
    onAdded(args: any) {        
        this.closeUIList = args;
    }

    start() {
        let tb = ConfigManager.tables.TbAudio.get(2058);
        if (tb) {
            oops.audio.playEffect(tb?.Resource, "Audios");
        }
        
        this.Refresh();
    }


    private Refresh() {

    }

    reset(): void {
    }


    public onClickGoTo() {
        let tb = ConfigManager.tables.TbAudio.get(2004);
        if (tb) {
            oops.audio.playEffect(tb?.Resource, "Audios");
        }

        for (let i = 0; i < this.closeUIList.length; i++) {
            oops.gui.remove(this.closeUIList[i]);
        }
        oops.gui.remove(UIID.UIGetItem);
        oops.gui.openAsync(UIID.UIBigCityMap);
    }

    onClickClose() {
        oops.gui.remove(UIID.UIGetItem);
    }
}



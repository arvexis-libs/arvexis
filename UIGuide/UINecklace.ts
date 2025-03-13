import { _decorator, Component, UITransform, Node, EventTouch, Vec2, Vec3 } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import ConfigManager from '../manager/Config/ConfigManager';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { Utility } from '../gameplay/Utility/Utility';
import { debug, error } from 'console';
import { Sprite } from 'cc';
import { instantiate } from 'cc';
import { Button } from 'cc';
import { Label } from 'cc';
import { TrRhythmGameGK } from '../schema/schema';
import { math } from 'cc';
import { GameEvent } from '../common/config/GameEvent';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { MiniGameData } from '../gameplay/GameDataModel/MiniGameData';
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
import { GuideManager } from './GuideManager';
import { UIHome } from '../UIHome/UIHome';
const { ccclass, property } = _decorator;

@ccclass('UIGuide')
export class UIGuide extends CCComp 
{
    @property(Button)
    CrossButton:Button=null!;
    @property(Button)
    ArrBtnGuide: Button[] = []!;
    @property(Node)
    ArrNodeGuideTakeUp: Node[] = []!;//


    protected onLoad(): void {
    }

    onAdded(data: any) {

    }
    start() {
        UIMusicManager.inst.playUIMusic(UIID.UINecklace, 3011,true);
        GuideManager.Instance.TryShowGuide(1010, this.ArrBtnGuide, () => {}, ()=>{},()=>{},[],this.ArrNodeGuideTakeUp);
    }

    CrossButton_click() {
        UIMusicManager.inst.StopMusic(3011)
        let tb = ConfigManager.tables.TbAudio.get(2047);
        if (tb) {
            oops.audio.playEffect(tb?.Resource, "Audios");
        }

        GuideManager.Instance.FinishGuide();
        GuideManager.Instance.TryShowGuide(1015, null!, () => { }, () => {});
        this.scheduleOnce(()=>{
            oops.gui.remove(UIID.UINecklace);
        },0.1)
    }

    reset(): void {

    }
}



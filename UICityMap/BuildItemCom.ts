import { _decorator, Component, Node } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { TrCityMapBuild } from '../schema/schema';
import { tips } from '../common/prompt/TipsManager';
import { oops } from 'db://oops-framework/core/Oops';
import { IBigCityEvent } from '../gameplay/GameDataModel/BigCityMapData';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { AvatorItemCom } from './AvatorItemCom';
import { GameEvent } from '../common/config/GameEvent';
import { Label } from 'cc';
import ConfigManager from '../manager/Config/ConfigManager';
import { UIID } from '../common/config/GameUIConfig';
import { GuideManager } from "../UIGuide/GuideManager";
import { GameData } from '../gameplay/GameDataModel/GameData';
const { ccclass, property } = _decorator;

@ccclass('BuildItemCom')
export class BuildItemCom extends CCComp {

    @property(Number)
    public BuildId:number = 0;
    @property(Node)
    public AvatorHolder:Node = null!;
    @property(Label)
    public buildName:Label = null!;

    private avatorItemCom:AvatorItemCom | null = null;

    private eventInfo:IBigCityEvent | null = null;

    start() {
        let buildInfo = ConfigManager.tables.TbCityMapBuild.get(this.BuildId) as TrCityMapBuild;
        this.buildName.string = buildInfo.Name;
    }

    update(deltaTime: number) {
        
    }
    reset(): void {
        
    }

    showEvent(eventInfo:IBigCityEvent){
        this.eventInfo = eventInfo;
        //this.AvatorHolder.removeAllChildren();
    }

    onClickBuild(){
        if (this.BuildId == 3) {
            GuideManager.Instance.FinishGuide();
        }
        this.dispatchEvent(GameEvent.OnClickMapBuild, this.eventInfo?.buildId);

        if(this.BuildId == 11)
        {
            if(GameData.GetGuideStep() >= 2010){
                oops.gui.openAsync(UIID.UIConstellationMain);
            }
            else{
                oops.gui.toast("");
            }
        }
        else if(this.eventInfo == null){
            oops.gui.toast("");
        }
    }
    onScrollView(){
        this.avatorItemCom?.showExplanInfo(false);
        this.avatorItemCom?.refreshPosition();
    }
}



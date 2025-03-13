import { oops } from "db://oops-framework/core/Oops";
import ConfigManager from "../../manager/Config/ConfigManager";
import { GameEvent } from "../../common/config/GameEvent";
import { UIMainVideoComp } from "../../UIMainVideo/UIMainVideoComp";
import { GameData } from "../GameDataModel/GameData";
import { PlotSegType } from "./StorySystem";


export class PlotMgr{
    private static _instance: PlotMgr
    public static get inst(): PlotMgr{
        if(!this._instance){
            this._instance = new PlotMgr()
        }
        return this._instance
    }

    mCurPlotId:number = 0;
    mCurPlotSegIndex :number = 0;
    mCurPlotSegArray:number[] = [];

    startPlot(plotId:number){
        this.mCurPlotId = plotId;
        let plotT = ConfigManager.tables.TbPlot.get(plotId);
        if(!plotT){
            console.error("PlotMgr: plotId is not exist",plotId);
            return;
        }

        this.mCurPlotSegArray = plotT.PlotSeg;
        this.mCurPlotSegIndex = 0;

        this.playPlotSeg();
    }

    playPlotSeg(){
        let segId = this.mCurPlotSegArray[this.mCurPlotSegIndex];
        let segT = ConfigManager.tables.TbPlotSeg.get(segId);
        if(!segT){
            console.error("PlotMgr: segId is not exist",segId);
            return;
        }
        switch(segT.SegType){
            case PlotSegType.PlayDuiHua:
                this.playTalk(parseInt(segT.Param1));
                break;
            case PlotSegType.PlayVideo:
                this.playVideo(parseInt(segT.Param1));
                break;
            case PlotSegType.OpenGame:
                this.openGame(parseInt(segT.Param1));
                break;
            case PlotSegType.SelectOption:
                this.showSelectOption(parseInt(segT.Param1));
                break;
            default:
                console.error("PlotMgr: segType is not exist",segT.SegType);
                break;
        }
    }

    onPlayPlotSegEnd(){
        this.mCurPlotSegIndex ++;
        if(this.mCurPlotSegIndex >= this.mCurPlotSegArray.length){
            //
        }
        else{
            this.playPlotSeg();
        }
    }

    playTalk(talkId:number){

        oops.message.dispatchEvent(GameEvent.OnShowTalk, {Id : talkId});
    }

    playVideo(videoId:number){
        UIMainVideoComp.getInstance().playUrl(videoId, false);
    }

    openGame(gameId:number){

    }

    showSelectOption(selectId:number){

    }
}
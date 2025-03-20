import { oops } from "db://oops-framework/core/Oops";
import { GameData } from "../GameDataModel/GameData";
import { CharacterAttribute } from "../GameDataModel/GameEnum";
import { TaskType } from "../GameDataModel/TaskType";
import { GameHelper } from "../GameTool/GameHelper";
import { PlayerSystem } from "./PlayerSystem";
import { GameEvent } from "../../common/config/GameEvent";
import ConfigManager from "../../manager/Config/ConfigManager";
import { UIMainVideoComp } from "../../UIMainVideo/UIMainVideoComp";
import { UIID } from "../../common/config/GameUIConfig";
import { SdkManager } from "../../../modules/sdk/SdkManager";
import { Main } from "../../../Main";
import { FunctionOpenSystem } from "./FunctionOpenSystem";
import { TERRAIN_SOUTH_INDEX } from "cc";
import { GameDot } from "./GameDot";

export enum PlotSegType {
    NextStory = 0,
    PlayDuiHua = 1,
    PlayVideo = 2,
    OpenGame = 3,
    SelectOption = 4
}

/// 
export class StorySystem {
    private static _instance: StorySystem;
    public static get Instance(): StorySystem {
        return this._instance || (this._instance = new StorySystem());
    }

    public Init(): void {
        oops.message.on(GameEvent.StoryPlayOver, this.StoryPlayOver, this);
        oops.message.on(GameEvent.OnTalkReadyClose, this.OnTalkReadyClose, this);
    }

    private lastPlotSegType: PlotSegType = PlotSegType.NextStory;

    public cfgId: number = 0;
    private roleId: number = 0;
    private curIndex: number = 0;
    private endIndex: number = 0;
    private curElementList: number[][] = [];
    public isPlaying: boolean = false;
    private curCallback: () => void = null!;
    private curAwardType: number[] = [];
    private curAwardValue: number[] = [];
    private ElementType : number = 0;
    private startDate: number = 0;
    public isGameType: boolean = false;
    public unresolvedId: number = 0; // Id
    public unresolveding: boolean = false; //  
    private loadMask: boolean = false; //  
    public isInStoryReward: boolean = false; //  
    public isShowUIConstellationNotice: boolean = false; //  
    public roleIdUIConstellationNotice: number = 0; // roleId
    private lastTalkId: number = 0;
    
    public showMask(callBack:Function | null = null){
        
        if(oops.gui.has(UIID.UIStoryMask, true)){
            oops.gui.show(UIID.UIStoryMask, true);
            callBack?.();
        }else{
            oops.gui.openAsync(UIID.UIStoryMask).then(() => {
                callBack?.();
            });
        }
    }

    public hideMask(){
        oops.gui.hide(UIID.UIStoryMask);
    }

    public ForceOver(){
        if (!this.isPlaying) return;
        console.log(" ForceOver " + this.cfgId);

        //SdkManager.inst.event("story_look", { id: this.cfgId, state: 2});

        this.isPlaying = false;
        this.lastTalkId = 0;

        this.hideMask();

        oops.message.dispatchEvent(GameEvent.UIStoryKilledEvent, {cfgId:this.cfgId, roleId: this.roleId});
    }

    public Over(closeMask : boolean = true): void {
        if (!this.isPlaying) return;
        console.log(" Over " + this.cfgId);
        //SdkManager.inst.event("story_look", { id: this.cfgId, state: 1});
        GameDot.Instance.StoryLookDot(this.cfgId, 1);
        this.lastTalkId = 0;

        if(closeMask) 
            this.hideMask();

        this.isPlaying = false;
        GameData.PlayerData.GlobalData.StoryState.set(this.cfgId, true);
        GameData.PlayerData.GlobalData.AddStoryPlayCount(this.roleId);
        
        // 
        oops.message.dispatchEvent(GameEvent.UIStoryLineRefresh);
        // 
        oops.message.dispatchEvent(GameEvent.UIStoryCompleteEvent, {cfgId:this.cfgId, roleId: this.roleId});


        SdkManager.inst.event("mapstory_end_times", { userid: PlayerSystem.Instance.CurPlayId, mapstory_end_times: 1});
        let diffSeconds = (Date.now() - this.startDate) / 1000;
        if(!this.isGameType){ 
            // GameData.PlayerData.GlobalData.DotStoryAllTimeToday1++;
            // GameData.PlayerData.GlobalData.DotStoryDiffSecondsToday1 += diffSeconds;
            // diffSeconds = GameData.PlayerData.GlobalData.DotStoryDiffSecondsToday1;
            // diffSeconds = Math.floor(diffSeconds / GameData.PlayerData.GlobalData.DotStoryAllTimeToday1 / 1000);
            SdkManager.inst.event("mapstory_time", {userid: PlayerSystem.Instance.CurPlayId, mapstory_time: Math.ceil(diffSeconds)});
        }
        else{ 
            // GameData.PlayerData.GlobalData.DotStoryAllTimeToday1++;
            // GameData.PlayerData.GlobalData.DotStoryDiffSecondsToday2 += diffSeconds;
            // diffSeconds = GameData.PlayerData.GlobalData.DotStoryDiffSecondsToday2;
            // diffSeconds = Math.floor(diffSeconds / GameData.PlayerData.GlobalData.DotStoryAllTimeToday2 / 1000);
        }

        if(this.isShowUIConstellationNotice){
            if(oops.gui.has(UIID.UIConstellationNotice)) {
                oops.message.dispatchEvent(GameEvent.ConstellationNotice, {roleId: this.roleIdUIConstellationNotice});
            }
            else {
                oops.gui.open(UIID.UIConstellationNotice, {roleId: this.roleIdUIConstellationNotice});
            }
            this.isShowUIConstellationNotice = false;
            this.roleIdUIConstellationNotice = 0;   
        }

        //
        if (this.curAwardType.length <= 0) 
        {
            FunctionOpenSystem.Instance.CheckCondition();
        }

        if(oops.gui.has(UIID.TalkView)){
            oops.gui.remove(UIID.TalkView);
        }
    }

    public Play(id: number, callback: () => void = null!,roleId:number=0): void {
        // console.error("Play " + id);
        const cfg = ConfigManager.tables.TbPlot.get(id);
        if (!cfg) return;
        if (this.isPlaying) return;
        console.log(" Play " + id);
        oops.gui.ClearWaitUI();

        // if(!this.loadMask) oops.gui.open(UIID.UIStoryMask);
        // else oops.gui.show(UIID.UIStoryMask);
        // console.error("open UIStoryMask");
        this.loadMask = true;
        this.lastTalkId = 0;
        
        GameData.PlayerData.GlobalData.DotStoryAllTime++;
        SdkManager.inst.event("mapstorytimes", { userid: PlayerSystem.Instance.CurPlayId, mapstorytimes: 1});
        //SdkManager.inst.event("story_look", { id: id, state: 0});
        GameDot.Instance.StoryLookDot(id, 0);
        
        this.startDate = Date.now();

        this.isPlaying = true;
        this.cfgId = id;
        this.roleId = roleId;
        this.curCallback = callback;

        // 
        this.curIndex = 0;
        this.endIndex = cfg.ElementList.length;
        this.curElementList = cfg.ElementList;
        this.curAwardType = cfg.AwardType;
        this.curAwardValue = cfg.AwardValue;
        this.ElementType = cfg.ElementType;

        this.showMask(()=>{
            const firstStory = this.curElementList[this.curIndex];
            this.PlayAClip(firstStory[0], firstStory[1]);
            oops.message.dispatchEvent(GameEvent.UIStoryStartEvent, {cfgId:this.cfgId, roleId: this.roleId});
        });
    }

    //  
    public OnTalkReadyClose(): void {
        oops.message.dispatchEvent(GameEvent.StoryPlayOver);
    }

    private StoryPlayOver(event: any, args: any): void {
        if (!this.isPlaying) return;
        //
        if(args){
            const curElemnt = this.curElementList[this.curIndex - 1];
            if(args.type != curElemnt[0] || args.id != curElemnt[1]){
                return;
            }
        }

        // 
        // if (this.unresolvedId > 0) {
        //     this.unresolveding = true;
        //     oops.gui.openAsync(UIID.UIChoice, this.unresolvedId);
        //     return;
        // }

        if (this.curIndex >= this.curElementList.length) {
            this.PlayAClip(0, 0);
        }
        else {
            const firstStory = this.curElementList[this.curIndex];
            if(firstStory.length < 2 || firstStory[1] == undefined){
                console.error(this.cfgId + "curElementList index = " + this.curIndex);
            }
            this.PlayAClip(firstStory[0], firstStory[1]);
        }
    }

    public PlayAClip(type: number, id: number): void {
        this.curIndex++;
        if (this.curIndex > this.endIndex) {
            // 
            // console.error("");
            if (this.curAwardType.length > 0) {
                //
                if(this.ElementType != 2 || !this.IsLookComplete(this.cfgId)){
                    this.isInStoryReward = true;
                    oops.gui.openAsync(UIID.UIStoryReward, {
                        awardType: this.curAwardType,
                        awardValue: this.curAwardValue
                    });
                }
                else{
                    this.hideMask();
                }
            }
            else{ 
                this.hideMask();
            }
        
            this.Over(false);

            FunctionOpenSystem.Instance.ShowOpenFunction(()=>
                {
                    if (this.curCallback) this.curCallback();
                });
            return;
        }

        console.log(" PlayAClip " + this.curIndex);
        // 
        switch (type) {
            case PlotSegType.NextStory:
                // 
                this.Over();
                this.Play(id);
                break;
            case PlotSegType.PlayDuiHua:
                // 
                // GameHelper.TransformLayer("HeiPingZhuanChang");
                if(oops.gui.has(UIID.TalkView)){
                    oops.message.dispatchEvent(GameEvent.OnTalkReOpen, { Id: id });
                }else{
                    oops.gui.openAsync(UIID.TalkView, { Id: id });
                }

                this.lastTalkId = id;
                break;
            case PlotSegType.PlayVideo:
                // 
                // GameHelper.TransformLayer("HeiPingZhuanChang");
                PlayerSystem.Instance.PlayVideo(id);
                this.lastTalkId = 0;

                // UIMainVideoComp.getInstance().playUrl(id, false);
                break;
            case PlotSegType.OpenGame:
                // 
                this.isGameType = true;
                this.lastTalkId = 0;
                oops.gui.openAsync(UIID.UIPiano,{
                    roleId:this.roleId
                });
                break;
            case PlotSegType.SelectOption:
                // 
                this.unresolveding = true;
                oops.gui.openAsync(UIID.UIChoice, id);
                break;
            default:
                console.error("PlotMgr: segType is not exist", id);
                break;
        }

        if (type != PlotSegType.PlayDuiHua && type != PlotSegType.SelectOption) {
            if(oops.gui.has(UIID.TalkView)){
                oops.gui.remove(UIID.TalkView);
            }
        }

        this.lastPlotSegType = type;
        // 
    }

    // 
    public NextIsChoice(): boolean {
        // if (!this.isPlaying) 
        //     return false;

        if (this.unresolveding) {
            return true;
        }

        if (this.curIndex >= this.curElementList.length) {
            return false;
        }
        else {
            const nextIsChoice = this.curElementList[this.curIndex][0] == PlotSegType.SelectOption;
            if (nextIsChoice)
            {
                this.unresolveding = true;
            }

            return nextIsChoice;
        }
    }

    // 
    public IsLookComplete(id: number): boolean {
        return GameData.PlayerData.GlobalData.StoryState.has(id);
    }

    // 
    public IsLookTalk(id: number): boolean {
        return GameData.PlayerData.GlobalData.TalkState.has(id);
    }

    // Id 0
    public GetLastTalkId(): number {
        return this.lastTalkId;
    }
}


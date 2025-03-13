// GlobalData.ts

import { oops } from "db://oops-framework/core/Oops";
import ConfigManager from "../../manager/Config/ConfigManager";
import { GameEvent } from "../../common/config/GameEvent";
import { SerializeClass, SerializeData } from "../../../modules/base/SerializeClass";
import { Notification } from "../../common/UINotification/Notification";

export class GlobalData extends SerializeClass  {
    // --------------------------
    // 
    // --------------------------
    __className:string = "GlobalData";
    @SerializeData()
    public money: number = 0;
    @SerializeData()
    public CurPlayId: number = 1;
    @SerializeData()
    public TapLevel: number = 1;
    @SerializeData()
    public PlayedVideoIdList: Map<number, Date> = new Map(); // [cfgId, playTime]
    @SerializeData()
    public UnlockPlayerId: number[] = [1];
    @SerializeData()
    public UnlockOpenId: number[] = [];
    @SerializeData()
    public OnlineState: Map<number, boolean> = new Map(); // [rewardId, isClaimed]

    @SerializeData()
    public StoryPlayCount: Map<number, number> = new Map();         //
    @SerializeData()
    public StoryPlayGameCount: Map<number, number> = new Map();     //
    @SerializeData()
    private onlineTime: number = 0;
    @SerializeData()
    public LastServerTime: string = "";
    @SerializeData()
    public FirstLoginTime: string = "";
    @SerializeData()
    public GuideId: number = 0;
    @SerializeData()
    public PhotoVideoPiece: number = 0;
    @SerializeData()
    public PhotoPicturePiece: number = 0;
    @SerializeData()
    public OfflineTimer: number = 0;
    @SerializeData()
    public StoryState: Map<number, boolean> = new Map(); 
    @SerializeData()
    public TalkState: Map<number, boolean> = new Map(); 
    @SerializeData()
    public LoginCount:number=0;
    @SerializeData()
    public EnterUICount: Map<number, number> = new Map(); 

    @SerializeData()
    public EnterUICountWithAvatorId: Map<string, number> = new Map(); 

    @SerializeData()
    public DotStoryAllEndTime: number = 0;
    @SerializeData()
    public DotStoryTimeToday: number = 0;
    @SerializeData()
    public DotStoryAllTimeToday1: number = 0;
    @SerializeData()
    public DotStoryAllTimeToday2: number = 0;
    @SerializeData()
    public DotStoryDiffSecondsToday1: number = 0;
    @SerializeData()
    public DotStoryDiffSecondsToday2: number = 0;

    @SerializeData()
    public ChoiseState: Map<number, boolean> = new Map(); 
    // --------------------------
    // 
    // --------------------------
    get OnlineTime(): number {
        return this.onlineTime;
    }

    set OnlineTime(value: number) {
        this.onlineTime = value;
        oops.message.dispatchEvent(GameEvent.OnlineClock);
        //NotificationCenter.markDirty('Online');
    }

    // --------------------------
    // 
    // --------------------------
    private wealthListeners: ((amount: number) => void)[] = [];

    // --------------------------
    // 
    // --------------------------
    constructor() {
        super();
        const initMoney = ConfigManager.tables.TbConst.get("InitMoney")?.Int;
        if(initMoney)
        {
            this.money = initMoney;
        }
    }

    // --------------------------
    // 
    // --------------------------
    AddWealth(amount: number): void {
        if (amount>0) {
            this.money += amount;
            this.NotifyWealthChanged();
        }
    }

    SubtractWealth(amount: number, showTips: boolean = false): boolean {
        if (amount<=0) return true;

        if (this.money>=amount) {
            this.money -= amount;
            this.NotifyWealthChanged();
            return true;
        }

        console.warn("Insufficient funds");
        if (showTips) {
            // Tips.showMessage(Localization.get("NoEnoughMoney"));
        }
        return false;
    }

    // --------------------------
    // 
    // --------------------------
    SetPlayVideoData(cfgId: number): void {
        if (!this.PlayedVideoIdList.has(cfgId)) {
            this.PlayedVideoIdList.set(cfgId, new Date());
        }
        oops.message.dispatchEvent(GameEvent.RefreshHomeView);
    }

    GetPlayVideoData(cfgId: number): boolean {
        return this.PlayedVideoIdList.has(cfgId);
    }

    // --------------------------
    // 
    // --------------------------
    private NotifyWealthChanged(): void {
       //this.wealthListeners.forEach(callback => callback(this.money));
       // NotificationCenter.markDirty('Invest');
        //NotificationCenter.markDirty('Secretary');
        oops.message.dispatchEvent(GameEvent.OnWealthChanged,this.money);
        Notification.SetNeedRefresh(Notification.Type.Invest);
        Notification.SetNeedRefresh(Notification.Type.Secretary);
    }


    //StoryPlayCount
    public AddStoryPlayCount(npcId : number){
        if(this.StoryPlayCount.has(npcId)){
            var oldCount = this.StoryPlayCount.get(npcId);
            if(oldCount != null)
                this.StoryPlayCount.set(npcId,oldCount + 1);
            else
                this.StoryPlayCount.set(npcId,1);
        }
        else{
            this.StoryPlayCount.set(npcId,1);
        }
    }

    public GetStoryPlayCount(npcId : number) : number{
        if(this.StoryPlayCount.has(npcId)){
            var oldCount = this.StoryPlayCount.get(npcId);
            if(oldCount == null)
                return 0;
            else 
                return oldCount;
        }
        return 0;
    }

    public ClearStoryPlayCount(npcId : number){
        if(this.StoryPlayCount.has(npcId)){
            this.StoryPlayCount.set(npcId,0);
        }
    }

    //StoryPlayGameCount
    public AddStoryGamePlayCount(npcId : number){
        if(this.StoryPlayGameCount.has(npcId)){
            var oldCount = this.StoryPlayGameCount.get(npcId);
            if(oldCount != null)
                this.StoryPlayGameCount.set(npcId,oldCount + 1);
            else
                this.StoryPlayGameCount.set(npcId,1);
        }
        else{
            this.StoryPlayGameCount.set(npcId,1);
        }
    }

    public GetStoryPlayGameCount(npcId : number) : number{
        if(this.StoryPlayGameCount.has(npcId)){
            var oldCount = this.StoryPlayGameCount.get(npcId);
            if(oldCount == null)
                return 0;
            else 
                return oldCount;
        }
        return 0;
    }

    public ClearStoryPlayGameCount(npcId : number){
        if(this.StoryPlayGameCount.has(npcId)){
            this.StoryPlayGameCount.set(npcId,0);
        }
    }

    //
    public GetStoryAndGameCount(npcId : number) : number{
        return this.GetStoryPlayCount(npcId) + this.GetStoryPlayGameCount(npcId);
    }
}




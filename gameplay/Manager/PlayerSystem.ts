// PlayerSystem.ts
import { _decorator, Component, debug, error, log } from 'cc';
import { GameData } from '../GameDataModel/GameData';
import ConfigManager from '../../manager/Config/ConfigManager';
import { PhotoData, SkinData } from '../GameDataModel/UserData';
import { TbTask, TrDate, TrPlayer, Trreloading, TrTask } from '../../schema/schema';
import { TaskSystem } from './TaskSystem';
import { FunctionOpenSystem } from './FunctionOpenSystem';
import { TapSystem } from './TapSystem';
import Singleton from './Singleton/Singleton';
import { oops } from 'db://oops-framework/core/Oops';
import { GameEvent } from '../../common/config/GameEvent';
import { UIMainVideoComp } from '../../UIMainVideo/UIMainVideoComp';
import { UIID } from '../../common/config/GameUIConfig';
import { RegisterClass, SerializeClass, SerializeData } from '../../../modules/base/SerializeClass';
import { TipsNoticeUtil } from '../Utility/TipsNoticeUtil';
import { Game } from 'cc';
import { Utility } from '../Utility/Utility';
import { random } from 'cc';
import { ConditionAndOr, ConditionMgr } from './ConditionMgr';
import { HeartSystem } from './HeartSystem';
import { SdkManager } from '../../../modules/sdk/SdkManager';
import { GameDot } from './GameDot';
import { StorySystem } from './StorySystem';
import { Notification } from "../../common/UINotification/Notification";
import { GlobalData } from '../GameDataModel/GlobalData';
import { BoyFriend } from '../GameDataModel/BoyFriend';

const { ccclass } = _decorator;

@RegisterClass("Player")
export class Player extends SerializeClass {
    __className: string = "Player";

    @SerializeData()
    public cfgId: number = 1;
    @SerializeData()
    public level: number = 1;
    @SerializeData()
    public exp: number = 0;
    @SerializeData()
    public skin: number = 0;
    @SerializeData()
    public SkinData: SkinData = new SkinData();
    @SerializeData()
    public photoData: PhotoData = new PhotoData();
    @SerializeData()
    public isLookLoverAd: boolean = false;
    @SerializeData()
    public isStartAwayTask: boolean = false;
    @SerializeData()
    public curTaskAwayTimeStamp: number = 0;
    @SerializeData()
    public interactionType: number = 1;//
    @SerializeData()
    public usedInteraction: number[] = [];//
    @SerializeData()
    public InteractionCount: Map<number, number> = new Map();         //
    
    @SerializeData()
    public BoyFriends: Map<number, BoyFriend> = new Map();
    @SerializeData()
    public Items: Map<number, number> = new Map();
    @SerializeData()
    public CurBoyFriendId: number = 0;
}

export class PlayerSystem {
    private static _instance: PlayerSystem;

    public static get Instance() {
        if (this._instance == null) {
            this._instance = new PlayerSystem();
        }

        return this._instance;
    }
    //#region 
    public GetCurBoyFriendId() {
        return this.PlayerData.CurBoyFriendId;
    }

    /**
     * 
     * @param id id
     * @param playerId id
     * @returns 
     */
    public GetBoyFriendById(id: number, playerId:number = -1): BoyFriend {
        if(playerId < 0) {
            playerId = this.CurPlayId;
        }
        const players = GameData.PlayerData.UserData.Players;
        let player = null;
        if (!players.has(playerId)) {
            let p = new Player();
            p.cfgId = playerId;
            p.CurBoyFriendId = id;
            players.set(playerId, p);
            player = p;
        }
        else {
            player = players.get(playerId)!;
        }
        
        if(!player.BoyFriends.has(id)) {
            let bf = new BoyFriend();
            bf.onInit(playerId, id);
            player.BoyFriends.set(id, bf);
            return bf;
        }
        
        return player.BoyFriends.get(playerId)!;
    }

    // 
    public AddBoyFriendExp(id: number, count: number) {
        const player = this.GetBoyFriendById(id);
        player.AddExp(count);
    }

    //#endregion
    //region 
    public get PlayerData(): Player {
        const players = GameData.PlayerData.UserData.Players;
        if (!players.has(this.CurPlayId)) {
            let p = new Player();
            p.cfgId = this.CurPlayId;
            players.set(this.CurPlayId, p);
        }
        return players.get(this.CurPlayId)!;
    }

    public GetPlayerData(lv: number = this.CurPlayId): Player {
        const players = GameData.PlayerData.UserData.Players;
        if (!players.has(lv)) {
            let p = new Player();
            p.cfgId = lv;
            players.set(lv, p);
        }
        return players.get(lv)!;
    }


    public init() {
        oops.message.on(GameEvent.MAIN_VIDEO_END, this.onHandler, this);
        oops.message.on(GameEvent.BoyFriendAddExp, this.onHandler, this);        
    }
    private onHandler(event: string, args: any): void {
        if(event == GameEvent.BoyFriendAddExp) {
            // args {Id: id Exp: }
            this.AddBoyFriendExp(args.Id, args.Exp);
            return;
        }
        // if (StorySystem.Instance.NextIsChoice()) {
        //     //
        //     return;
        // }
        // if (this.isHomeVideoRandomVideo) {
        //     // ,
        //     this.isHomeVideoRandomVideo = false;
        //     oops.message.dispatchEvent(GameEvent.OnPlayHomeVideo);
        //     return;
        // }
        if (this.isOpenHomeVideo || args) {
            oops.message.dispatchEvent(GameEvent.OnPlayHomeVideo);
        }
        this.IsOpenVideo = false;
        // PlayerSystem.Instance.TryLevelUp();
        oops.message.dispatchEvent(GameEvent.RefreshHomeView);

        this.VideoFinish(this.videoId);
        if (this.callback != null) {
            this.callback();
        }
        oops.gui.HideAllUILayer(true);
        oops.audio.volumeMusic = 1;
        oops.audio.volumeEffect = 1;
        //oops.audio.playMusic(Utility.GetMusicUrl(1001), undefined, "Audios");
    }
    public PlayerIsUnlock(id: number): boolean {
        //todo 
        let roleInfo = ConfigManager.tables.TbPlayer.get(id);
        let isUnlockRole = true;
        let condition = roleInfo?.Unlock;
        if (condition && condition?.length > 0) {
            isUnlockRole = ConditionMgr.inst.checkAllConditions(condition, ConditionAndOr.And);
        }
        if (!isUnlockRole) {
            return false;
        }
        return true;

        return GameData.PlayerData.GlobalData.UnlockPlayerId.includes(id);
    }

    public UnlockPlayer(id: number): void {
        if (!this.PlayerIsUnlock(id)) {
            GameData.PlayerData.GlobalData.UnlockPlayerId.push(id);
        }
    }

    public getUnlockPlayerCnt() {
        let roles = ConfigManager.tables.TbPlayer.getDataList();
        let cnt = 0;
        for (let i = 0; i < roles.length; i++) {
            if (this.PlayerIsUnlock(roles[i].Id)) {
                cnt++;
            }
        }
        return cnt;
    }

    public TryUnlockPlayer(playId: number): boolean {
        if (this.PlayerIsUnlock(playId)) return false;

        const cfg = ConfigManager.tables.TbPlayer.get(playId);
        if (cfg) {
            if (this.CurPlayId === cfg.Unlock[0] && this.CurLv >= cfg.Unlock[1]) {
                this.UnlockPlayer(playId);
                TipsNoticeUtil.PlayNotice(`${cfg.Name}!`);
                return true;
            }
        }

        return false;
    }

    public GetPlayerDataById(id: number): Player | null {
        if (!this.PlayerIsUnlock(id)) {
            console.warn(`: ${id}`);
            return null;
        }

        const players = GameData.PlayerData.UserData.Players;
        if (!players.has(id)) {
            let p = new Player();
            p.cfgId = id;
            players.set(id, p);
        }
        return players.get(id)!;
    }

    public get CurPlayId(): number {
        return GameData.PlayerData.GlobalData.CurPlayId;
    }

    public get CurLv(): number {
        return this.PlayerData.level;
    }

    //endregion

    //#region 
    /**
     * 
     * @param itemId 
     * @param value 
     */
    public UpdateItemCount(itemId: number, value: number) {
        if(value === 0) {
            console.error(",value0, itemId:%s", itemId);
            return;
        }
        const player = this.GetPlayerData();
        let count = 0;
        if(player.Items.has(itemId)) {
            count = player.Items.get(itemId)!;
        }
        count += value;
        player.Items.set(itemId, count);
    }

    public GetItemCount(itemId: number) : number {
        const player = this.GetPlayerData();
        let count = 0;
        if(player.Items.has(itemId)) {
            count = player.Items.get(itemId)!;
        }

        return count;
    }
    //#endregion

    //region 
    public TryLevelUp(): void {
        console.error("");
        if(GameData.GetGuideStep()>=2010 && GameData.GetGuideStep()<2022)
        {
            return;
        }
        
        TaskSystem.Instance.ReSetTaskData()
        if (TaskSystem.Instance.CheckCompleteAllTask()) {
            if (this.CurExp < this.CurNeedExp) {
                return;
            }

            // if (this.GetPlayVideoId() === 0) {
            this.LevelUp();
            this.IsStartAwayTask = false;
            // } else {
            //     TipsNoticeUtil.PlayNotice("");
            // }
        }
    }

    private LevelUp(): void {
        if (this.IsMaxLv) return;

        this.PlayerData.level++;
        // this.TryUnlockPlayer(2);
        // this.TryUnlockPlayer(3);
        SdkManager.inst.event("sense_level", { userid: this.PlayerData.cfgId, sense_level: this.PlayerData.level });
        GameDot.Instance.LevelDot(this.PlayerData.cfgId,this.PlayerData.level);

        FunctionOpenSystem.Instance.CheckCondition();

        if (this.CurExp >= this.CurNeedExp) {
            this.TryLevelUp();
        }

        // 
        let open = !StorySystem.Instance.isInStoryReward;
        if (open) {
            oops.gui.openAsync(UIID.UILevelUp);
        }
        else {
            oops.gui.pushWait(UIID.UILevelUp);
        }

        oops.message.dispatchEvent(GameEvent.PlayerLevelChange);
        oops.message.dispatchEvent(GameEvent.RefreshHomeView);
        //Notification.setNeedRefresh(Notification.Type.LvReward);
        //
        this.PlayerData.InteractionCount.clear();
        GameData.PlayerData.GlobalData.ClearStoryPlayCount(this.PlayerData.cfgId);
        GameData.PlayerData.GlobalData.ClearStoryPlayGameCount(this.PlayerData.cfgId);
    }
    //endregion

    //region 
    public get CurExp(): number {
        let curExp = this.TotalExp;
        let lastLv = (this.CurPlayId === 1 ? this.CurLv : this.CurPlayId * 1000 + this.CurLv) - 1;
        const minLv = this.CurPlayId === 1 ? 0 : this.CurPlayId * 1000;

        while (lastLv > minLv) {
            const cfg = ConfigManager.tables.TbTask.get(lastLv)!;
            lastLv--;
            curExp -= cfg.NeedExp;
        }

        return Number(curExp.toFixed(2));
    }

    public GetCurExp(roleId: number): number {
        const data = this.GetPlayerData(roleId);
        let curExp = data.exp;
        let lastLv = (roleId === 1 ? data.level : roleId * 1000 + data.level) - 1;
        const minLv = roleId === 1 ? 0 : roleId * 1000;

        while (lastLv > minLv) {
            const cfg = ConfigManager.tables.TbTask.get(lastLv)!;
            lastLv--;
            curExp -= cfg.NeedExp;
        }

        return Number(curExp.toFixed(2));
    }

    public get CurNeedExp(): number {
        return this.GetTbTask().NeedExp;
    }

    public GetTbTask(lv: number = -1): TrTask {
        const targetLv = lv > 0 ? lv : this.CurLv;
        let id = this.CurPlayId === 1 ? targetLv : this.CurPlayId * 1000 + targetLv;
        id = Math.min(this.MaxLv, id);
        const value = ConfigManager.tables.TbTask.get(id)
        return value!;
    }

    public getNeedExpByRole(roleId: number, lv: number): number {

        let trTask = this.getTbTaskByRole(roleId, lv);
        if (trTask) {
            return trTask.NeedExp;
        }
        else {
            return 0;
        }
    }

    public getTbTaskByRole(roleId: number, lv: number): TrTask {
        const targetLv = lv;
        let id = roleId === 1 ? targetLv : roleId * 1000 + targetLv;
        const value = ConfigManager.tables.TbTask.get(id)
        return value!;
    }

    private cacheHeartValue: number = 0; //   
    public AddCacheHeartValue(num: number): boolean {
        //  
        let lvUp: boolean = this.CurExp >= this.CurNeedExp;
        if (lvUp) {

        }
        else {
            this.cacheHeartValue += num;
        }
        return lvUp;
    }

    public ClearCacheHeartValue() {
        this.PlayerData.exp = this.PlayerData.exp + this.cacheHeartValue;
        this.cacheHeartValue = 0;
    }



    public get TotalExp(): number {
        return this.PlayerData.exp + this.cacheHeartValue;
    }

    set TotalExp(value: number) {
        this.PlayerData.exp = value;
    }

    public get IsMaxLv(): boolean {
        return this.CurLv > this.MaxLv;
    }

    public get MaxLv(): number {
        let MAX_LV = ConfigManager.tables.TbConst.get("RoleMaxLevel")?.Int || 999;
        return this.CurPlayId === 1 ? MAX_LV : this.CurPlayId * 1000 + MAX_LV;
    }
    //endregion

    //region 
    public GetPlayVideoId(): number {
        return 0;// todo VideoId
        // const videoId = this.GetTbTask().VideoId;
        // if (videoId <= 0) return 0;
        // return GameData.PlayerData.GlobalData.PlayedVideoIdList.has(videoId) ? 0 : videoId;
    }

    public get CurSkin(): number {
        return this.PlayerData.skin;
    }

    public SetSkin(id: number): void {
        this.PlayerData.skin = id;
    }

    public GetSkinInfo(skin: number = -1): Trreloading {
        const targetSkin = skin === -1 ? this.CurSkin : skin;
        const id = this.CurPlayId * 100 + targetSkin + 1;
        return ConfigManager.tables.Tbreloading.get(id)!;
    }

    public get HomeVideoId(): number {
        //
        var videoCfg = ConfigManager.tables.TbInteraction.get(this.GetSkinInfo().InterId);
        if (videoCfg != null) {
            // let randomVideos:number[] = [];
            // videoCfg.VideoIdList.forEach(item => {
            //     if (item != this.lastHomeVideoId) {
            //         randomVideos.push(item);
            //     }
            // })
            var randIndex = Math.floor(Math.random() * videoCfg.VideoIdList.length);
            //console.error(randIndex);
            this.lastHomeVideoId = videoCfg.VideoIdList[randIndex];
            return this.lastHomeVideoId;
        }
        return 10001;
    }

    public IsUnlockSkin(id: number): boolean {
        return this.PlayerData.SkinData.UnlockSkins.includes(id);
    }

    public UnlockSkin(id: number): void {
        if (!this.IsUnlockSkin(id)) {
            this.PlayerData.SkinData.UnlockSkins.push(id);
        }
    }

    public GetInteractionType(): number {
        return this.PlayerData.interactionType;
    }
    public SetInteractionType(id: number) {
        this.PlayerData.interactionType = id;
        this.OnShowInteraction(id);
    }
    
    public OnShowInteraction(id: number){
        let actionId = HeartSystem.Instance.getCurActionCfgId(id);
        if(this.PlayerData.usedInteraction.includes(actionId))
            return;
        this.PlayerData.usedInteraction.push(actionId);
        
        let cfg = ConfigManager.tables.TbInteraction.get(actionId);
        if(cfg == null){
            return;
        }
        let openCfg = ConfigManager.tables.TbOpenFunction.get(cfg.Openfunction);
        if(openCfg == null){
            return;
        }
        let type = openCfg.RedType as Notification.Type;
        Notification.SetNeedRefresh(type);
    }
    //tap
    public OnClickTap(){
        if(!this.PlayerData.InteractionCount.has(this.PlayerData.interactionType)){
            this.PlayerData.InteractionCount.set(this.PlayerData.interactionType, 0);
        }

        let count = this.PlayerData.InteractionCount.get(this.PlayerData.interactionType);
        if(count == undefined)
            count = 0;

        this.PlayerData.InteractionCount.set(this.PlayerData.interactionType, count + 1);
    }
    //endregion

    //region 

    public GetPhotoPieceNum(type: number): number {
        return type === 1
            ? GameData.PlayerData.GlobalData.PhotoVideoPiece
            : type === 2
                ? GameData.PlayerData.GlobalData.PhotoPicturePiece
                : 0;
    }

    public AddPhotoPieceNum(type: number, addNum: number): void {
        if (addNum <= 0) return;

        if (type === 1) {
            GameData.PlayerData.GlobalData.PhotoVideoPiece += addNum;
        } else if (type === 2) {
            GameData.PlayerData.GlobalData.PhotoPicturePiece += addNum;
        }
        oops.message.dispatchEvent(GameEvent.OnPhotoPieceChange);
        //Notification.setNeedRefresh(Notification.Type.Photo);
    }

    public SubtractPhotoPieceNum(type: number, subtractNum: number): boolean {
        if (subtractNum <= 0) return false;

        const globalData = GameData.PlayerData.GlobalData;
        let success = false;

        if (type === 1) {
            if (globalData.PhotoVideoPiece >= subtractNum) {
                globalData.PhotoVideoPiece -= subtractNum;
                success = true;
            }
        } else if (type === 2) {
            if (globalData.PhotoPicturePiece >= subtractNum) {
                globalData.PhotoPicturePiece -= subtractNum;
                success = true;
            }
        }

        if (success) {
            oops.message.dispatchEvent(GameEvent.OnPhotoPieceChange);
        }
        return success;
    }

    public UnlockPhoto(id: number): void {
        if (!this.PlayerData.photoData.UnlockPhotoId.includes(id)) {
            this.PlayerData.photoData.UnlockPhotoId.push(id);
            oops.message.dispatchEvent(GameEvent.OnUnlockPhoto);
            //Notification.setNeedRefresh(Notification.Type.Photo);
        }
    }

    public isUnlockPhoto(id: number): boolean {
        return this.PlayerData.photoData.UnlockPhotoId.includes(id);
    }
    //endregion

    //region 
    public get CurTaskAwayTimeStamp(): number {
        return this.PlayerData.curTaskAwayTimeStamp;
    }

    set CurTaskAwayTimeStamp(value: number) {
        this.PlayerData.curTaskAwayTimeStamp = value;
    }

    public get IsStartAwayTask(): boolean {
        return this.PlayerData.isStartAwayTask;
    }

    set IsStartAwayTask(value: boolean) {
        this.PlayerData.isStartAwayTask = value;
    }
    //endregion

    private videoId: number = 0;
    private callback: Function = null!;
    private isOpenHomeVideo: boolean = null!;
    private isHomeVideoRandomVideo: boolean = null!;
    public IsOpenVideo: boolean = false;
    private lastHomeVideoId: number = 0;
    //region 
    public PlayVideo(videoId: number, callback: Function = null!, isOpenHomeVideo = true): void {
        try {
            //oops.audio.stopAll();
            oops.audio.volumeMusic = 0;
            oops.audio.volumeEffect = 0;

            // 
            // if (CC_EDITOR) {
            //     // UICommonVideoContext.Instance.open(videoId, () => {
            //     //     this.VideoFinish(videoId);
            //     //     callback?.();
            //     //     AudioManager.playMusic("BGM");
            //     // });
            // } else {
            //     // CommonVideoPlayer.Instance.play(videoId, () => {
            //     //     this.VideoFinish(videoId);
            //     //     callback?.();
            //     //     AudioManager.playMusic("BGM");
            //     // });
            // }
            this.videoId = videoId;
            this.callback = callback;
            this.isOpenHomeVideo = isOpenHomeVideo;
            this.IsOpenVideo = true;
            oops.gui.HideAllUILayer(false);
            this.isHomeVideoRandomVideo = false;
            let videocfg = ConfigManager.tables.TbVideo.get(videoId)?.ResPath;
            UIMainVideoComp.getInstance().playUrl(videoId, false);
            GameDot.Instance.VideoStatusDot(videoId, 0);
        } catch (e) {
            this.IsOpenVideo = false;
            console.error(` ${videoId} `, e);
            error(` ${videoId} `, e);
        }
    }

    private VideoFinish(videoId: number): void {
        GameData.PlayerData.GlobalData.SetPlayVideoData(videoId);
        // this.TryLevelUp();
    }

    public HomeVideo(videoId: number) {
        this.isHomeVideoRandomVideo = true;
        UIMainVideoComp.getInstance().playUrl(videoId, false, "", false, true);
    }
    //endregion

    //region 
    public AutoGiveGift(): void {
        const tapSystem = TapSystem.Instance;
        const globalData = GameData.PlayerData.GlobalData;

        if (globalData.money < tapSystem.TapMoney || this.CurExp >= this.CurNeedExp) return;

        globalData.SubtractWealth(tapSystem.TapMoney);
        this.TotalExp += tapSystem.TapExp;
        oops.message.dispatchEvent(GameEvent.OnShowHomeTip);
    }
    //endregion

    //region 

    /**
     * 
     * @returns 
     */
    public getBaseBouns(currencyType: number): number {

        let baseBouns = 0;

        // let roleId = GameData.getRoleIdByCurrency(currencyType);//
        // let levelBouns = GameData.getLevelBaseBouns(roleId);//
        // baseBouns += levelBouns;

        return baseBouns;
    }

    /**
     * 
     * @param currencyType 
     * @returns 
     */
    public getCurrencyRate(currencyType: number): number {
        //ICurrencyBonus
        let rate = 1;
        let itemCfg = ConfigManager.tables.TbItem.get(currencyType);
        if (itemCfg == null) {
            return rate;
        }

        let roleId = GameData.getRoleIdByCurrency(currencyType);//
        if (roleId <= 0) {
            return rate;
        }

        for (let i = 0; i < itemCfg.AddRateType.length; i++) {
            var type = itemCfg.AddRateType[i] as CurrencyAddRateType;
            switch (type) {
                case CurrencyAddRateType.None:
                    return rate;
                case CurrencyAddRateType.HeartLevel:
                    let mRate1 = GameData.GetConstellationHeartAddByRoleId(roleId);//
                    rate += mRate1;
                    break;
                case CurrencyAddRateType.Constellation:
                    let mRate2 = GameData.getLevelBaseBouns(roleId);//
                    rate += mRate2;
                    break;
            }
        }

        return rate;

    }

    //endregion

    //region 

    private mDateList: Map<number, Map<number, number[]>> = new Map<number, Map<number, number[]>>();

    public getDateListByRoleId(roleId: number): Map<number, number[]> {
        if (this.mDateList.has(roleId)) {
            return this.mDateList.get(roleId)!;
        }
        else {
            let map = new Map<number, number[]>();
            this.mDateList.set(roleId, map);

            let allDateList = ConfigManager.tables.TbDate.getDataList();
            for (let i = 0; i < allDateList.length; i++) {
                if (allDateList[i].RoleId == roleId) {
                    if (map.has(allDateList[i].DateType)) {
                        map.get(allDateList[i].DateType)!.push(allDateList[i].Id);
                    }
                    else {
                        map.set(allDateList[i].DateType, [allDateList[i].Id]);
                    }
                }
            }
            return map;
        }
    }

    public getDateInfoByDateId(dateId: number): TrDate | undefined {
        return ConfigManager.tables.TbDate.get(dateId);
    }

    public getDateCountByRoleId(roleId: number): number {
        let map = this.getDateListByRoleId(roleId);
        let count = 0;
        map.forEach((value, key) => {
            count += value.length;
        })
        return count;
    }

    public getUnlockDateCountByRoleId(roleId: number): number {
        let map = this.getDateListByRoleId(roleId);
        let unlockCnt = 0;

        map.forEach((value, key) => {
            for (let i = 0; i < value.length; i++) {
                let dateInfo = this.getDateInfoByDateId(value[i]);
                if (dateInfo) {
                    const player = PlayerSystem.Instance.GetPlayerDataById(dateInfo.RoleId);
                    if (player && dateInfo.UnlockLevel <= player.level) {
                        unlockCnt++;
                    }
                }
            }
        })
        return unlockCnt;
    }

    //
    public GetSuitRoleCfg(): TrPlayer | undefined {
        return ConfigManager.tables.TbPlayer.get(this.GetPlayerData().cfgId);
    }

    //
    public EnoughCost(): boolean {
        var need = HeartSystem.Instance.GetCostValue(PlayerSystem.Instance.GetInteractionType());
        var costTid = this.GetSuitRoleCfg()?.ItemId;
        if (costTid == null)
            return false;
        return GameData.currencyIsEnough(costTid, need);
    }
    //endregion
}

/**
    * 
*/
export enum CurrencyAddRateType {
    None = 0,
    HeartLevel = 1,             //
    Constellation = 2,          //
}


import { _decorator, Component, debug } from 'cc';
import ConfigManager from '../../manager/Config/ConfigManager';
import { TimeUtility } from '../Utility/TimeUtility';
import { GameSaveManager } from '../GameSave/GameSaveManager';
import { PlayerInfo, UserData } from './UserData';
import { GlobalData } from './GlobalData';
import { ChatData, PhoneData } from './PhoneData';

import { ShareData } from './ShareData';
import {PlayerSystem} from '../Manager/PlayerSystem';
import { ADEnum, GameDot } from '../Manager/GameDot';
import { oops } from '../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { GameEvent } from '../../common/config/GameEvent';
import { CharacterAttribute, ItemEnum } from './GameEnum';
import { TaskType } from './TaskType';
import { SerializeClass, SerializeData } from '../../../modules/base/SerializeClass';
import { Notification } from '../../common/UINotification/Notification';
import { BigCityMapData } from './BigCityMapData';
import { ConstellationCellData, ConstellationData } from './ConstellationData';
import { MiniGameData,PianoData } from './MiniGameData';
import { GuideData, GuideState } from './GuideData';
import { SdkManager } from '../../../modules/sdk/SdkManager';
import { readSync } from 'fs';
import { HeroineData } from './HeroineData';

const { ccclass } = _decorator;


//   0.2 0.5
export interface ICurrencyBonus {
    getCurrencyBonus(currencyType: number): number;
}

//#region 
export class PlayerData extends SerializeClass {
    __className:string = "PlayerData";
    @SerializeData()
    GlobalData: GlobalData = new GlobalData();
    @SerializeData()
    HeroineData: HeroineData = new HeroineData();//
    @SerializeData()
    UserData: UserData = new UserData();
    @SerializeData()
    PhoneData: PhoneData = new PhoneData();
    @SerializeData()
    ConstellationData: ConstellationData = new ConstellationData();

    @SerializeData()
    ShareData: ShareData = new ShareData();
    @SerializeData()
    BigCityMapData: BigCityMapData = new BigCityMapData();
    //
    @SerializeData()
    CurrencyData: Map<number, number> = new Map();
    @SerializeData()
    MiniGameData: MiniGameData = new MiniGameData();
    @SerializeData()
    GuideData: GuideData = new GuideData();
    /**  */
    @SerializeData()
    TalkDic: Map<number,number> = new Map();
}
//#endregion 


/**  */
const MAX_PHONE_NUM = 30;

@ccclass('GameData')
export class GameData{
    public static VIDEO_URL = "https://huaguangshigeyi-down.wyx.cn/GirlsLike/Video/mp4/";
    public static VIDEO_WEBGL_URL = "https://huaguangshigeyi-down.wyx.cn/GirlsLike/Video/liumeiti/";
    
    public static get Tables() {
        return ConfigManager.tables;
    }

    public static get PlayerData():PlayerData {
        return GameSaveManager.Instance.gameRecordData;
    }

    public static get UserData() {
        return GameData.PlayerData.UserData;
    }

    public static Token: string = "";
    public static openid: string = "";
    public static isActive: boolean = false;
    public static isOpenDouble: boolean = false;
    public static isOpenAutoClick: boolean = false;
    public static isOpenFreeMoney: boolean = false;
    public static isOpenFreeMoneyInTapUp: boolean = false;
    public static talkViewAutoType: number = 0;
    //public static SystemInfo: SystemInfo;

    public static GetChatDataListByRoleId(roleId: number) {
        return GameData.PlayerData.PhoneData.ChatDatas.get(roleId);//find(data => data.RoleId === roleId) || null;
    }

    public static AddPhoneChatDataOnId(roleId: number, chatId: number): void {
        let groupId = 0;
        const cfg = ConfigManager.tables.TbChat.get(chatId);
        if(cfg) {
            groupId = cfg.GroupId;
        }
        let groupCount = 1;
        let existing = GameData.PlayerData.PhoneData.ChatDatas.get(roleId);//find(data => data.RoleId === roleId);
        if (existing) {
            //  existing  ChatData 
            // if (!(existing instanceof ChatData)) {
            //     const newChatData = new ChatData();
            //     Object.assign(newChatData, existing);
            //     const index = GameData.PlayerData.PhoneData.ChatDatas.indexOf(existing);
            //     GameData.PlayerData.PhoneData.ChatDatas[index] = newChatData;
            //     existing = newChatData;
            // }
            if (existing.ChatIds.includes(chatId)) {
                console.log(`AddPhoneChatDataOnId roleId:${roleId} chatId:${chatId} same.`);
                return;
            }

            existing.ChatIds.push(chatId);
            if(existing.ChatIds.length > MAX_PHONE_NUM) {
                console.log(`AddPhoneChatDataOnId remove before length:${existing.ChatIds.length}.`);
                let count = 0;
                while (existing.ChatIds.length > MAX_PHONE_NUM) {
                    existing.ChatIds.shift();
                    count++;
                    if(count > 5) {
                        break;
                    }
                }
                console.log(`AddPhoneChatDataOnId remove end length:${existing.ChatIds.length}.`);
            }
            existing.LastTime = TimeUtility.GetTimeStamp();
            existing.RecordGroupNum(groupId, 1);
            groupCount = existing.ChatGroupDic.keys.length;
        } else {
            const newData = new ChatData();
            newData.RoleId = roleId;
            newData.ChatIds.push(chatId);
            newData.LastTime = TimeUtility.GetTimeStamp();
            newData.RecordGroupNum(groupId, 1);
            GameData.PlayerData.PhoneData.ChatDatas.set(roleId, newData);
        }
        Notification.SetNeedRefresh(Notification.Type.Phone);
        SdkManager.inst.event("message_get", {userid: roleId, message_get: 1});
    }

    public static GetChatListOnId(): number[] {
        return [...GameData.PlayerData.PhoneData.ChatDatas.keys()];
    }

    /**
     * 
     * @param roleId 
     * @returns 
     */
    public static IsCurrentChatEnd(roleId: number): boolean {
        const chatData = GameData.PlayerData.PhoneData.ChatDatas.get(roleId);//find(data => data.RoleId === roleId);
        if (chatData && chatData.ChatIds.length > 0) {
            let cfg = ConfigManager.tables.TbChat.get(chatData.ChatIds[chatData.ChatIds.length - 1]); // slice(-1)[0]);
            if(cfg)
            {
                return cfg.NextId == -1;
            }
            return false;
            
        }
        return true;
    }


    public static IsChatEndByChatId(chatId:number):boolean
    {
        for (const [id, chat] of GameData.PlayerData.PhoneData.ChatDatas) {
            if (chat.RoleId !== PlayerSystem.Instance.CurPlayId) continue;
            // let lastChatId = GameData.GetOverByFirstChatId(chatId);
            
            // // 
            return chat.ChatIds?.includes(chatId) ?? false;
            // return true;
        }

        return false;
    }

    public static IsPhoneHasNoReaded() {
        const list = this.GetChatListOnId();
        for (let i = 0; i < list.length; i++) {
            const id = list[i];

            if(!this.IsCurrentChatEnd(id)) {
                return true;
            }
        }

        return false;
    }

    // public static GetOverByFirstChatId(chatId: number): number {
    //     const cfg = ConfigManager.tables.TbChat.get(chatId);
    //     if(cfg)
    //     {
    //         if (cfg.NextId != -1) {
    //             return this.GetOverByFirstChatId(cfg.NextChats[0]);
    //         }
    //         return cfg.Id;
    //     }
    //     return 0;

    // }

    public static GetPlayerInfo(playerId: number = -1): PlayerInfo {
        const pid = playerId === -1 ? PlayerSystem.Instance.CurPlayId : playerId;
        if (!GameData.PlayerData.UserData.PlayerInfos.has(pid)) {
            GameData.PlayerData.UserData.PlayerInfos.set(pid, new PlayerInfo());
        }
        return GameData.PlayerData.UserData.PlayerInfos.get(pid)!;
    }

    public static GetIconPathByADEnum(adenum: ADEnum): string {
        const shareNum = ShareData.GetShareOrAD(adenum);
        return shareNum > 0 
            ? "common/com_icon_share" 
            : "common/com_icon_kanshiping";
    }

    /**
     * ()
     * @param currencyType 
     * @returns 
     */
    public static getAllBounsByType(currencyType:number){
        let rate = 1;
        // 
        let mingzuosheRate = GameData.PlayerData.UserData.PlayerInfos.get(PlayerSystem.Instance.CurPlayId)?.MingzuosheRate || 1;
        rate += mingzuosheRate;
        
        return rate;
    }
    public static currencyIsEnough(itemType:ItemEnum, count:number): boolean {
        const hasCount = this.getCurrency(itemType);
        return hasCount >= count;
    }
    public static getCurrency(itemType:ItemEnum): number {
        if(itemType > ItemEnum.ExpClass && itemType < ItemEnum.ExpEnd) return this.getExp(itemType);
        return GameData.PlayerData.CurrencyData.get(itemType) || 0;
    }

    /**
     * 
     * @param itemType 
     * @param originNum 
     */
    public static culateCurrencyWithBouns(itemType:ItemEnum, originNum:number): number {
        let baseBouns = PlayerSystem.Instance.getBaseBouns(itemType);//
        originNum += baseBouns;//
        
        //%
        //if(itemType > ItemEnum.ExpClass && itemType < ItemEnum.ExpEnd){
            let rate = PlayerSystem.Instance.getCurrencyRate(itemType);//
            originNum *= rate;//
        //}

        originNum = Math.round(originNum);//
        return originNum;
    }

    /**
     * 
     * @param itemType 
     * @param delta 
     */
    public static updateCurrency(itemType:ItemEnum, delta:number): void {

        //
        if(delta > 0)
        {
            delta = GameData.culateCurrencyWithBouns(itemType,delta);
        }


        let oldV = GameData.PlayerData.CurrencyData.get(itemType) || 0;
        let newV = oldV + delta;
        newV = newV > 0 ? newV : 0;
        if(itemType==ItemEnum.Biao||itemType==ItemEnum.YuPei)
        {
            SdkManager.inst.event("token_change", {userid: PlayerSystem.Instance.CurPlayId, token_change: Math.ceil(delta),token_change_value:Math.ceil(oldV)});
        }
        GameData.PlayerData.CurrencyData.set(itemType, newV);

        if(itemType > ItemEnum.ExpClass && itemType < ItemEnum.ExpEnd) this.updateExp(itemType, delta);

        oops.message.dispatchEvent(GameEvent.OnItemValueChanged, itemType, newV, delta);
        oops.message.dispatchEvent(GameEvent.OnMoneyChange, itemType, newV, delta);
    }

    public static updateCurrencys(itemTypes:number[], itemCnts:number[]): void {
        for(let i = 0; i < itemTypes.length; i++) {
            this.updateCurrency(itemTypes[i], itemCnts[i]);
        }
    }

    public static setCurrency(itemType:ItemEnum, v:number) {
        GameData.PlayerData.CurrencyData.set(itemType, v);

        if(itemType > ItemEnum.ExpClass && itemType < ItemEnum.ExpEnd) this.setExp(itemType, v);

        oops.message.dispatchEvent(GameEvent.OnItemValueChanged, itemType, v, 0);
    }

    // exp 
    private static getExp(itemType:ItemEnum): number {
        let playerId = this.getPlayerIdByExp(itemType);
        let player = PlayerSystem.Instance.GetPlayerData(playerId);
        if(player){
            return player.exp;
        }
        else{
            return 0;
        }
    }

    private static updateExp(itemType:ItemEnum, delta:number): void {
        let playerId = this.getPlayerIdByExp(itemType);
        let player = PlayerSystem.Instance.GetPlayerData(playerId);
        if(player){
            player.exp += delta;
            //PlayerSystem.Instance.TryLevelUp();
        }
    }

    private static setExp(itemType:ItemEnum, v:number) {
        let playerId = this.getPlayerIdByExp(itemType);
        let player = PlayerSystem.Instance.GetPlayerData(playerId);
        if(player){
            player.exp = v;
        }
        else{
            return 0;
        }
    }

    private static getPlayerIdByExp(itemType:ItemEnum): number {
        let playerId = 0;
        let playerCfgs = ConfigManager.tables.TbPlayer.getDataList();
        for(let i = 0; i < playerCfgs.length; i++){
            if(playerCfgs[i].ExpId === itemType){
                playerId = playerCfgs[i].Id;
                break;
            }
        }

        return playerId;
    }

    /**
     * 
     * @param roleId 
     * @returns 
     */
    public static getLevelBaseBouns(roleId: number): number {
        let levelBouns = 0;
        let player = PlayerSystem.Instance.GetPlayerData(roleId);
        let levelBaseBouns = ConfigManager.tables.TbConst.get("LEVEL_BASE_BOUNS")?.Float || 0;
        levelBaseBouns = Math.round(levelBaseBouns * 100)/100;
        if(player){
            levelBouns = player.level * levelBaseBouns;
        }
        return levelBouns;
    }

    /**
     * 
     * @returns 
     */
    public static GetConstellationHeartAddByRoleId(roleId: number): number {
        const data = GameData.GetConstellationDataByRoleId(roleId);
        if(data){
            return data.HeartAddRate;
        }

        return 0;
    }
    /**
     * 
     */
    public static GetConstellationLevelByRoleId(roleId: number): number {
        const data = GameData.GetConstellationDataByRoleId(roleId);
        if(data){
            return data.Level;
        }

        return 0;
    }

    /**
     * 
     * @param roleId 
     * @returns 
     */
    public static GetConstellationDataByRoleId(roleId: number) : ConstellationCellData | undefined{
        if(!GameData.PlayerData.ConstellationData.CellsDataDic.has(roleId)) {
            GameData.PlayerData.ConstellationData.AddNew(roleId);
        }

        return GameData.PlayerData.ConstellationData.CellsDataDic.get(roleId);
    }

    /**
     * 
     * idid
     * @param starId 
     * @returns 
     */
    public static GetConstellationStarIsUnlockById(starId: number){
        const cfg = ConfigManager.tables.TbStarSingle.get(starId);
        if(cfg == null) {
            return false;
        }
        var tData = GameData.PlayerData.ConstellationData.CellsDataDic.get(cfg.RoleId);
        if(tData == undefined) {
            return false;
        }

        if(tData.Level > cfg.StageLevel) {
            return true;
        }
        else if(tData.Level < cfg.StageLevel) {
            return false;
        }

        return tData.StarData.Level >= cfg.Level;
    }

    /**
     * 
     * @param roleId 
     * @param level 
     * @param starId 
     */
    public static GetConstellationStarIsUnlockByRoleIdAndLevel(roleId:number, starId: number){
        var tData = GameData.PlayerData.ConstellationData.CellsDataDic.get(roleId);
        if(tData == undefined) {
            return false;
        }
        // if(tData.Level < level) {
        //     return false;
        // }
        // else if(tData.Level > level) {
        //     return true;
        // }

        const cfg = ConfigManager.tables.TbStarSingle.get(starId);
        if(cfg == null) {
            return false;
        }

        return tData.StarData.Level >= cfg.Level;
    }
    public static GetConstellationStarIsUnlockByRoleIdAndStarLevel(roleId:number, level: number, starLevel: number){

        var tData = GameData.PlayerData.ConstellationData.CellsDataDic.get(roleId);
        if(tData == undefined) {
            return false;
        }
        if(tData.Level < level) {
            return false;
        }
        else if(tData.Level > level) {
            return true;
        }

        return tData.StarData.Level >= starLevel;
    }

    /**
     * 
     * @param roleId 
     * @param starLevel 
     */
    public static SetConstellationStarUp(roleId: number) {
        if(!GameData.PlayerData.ConstellationData.CellsDataDic.has(roleId)) {
            var data = new ConstellationCellData();
            data.Init(roleId);
            GameData.PlayerData.ConstellationData.CellsDataDic.set(roleId, data);
        }
        var tData = GameData.PlayerData.ConstellationData.CellsDataDic.get(roleId);
        tData?.StarUp();
        if(!GameData.PlayerData.ConstellationData.FirstStarUp) {
            GameData.PlayerData.ConstellationData.FirstStarUp = true;
            SdkManager.inst.event("constellation_use", {userid: roleId, constellation_use: 1});
        }
        SdkManager.inst.event("constellation_time", {userid: roleId, constellation_time: tData?.Level});
    }

    public static UpdateConstellationUnlockTotalStarByRoleId(roleId: number, dt: number) {
        GameData.PlayerData.ConstellationData.UpdateStarTotalCount(roleId, dt);
    }

    public static GetConstellationUnlockTotalStarByRoleId(roleId: number) {
        return GameData.PlayerData.ConstellationData.StarTotalDic.get(roleId) ?? 0;
    }

    public static SetMiniGameData(roleId:number, levelId:number, allScole:number)
    {
        GameData.PlayerData.MiniGameData.RoleId = roleId;
        GameData.PlayerData.MiniGameData.LevelId = levelId;
        GameData.PlayerData.MiniGameData.AllScore = allScole;

    }

    public static SetPianoData(roleId:number, levelId:number, score:number)
    {
        let topScore = -1;

        if (GameData.PlayerData.MiniGameData.DicPianoData.has(roleId)) {
            let diclevelData = GameData.PlayerData.MiniGameData.DicPianoData.get(roleId)!.DicLevelData
            if (diclevelData.has(levelId)) {
                let topScore = diclevelData.get(levelId)!
                if (topScore<score) {
                    diclevelData.set(levelId,score)
                }
            }
            else
            {
                diclevelData.set(levelId,score)
            }
        }
        else {
            let ins = new PianoData()
            ins.DicLevelData.set(levelId, score)
            GameData.PlayerData.MiniGameData.DicPianoData.set(roleId,ins)
        }
    }

    public static GetPianoData_topScore(roleId:number, levelId:number)
    {
        if (GameData.PlayerData.MiniGameData.DicPianoData.has(roleId)) {
            let diclevelData = GameData.PlayerData.MiniGameData.DicPianoData.get(roleId)!.DicLevelData
            if (diclevelData.has(levelId)) {
                let topScore = diclevelData.get(levelId)!
                return topScore;
            }
        }

        return 0;
    }

    ///////
    // public static InitGuideData()
    // {
    //     let arrTrGuide = ConfigManager.tables.TbGuide.getDataList();

    //     for (let i = 0; i < arrTrGuide.length; i++) {
    //         let hasGuideId = false
    //         const element = arrTrGuide[i];
    //         for (let j = 0; j < GameData.PlayerData.GuideData.ArrGuideState.length; j++) {
    //             const e = GameData.PlayerData.GuideData.ArrGuideState[j];
    //             if (e.GuideId == element.GuideID) {
    //                 hasGuideId = true
    //             }
    //         }
    //         if (!hasGuideId) {
    //             let guideState = new GuideState()
    //             guideState.GuideId = element.GuideID
    //             guideState.Finished = false;
    //             GameData.PlayerData.GuideData.ArrGuideState.push(guideState)
    //         }
    //     }
    // }

    public static InitGuideData()
    {
        let arrTrGuide = ConfigManager.tables.TbGuide.getDataList();
        let newGuideState = []
        for (let i = 0; i < arrTrGuide.length; i++) {
            const element = arrTrGuide[i];
            let guideState = new GuideState()
            newGuideState.push(guideState)
            guideState.GuideId = element.GuideID
            guideState.Finished = false;
            
            for (let j = 0; j < GameData.PlayerData.GuideData.ArrGuideState.length; j++) {
                const e = GameData.PlayerData.GuideData.ArrGuideState[j];
                if (e.GuideId === element.GuideID) {
                    guideState.Finished = e.Finished
                    break;
                }
            }
        }
        
        GameData.PlayerData.GuideData.ArrGuideState = newGuideState
    }

    public static SaveGuideStep(guideStepId:number)
    {
        // GameData.PlayerData.GuideData.GuideStepId = guideStepId
        for (let i = 0; i < GameData.PlayerData.GuideData.ArrGuideState.length; i++) {
            const element = GameData.PlayerData.GuideData.ArrGuideState[i];
            if (element.GuideId == guideStepId) {
                element.Finished = true;
            }
        }
    }

    public static SaveOpenUICountWithAvatorId(uiId:number, avatorId:number){
        const key = `openui_${uiId}_${avatorId}`;
        GameData.PlayerData.GlobalData.EnterUICountWithAvatorId.set(
            key, 
            (GameData.PlayerData.GlobalData.EnterUICountWithAvatorId.get(key) ?? 0) + 1
        );
    }

    public static GetOpenUICountWithAvatorId(uiId:number, avatorId:number){
        const key = `openui_${uiId}_${avatorId}`;
        return GameData.PlayerData.GlobalData.EnterUICountWithAvatorId.get(key) ?? 0
    }

    public static GetGuideStep()
    {
        //return GameData.PlayerData.GuideData.GuideStepId;
        let result = 0;
        for (let i = 0; i < GameData.PlayerData.GuideData.ArrGuideState.length; i++) {
            const element = GameData.PlayerData.GuideData.ArrGuideState[i];
            if (element.Finished) {
                result = element.GuideId
            }
        }

        return result
    }

    public static IsfrontGuideAllFinished(guideId:number)
    {
        let result:boolean = true;
        for (let i = 0; i < GameData.PlayerData.GuideData.ArrGuideState.length; i++) {
            const element = GameData.PlayerData.GuideData.ArrGuideState[i];
            if (element.GuideId == guideId) {
                break
            }
            if (!element.Finished) {
                result=false;
            }
        }

        return result
    }

    ////
    private static SetGuideState(guideId:number,finished: boolean)
    {
        for (let i = 0; i < GameData.PlayerData.GuideData.ArrGuideState.length; i++) {
            const element = GameData.PlayerData.GuideData.ArrGuideState[i];
            if (element.GuideId == guideId) {
                element.Finished=finished
                break
            }
        }
    }

    public static IsGuideFinished(guideId:number)
    {
        for (let i = 0; i < GameData.PlayerData.GuideData.ArrGuideState.length; i++) {
            const element = GameData.PlayerData.GuideData.ArrGuideState[i];
            if (element.GuideId == guideId) {
                return element.Finished;
            }
        }

        return false
    }


    /**
     * 
     */
    public static getRoleIdByCurrency(itemType:number):number{

        let playerId = 0;
        let playerCfgs = ConfigManager.tables.TbPlayer.getDataList();
        for(let i = 0; i < playerCfgs.length; i++){
            if(playerCfgs[i].ExpId === itemType || playerCfgs[i].ItemId === itemType){
                playerId = playerCfgs[i].Id;
                break;
            }
        }

        return playerId;
    }
}

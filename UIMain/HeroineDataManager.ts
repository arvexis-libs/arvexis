import { _decorator, Component, Node } from 'cc';
import { get } from 'http';
import { oops } from 'db://oops-framework/core/Oops';
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { smc } from "db://assets/script/game/common/ecs/SingletonModuleComp"
import { UIID } from "db://assets/script/game/common/config/GameUIConfig";
import { GameData } from "db://assets/script/game/gameplay/GameDataModel/GameData";
import { TapSystem } from "db://assets/script/game/gameplay/Manager/TapSystem";
import { PlayerSystem } from "db://assets/script/game/gameplay/Manager/PlayerSystem";
import { TaskSystem } from "db://assets/script/game/gameplay/Manager/TaskSystem";
import { FunctionOpenSystem } from "db://assets/script/game/gameplay/Manager/FunctionOpenSystem";
import { Utility } from "db://assets/script/game/gameplay/Utility/Utility";
import { GameEvent } from "../common/config/GameEvent";
import { UITimerManager } from "../gameplay/Manager/UITimerManager";
import ConfigManager from "../manager/Config/ConfigManager";
import { TimeUtility } from "../gameplay/Utility/TimeUtility";
import { TaskType } from "../gameplay/GameDataModel/TaskType";
import { GameHelper } from "../gameplay/GameTool/GameHelper";
import { TbInteraction, TbVideo, TrInteraction, TrLevel, TrUIGuide } from "../schema/schema";
import { UIMainVideoComp } from "../UIMainVideo/UIMainVideoComp";
import { FunctionOpenType } from "../gameplay/GameDataModel/FunctionOpenType";
import { TipsNoticeUtil } from "../gameplay/Utility/TipsNoticeUtil";
import { RichText } from "cc";
import { SdkManager } from "../../modules/sdk/SdkManager";
import { Camera } from "cc";
import { Animation } from "cc";
import { Sprite } from "cc";
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
import { Color } from "cc";
import { HeartSystem } from "../gameplay/Manager/HeartSystem";
import { color } from "cc";
import { math } from "cc";
import { changeSpriteImage } from "../common/UIExTool";
import { StorySystem } from "../gameplay/Manager/StorySystem";
import { ItemEnum } from "../gameplay/GameDataModel/GameEnum";
import { tips } from "../common/prompt/TipsManager";
import { GuideManager } from "../UIGuide/GuideManager";
import { Size } from "cc";
import { DEBUG } from "cc/env";
import { LayerType } from "db://oops-framework/core/gui/layer/LayerManager";
import { EditBox } from "cc";
import { GameDot } from "../gameplay/Manager/GameDot";
import { game } from "cc";
import { sys } from "cc";
import { Notification } from "../common/UINotification/Notification";
import { UINotification } from "../common/UINotification/UINotification";
import { EventHandler } from "cc";
import { config } from 'process';
import * as exp from 'constants';
import { time } from 'console';
import { Scheduler } from 'cc';
const { ccclass, property } = _decorator;

///
export enum KeySources
{
    Ads = 0,//
    Store = 1,//
    LvUp = 2,//
    RealTime = 3,//
}

/**  */
export enum PropType
{
    Speak = 1,//
    Body = 2,//
    Agility = 3,//
    Feel = 4,//
    Wisdom = 5,//
}

@ccclass('HeroineDataManager')
export class HeroineDataManager
{
    private static _instance: HeroineDataManager = null!;
    public static get Instance(): HeroineDataManager
    {
        if (this._instance == null)
        {
            this._instance = new HeroineDataManager();
        }
        return this._instance;
    }

    constructor() { 
        if (!GameData.PlayerData.HeroineData.ListUsedMagicBoxId) {
            GameData.PlayerData.HeroineData.ListUsedMagicBoxId = [];
        }
        if (!GameData.PlayerData.HeroineData.ListClothes) {
            GameData.PlayerData.HeroineData.ListClothes = [];
        }
        if (!GameData.PlayerData.HeroineData.DicIdentity) {
            GameData.PlayerData.HeroineData.DicIdentity = new Map();
        } 
        if(!GameData.PlayerData.HeroineData.LastGiveKeyTime)
        {
            GameData.PlayerData.HeroineData.LastGiveKeyTime = Date.now();
        }
        if (GameData.PlayerData.HeroineData.CurVirtualTimePoint == 0||undefined) {
            let timePoint = ConfigManager.tables.TbConst.get("TimeInitial")?.Int ?? 7;
            GameData.PlayerData.HeroineData.CurVirtualTimePoint = timePoint;
        }

        this.giveKeyByTime();
    }

    public SetHeadIcon(headIcon:string)
    {
        GameData.PlayerData.HeroineData.HeadIcon = headIcon;
        oops.message.dispatchEvent(GameEvent.OnHeroineHeadIconChange);
    }
    public GetHeadIcon()
    {
        return GameData.PlayerData.HeroineData.HeadIcon;
    }

    public SetName(name:string)
    {
        GameData.PlayerData.HeroineData.Name = name;
        oops.message.dispatchEvent(GameEvent.OnHeroineNameChange);
    }

    public GetName()
    {
        if (GameData.PlayerData.HeroineData.Name == "") {
            const randomNum = Math.floor(Math.random() * 9000) + 1000;
            GameData.PlayerData.HeroineData.Name = `${randomNum}`;
        }
        return GameData.PlayerData.HeroineData.Name;
    }

    public AddExp(expDelta:number)
    {
        let trLevel = ConfigManager.tables.TbLevel.get(GameData.PlayerData.HeroineData.Lv)!
        let exp = GameData.PlayerData.HeroineData.ExpCur + expDelta;
        if (exp >= trLevel.NeedExp) {
            if (GameData.PlayerData.HeroineData.Lv < this.getLvMax()) {
                GameData.PlayerData.HeroineData.Lv += 1;
                oops.message.dispatchEvent(GameEvent.onHeroineLevelUp);//
            }
            GameData.PlayerData.HeroineData.ExpCur = exp - trLevel.NeedExp;
        }
        else
        {
            GameData.PlayerData.HeroineData.ExpCur = exp;
        }
    }

    public GetExpCur()
    {
        return GameData.PlayerData.HeroineData.ExpCur;
    }

    public GetExpCurLvNeep()
    {
        return ConfigManager.tables.TbLevel.get(GameData.PlayerData.HeroineData.Lv)!.NeedExp;
    }

    ///
    public SetProp(powerType: PropType, value: number)
    {
        GameData.PlayerData.HeroineData.Prop.set(powerType,value);
        oops.message.dispatchEvent(GameEvent.OnHeroineDataChange);
    }
    //#region 
    /**  */
    public GetPower(propType: PropType): number {
        return GameData.PlayerData.HeroineData.Prop.get(propType) || 0;
    }

    public GetPropIcon(itemId: number) {
        let tb = ConfigManager.tables.TbHeroinePropType.get(itemId);
        return tb!.Icon;
    }
    public GetPropName(itemId: number) {
        let tb = ConfigManager.tables.TbHeroinePropType.get(itemId);
        return tb!.Name;
    }

    public GetExpIcon() {
        return "Sprites/icon_heart";
    }

    public GetExpName() {
        return "";
    }

    //#region 
    public GetClothes()
    {
        return GameData.PlayerData.HeroineData.ListClothes;
    }

    public GiveClothes(clothesId:number)
    {
        let clothesList = GameData.PlayerData.HeroineData.ListClothes;
        if(clothesList.indexOf(clothesId) != -1) 
            return;

        clothesList.push(clothesId);
        oops.message.dispatchEvent(GameEvent.OnHeroineDataChange);
    }

    //#region 
    public HadIdentity(identityId: number)
    {
        return GameData.PlayerData.HeroineData.DicIdentity.has(identityId);
    }
    
    public GiveIdentity(identityId:number)
    {
        let dicIdentity = GameData.PlayerData.HeroineData.DicIdentity;
        if(dicIdentity.has(identityId)) 
            return;

        dicIdentity.set(identityId, 1);
        oops.message.dispatchEvent(GameEvent.OnHeroineDataChange);
    }

    public GetDicIdentity()
    {
        return GameData.PlayerData.HeroineData.DicIdentity;
    }

    public GetTrIdentityLevelByIdAndlevel(identityId:number, level:number)
    {
        let list = this.GetTrIdentityLevelListById(identityId)
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (element.Level == level) {
                return element
            }
        }
    }

    public GetNextTrIdentityLevelById(identityId:number, curLevel:number)
    {
        let list = this.GetTrIdentityLevelListById(identityId)
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (element.Level == curLevel) {
                if (i<list.length-1) {
                    return list[i+1]
                }
            }
        }

        return null;
    }

    public GetTrIdentityLevelListById(identityId: number)
    {
        let trIdentityLevel = ConfigManager.tables.TbIdentityLevel.getDataList();
        let result = trIdentityLevel.filter(x => x.IdentityId == identityId);
        return result
    }

    public GetIdentityLevelById(identityId: number)
    {
        let dic = HeroineDataManager.Instance.GetDicIdentity()!
        return dic.get(identityId)!;
    }

    public IdentityLevelup(identityId: number)
    {
        let list = this.GetTrIdentityLevelListById(identityId)
        let maxLevel = list.reduce((a, b) => a.Level > b.Level ? a : b).Level
        let curLevel = this.GetIdentityLevelById(identityId)
        if (curLevel && curLevel >= maxLevel) {
            return
        }
        
        if (curLevel) {
            GameData.PlayerData.HeroineData.DicIdentity.set(identityId, curLevel + 1);
        }
    }

    //todo\lbb: 
    public GetAllIdentityProp(identityId: number, level: number): number[]
    {
        let trIdentityLevel = this.GetTrIdentityLevelByIdAndlevel(identityId, level);
        if (!trIdentityLevel) {
            return [];
        }
        // let arr = [];
        // arr.push(trIdentityLevel.Speak);
        // arr.push(trIdentityLevel.Body);
        // arr.push(trIdentityLevel.Agility);
        // arr.push(trIdentityLevel.Feel);
        // arr.push(trIdentityLevel.Wisdom);
         return [];
    }
//#region 
    public getLvCur()
    {
        return GameData.PlayerData.HeroineData.Lv;
    }
    

    private getLvMax()
    {
        return ConfigManager.tables.TbLevel.getDataList().length;
    }
//#region 
    public IsMagicBoxUsed(idMagicBox:number)
    {
        return GameData.PlayerData.HeroineData.ListUsedMagicBoxId.indexOf(idMagicBox) >= 0;

    }

    public SetMagicBoxUsed(idMagicBox:number)//
    {
        if (GameData.PlayerData.HeroineData.ListUsedMagicBoxId.indexOf(idMagicBox) >= 0)
            return;

        GameData.PlayerData.HeroineData.ListUsedMagicBoxId.push(idMagicBox);
    }

    public GetKeyCountCur()
    {
        return GameData.PlayerData.CurrencyData.get(ItemEnum.Key) || 0;
    }

    public GetKeyCountMax()
    {
        let lv = this.getLvCur();
        let tab = ConfigManager.tables.TbLevel.get(lv)!;
        return tab.MagicKeyMax;
    }

    public AddKey(keySources: KeySources, count: number)
    {
        let keyCountCur = GameData.PlayerData.CurrencyData.get(ItemEnum.Key) || 0;
        let keyCountMax = this.GetKeyCountMax();
        let baseKeyCount = Math.max(keyCountCur, keyCountMax);
        let value1 = Math.max(keyCountCur + count, 0) ;
        let value2 = value1 > keyCountMax ? baseKeyCount : value1;

        switch(keySources)
        {
            case KeySources.Ads:
                GameData.PlayerData.CurrencyData.set(ItemEnum.Key, value1);
                break;
            case KeySources.Store:
                GameData.PlayerData.CurrencyData.set(ItemEnum.Key, value1);
            break;
            case KeySources.LvUp:
                GameData.PlayerData.CurrencyData.set(ItemEnum.Key, value1);
                break;
            case KeySources.RealTime:
                GameData.PlayerData.CurrencyData.set(ItemEnum.Key, value2);
                break;
                
        }
        
        oops.message.dispatchEvent(GameEvent.onHeroineKeyChange);
    }

    //#region 
    public GetCurVirtualTimeArea()
    {
        let curVirtualTime = GameData.PlayerData.HeroineData.CurVirtualTimePoint;
        let listTr = ConfigManager.tables.TbVirtualTime.getDataList();
        for (let i = 0; i < listTr.length; i++) {
            const element = listTr[i];
            let arrTime:number[] = element.Time;
            if (arrTime.indexOf(curVirtualTime) >= 0) {
                return element.Id;
            }
        }
        return 0;
    }

    public GetCurVirtualTimePoint()
    {
        let curVirtualTime = GameData.PlayerData.HeroineData.CurVirtualTimePoint;
        return curVirtualTime;
    }

    public GetNextVirtualTimeArea()
    {
        let nextVirtualTimePoint = this.GetNextVirtualTimePoint()!;
        let listTr = ConfigManager.tables.TbVirtualTime.getDataList();
        for (let i = 0; i < listTr.length; i++) {
            let element = listTr[i];
            if (element.Time.indexOf(nextVirtualTimePoint) >= 0) {
                if (i < listTr.length - 1) {
                    return listTr[i + 1].Id;
                }
                else {
                    return listTr[0].Id;
                }
            }
        }
    }

    public GetNextVirtualTimePoint()
    {
        let arrAllTimePoint:number[] = [];
        let listTr = ConfigManager.tables.TbVirtualTime.getDataList();
        for (let i = 0; i < listTr.length; i++) {
            let element = listTr[i].Time;
            arrAllTimePoint = arrAllTimePoint.concat(element)
        }

        let curVirtualTime = GameData.PlayerData.HeroineData.CurVirtualTimePoint;
        for (let j = 0; j < arrAllTimePoint.length; j++) {
            let ele = arrAllTimePoint[j];
            if (ele == curVirtualTime) {
                if (j<arrAllTimePoint.length-1) {
                    return arrAllTimePoint[j+1];
                }
                else
                {
                    return arrAllTimePoint[0];
                }
            }
        }
    }

    public GetFirstTimePointByTimeArea(timeArea:number)
    {
        let listTr = ConfigManager.tables.TbVirtualTime.getDataList();
        for (let i = 0; i < listTr.length; i++) {
            let element = listTr[i];
            if (timeArea == element.Id) {
                return element.Time[0]
            }
        }

        return 0;
    }

    public SetCurVirtualTimePoint(value: number) {
        if (value && value != 0) {
            GameData.PlayerData.HeroineData.CurVirtualTimePoint = value;
            oops.message.dispatchEvent(GameEvent.onHeroineVirtualTimeChange);
        }
    }

    public GetKeyTimeLeft()// 
    {
        let time = ConfigManager.tables.TbConst.get("GetKey")?.Int!;
        let timeLeft = (time * 60000 - (Date.now() - GameData.PlayerData.HeroineData.LastGiveKeyTime))/1000;
        return Math.max(0,Math.round(timeLeft));

    }

    private giveKeyByTime() {
        let time = ConfigManager.tables.TbConst.get("GetKey")?.Int!;
        oops.timer.schedule(() => {
            let t = Date.now() - GameData.PlayerData.HeroineData.LastGiveKeyTime||0
            let addValue = Math.trunc(t/(time*60*1000));
            if (addValue>0) {
                this.AddKey(KeySources.RealTime,addValue)
                GameData.PlayerData.HeroineData.LastGiveKeyTime = Date.now()
            }
        }, 1)

    }

}
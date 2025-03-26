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
export enum PowerType
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
            if (!GameData.PlayerData.HeroineData.ListUsedMagicBoxId) {
                GameData.PlayerData.HeroineData.ListUsedMagicBoxId = [];
            }
            if (!GameData.PlayerData.HeroineData.ListClothes) {
                GameData.PlayerData.HeroineData.ListClothes = [];
            }
            if (!GameData.PlayerData.HeroineData.ListIdentity) {
                GameData.PlayerData.HeroineData.ListIdentity = [];
            } 
        }
        return this._instance;
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

    ///RoleDataManager.Instance.SetPower({powerBody:100,powerAgility:100});
    ///
    public SetPower({ powerSpeak, powerBody, powerAgility, powerFeel, powerWisdom } : { powerSpeak?: number; powerBody?: number; powerAgility?: number; powerFeel?: number; powerWisdom?: number; })
    {
        if (powerSpeak) {
            GameData.PlayerData.HeroineData.PowerSpeak = powerSpeak;
        }
        if (powerBody) {
            GameData.PlayerData.HeroineData.PowerBody = powerBody;
        }
        if (powerAgility) {
            GameData.PlayerData.HeroineData.PowerAgility = powerAgility;
        }
        if (powerFeel) {
            GameData.PlayerData.HeroineData.PowerFeel = powerFeel;
        }
        if (powerWisdom) {
            GameData.PlayerData.HeroineData.PowerWisdom = powerWisdom;
        }
        
        oops.message.dispatchEvent(GameEvent.OnHeroineDataChange);
    }
    
    /**  */
    public GetPower(powerType: PowerType): number {
        switch (powerType) {
            case PowerType.Speak:
                return GameData.PlayerData.HeroineData.PowerSpeak;
            case PowerType.Body:
                return GameData.PlayerData.HeroineData.PowerBody;
            case PowerType.Agility:
                return GameData.PlayerData.HeroineData.PowerAgility;
            case PowerType.Feel:
                return GameData.PlayerData.HeroineData.PowerFeel;
            case PowerType.Wisdom:
                return GameData.PlayerData.HeroineData.PowerWisdom;
            default:
                return 0;
        }
    }

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

    public GetIdentity()
    {
        return GameData.PlayerData.HeroineData.ListIdentity;
    }
    
    public GiveIdentity(identityId:number)
    {
        let identityList = GameData.PlayerData.HeroineData.ListIdentity;
        if(identityList.indexOf(identityId) != -1) 
            return;

        identityList.push(identityId);
        oops.message.dispatchEvent(GameEvent.OnHeroineDataChange);
    }

    public getLvCur()
    {
        return GameData.PlayerData.HeroineData.Lv;
    }
    

    private getLvMax()
    {
        return ConfigManager.tables.TbLevel.getDataList().length;
    }

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
        return GameData.PlayerData.CurrencyData.get(ItemEnum.Key);
    }

    public GetKeyCountMax()
    {
        let lv = this.getLvCur();
        let tab = ConfigManager.tables.TbLevel.get(lv)!;
        return tab.MagicKeyMax;
    }

    public AddKey(keySources: KeySources, count: number)
    {
        let keyCountCur = GameData.PlayerData.CurrencyData.get(ItemEnum.Key)!;
        let value1 = Math.max(keyCountCur + count, 0) ;
        let value2 = value1 >= this.GetKeyCountMax()! ? keyCountCur : value1;

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
}
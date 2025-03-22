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

    public GetClothes()
    {
        return GameData.PlayerData.HeroineData.ClothesList;
    }

    public GiveClothes(clothesId:number)
    {
        let clothesList = GameData.PlayerData.HeroineData.ClothesList;
        if(clothesList.indexOf(clothesId) != -1) 
            return;

        clothesList.push(clothesId);
        oops.message.dispatchEvent(GameEvent.OnHeroineDataChange);
    }

    public GetIdentity()
    {
        return GameData.PlayerData.HeroineData.IdentityList;
    }
    
    public GiveIdentity(identityId:number)
    {
        let identityList = GameData.PlayerData.HeroineData.IdentityList;
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
        return GameData.PlayerData.HeroineData.UsedMagicBoxId.indexOf(idMagicBox) >= 0;

    }
}
import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { RegisterClass, SerializeClass, SerializeData } from "../../../modules/base/SerializeClass";
import { SdkManager } from "../../../modules/sdk/SdkManager";
import { GameEvent } from "../../common/config/GameEvent";
import ConfigManager from "../../manager/Config/ConfigManager";
import { ConstellationTool } from "../../UIConstellation/ConstellationTool";
import { StorySystem } from "../Manager/StorySystem";
import { GameData } from "./GameData";

/**  */
export enum ConditionState{
    /**  */
    None = 0,
    /**  */
    Unlock = 1,
    /**  */
    WillUnlock = 2,
    /** */
    CanNotUnlock,
}

@RegisterClass("ConstellationData")
export class ConstellationData extends SerializeClass {
    __className:string = "ConstellationData";
    @SerializeData()
    public CellsDataDic: Map<number, ConstellationCellData> = new Map();
    /**  */
    @SerializeData()
    public StarTotalDic: Map<number, number> = new Map();
    /**  */
    @SerializeData()
    public FirstStarUp: boolean = false;
    
    /**
     * 1
     * @param roleId 
     */
    public AddNew(roleId: number) {
        const data = new ConstellationCellData();
        data.Init(roleId, 1);
        this.CellsDataDic.set(roleId, data);
        this.StarTotalDic.set(roleId, 0);
    }

    /**
     * 
     * @param roleId 
     * @param dt 
     */
    public UpdateStarTotalCount(roleId: number, dt: number) {
        let hasCount = 0;
        if(this.StarTotalDic.has(roleId)) {
            hasCount = this.StarTotalDic.get(roleId) ?? 0;
        }
        this.StarTotalDic.set(roleId, hasCount + dt);
    }
}

@RegisterClass("ConstellationCellData")
export class ConstellationCellData extends SerializeClass {
    __className:string = "ConstellationCellData";
    @SerializeData()
    public RoleId: number = 0;
    @SerializeData()
    public Id: number = 0;
    /** */
    @SerializeData()
    public Level: number = 0;
    /** */
    @SerializeData()
    public HeartAddRate: number = 0;
    /** */
    @SerializeData()
    public StarUnlockTotalCount: number = 0;
    /** */
    @SerializeData()
    public StarData: ConstellationStarData = new ConstellationStarData();
    /**  */
    @SerializeData()
    public TotalStarCount: number = 0;
    /** */
    @SerializeData()
    public IsFirstShow: boolean = true;
    /** id */
    private _starIds: number[] = [];

    public Init(roleId: number, level: number = 1) {
        this.RoleId = roleId;
        this.Level = level;
        this.StarUnlockTotalCount = 0;

        const list = this.GetStarIds();
        let starId = list.length > 0 ? list[0] : 0;
        this.TotalStarCount = list.length;    
        
        if(this.StarData == null) {
            this.StarData = new ConstellationStarData();
        }
        this.StarData.Init(starId, 0);
    }

    public Cfg() {
        const cfgAll = ConfigManager.tables.TbStarStage.getDataList();
        for (let i = 0; i < cfgAll.length; i++) {
            const element = cfgAll[i];
            if(element.Level == this.Level && element.RoleId == this.RoleId) {
                return element;
            }                
        }
        return null;
    }

    /**
     * id
     * @returns 
     */
    public NextStarId() {        
        return this.StarData.NextStarId(this.RoleId, this.Level);
    }
    

    public GetStarIds() {
        if(this._starIds.length == 0) {
            const cfg = this.Cfg();
            if(cfg) {
                this._starIds = [...cfg.StarIds];
            }
        }

        return this._starIds;
    }

    /**
     * id
     * @param starId 
     */
    public IsStarUnlockOnId(starId: number) {
        if(starId <= 0) {
            return false;
        }
        const cfg = ConfigManager.tables.TbStarStage.get(starId);
        if(cfg ==  null) {
            return false;
        }
        return this.IsStarUnlockOnLevel(cfg.Level);
    }

    /**
     * 
     * @param starLevel 
     * @returns 
     */
    public IsStarUnlockOnLevel(starLevel: number) {
        return this.StarData.Level != 0 && this.StarData.Level >= starLevel;
    }

    /**
     * 
     * @returns 
     */
    public IsNextStarCanUnlock(id: number = 0): boolean{
        let nextId = id;
        if(nextId == 0) {
            nextId = this.NextStarId();
        }
        if(nextId == 0) {
            return false;
        }
        const state = ConstellationTool.GetStarConditionState(this.RoleId, nextId);
        
        return state == ConditionState.WillUnlock;
    }

    /**
     * 
     * @param lv 
     * @returns 
     */
    public StarUp(){
        const nextId = this._checkNextStarLevel(this.StarData.Level+1);
        if(nextId == 0) {
            this.LevelUp();
            return;
        }
        const nextCfg = ConfigManager.tables.TbStarSingle.get(nextId);
        if(nextCfg == undefined) {
            console.error("no find TbStarSingle id:" + nextId);
            return;
        }

        this.StarData.Id = nextCfg.Id;
        this.StarData.Level += 1;
        this.HeartAddRate += nextCfg.UnlockRewardRate;
        // 
        if(nextCfg.UnlockPlotId > 0) {
            StorySystem.Instance.Play(nextCfg.UnlockPlotId);
        }
        this.StarUnlockTotalCount++;
        GameData.UpdateConstellationUnlockTotalStarByRoleId(this.RoleId, 1);
        // Fire
        oops.message.dispatchEvent(GameEvent.ConstellationStarUp, this.RoleId, this.StarData.Id);
        // 
        const afterNextId = this._checkNextStarLevel(this.StarData.Level+1);
        if(afterNextId == 0) {
            this.LevelUp();
        }
    }

    private _checkNextStarLevel(lv: number) {
        const nextLv = lv;
        const list = this.GetStarIds();
        for (let i = 0; i < list.length; i++) {
            const id = list[i];
            const cfg = ConfigManager.tables.TbStarSingle.get(id);
            if(cfg && cfg.Level == nextLv) {
                return id;
            }                
        }

        return 0;
    }

    /**
     * 
     * @param lv 
     * @returns 
     */
    public LevelUp(){
        const nextLv = this.Level + 1;
        const maxLv = ConfigManager.tables.TbConst.get("ConstellationMaxLevel")?.Int || 2;
        if(nextLv > maxLv) {
            return;
        }
        // let isFind = false;
        // const cfgAll = ConfigManager.tables.TbStarStage.getDataList();
        // for (let i = 0; i < cfgAll.length; i++) {
        //     const element = cfgAll[i];
        //     if(element.Level == nextLv && element.RoleId == this.RoleId) {
        //         this.Id = element.Id;
        //         isFind = true;
        //         break;
        //     }                
        // }
        const nextId = this._checkLevelUp(nextLv);
        const nextCfg = ConfigManager.tables.TbStarStage.get(nextId);
        if(nextCfg == undefined) {
            return;
        }

        this.Id = nextCfg.Id;
        this.Level = nextCfg.Level;
        this._starIds.length = 0;
        this._starIds = [...nextCfg.StarIds];
        if(this._starIds.length == 0) {
            console.error("_starIds length is 0,id:" + nextCfg.Id);
        }
        this.StarData.Init(this._starIds[0]);

        // Fire
        oops.message.dispatchEvent(GameEvent.ConstellationLevelUp, this.RoleId);
    }

    private _checkLevelUp(nextLv: number) {
        const cfgAll = ConfigManager.tables.TbStarStage.getDataList();
        for (let i = 0; i < cfgAll.length; i++) {
            const element = cfgAll[i];
            if(element.Level == nextLv && element.RoleId == this.RoleId) {
                this.Id = element.Id;
                return element.Id;
            }                
        }

        return 0;
    }
}

@RegisterClass("ConstellationStarData")
export class ConstellationStarData extends SerializeClass {
    __className:string = "ConstellationStarData";
    @SerializeData()
    public Id: number = 0;
    // 
    @SerializeData()
    public Level: number = 0;
    

    public Init(id: number, level: number = 0) {
        this.Id = id;
        this.Level = level;
    }

    public NextStarId(roleId: number, stageLevel: number) {
        const nextLv = this.Level + 1;
        const list = ConfigManager.tables.TbStarSingle.getDataList();
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if(element.RoleId == roleId && element.StageLevel == stageLevel && element.Level == nextLv) {
                return element.Id;
            }
        }

        console.error("No find NextStarId, roleId:%s, stageLevel:%s,nextLv:%s",roleId, stageLevel, nextLv);

        return 0;
    }
}

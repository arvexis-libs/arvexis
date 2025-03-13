import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { List } from "../../../../../extensions/oops-plugin-framework/assets/libs/collection/List";
import { UIID } from "../../common/config/GameUIConfig";
import ConfigManager from "../../manager/Config/ConfigManager";
import { FunctionOpenType } from "../GameDataModel/FunctionOpenType";
import { GameData } from "../GameDataModel/GameData";
import { ConditionMgr } from "./ConditionMgr";
import { PlayerSystem } from "./PlayerSystem";
import { Notification } from "../../common/UINotification/Notification";
import { Node } from "cc";

export class FunctionOpenSystem {
    private static _instance: FunctionOpenSystem;
    public static get Instance(): FunctionOpenSystem {
        if (!this._instance) {
            this._instance = new FunctionOpenSystem();
        }
        return this._instance;
    }

    private list : List<number> = null!;

    public IsOpen(type: number): boolean {
        let isInclude = GameData.PlayerData.GlobalData.UnlockOpenId.includes(type);
        return isInclude;
    }

    private AddOpenFunction(id : number){
        let cfg = ConfigManager.tables.TbOpenFunction.get(id);
        if(cfg == null){
            return;
        }
        
        if(this.IsOpen(cfg.OpenFunctionType)){
            return;
        }

        GameData.PlayerData.GlobalData.UnlockOpenId.push(cfg.OpenFunctionType);
        console.log("id = " + cfg.OpenFunctionType);
        //ui
        if(cfg.ConditionId.length == 0 || !cfg.IfShowUI){
            this.unlockContainer();
            return;
        }

        if(this.list == null){
            this.list = new List<number>();
        }

        if(this.list.has(id))
            return;

        this.list.push(id);
    }

    public ShowOpenFunction(closeUICallback : Function = null!){
        if(oops.gui.has(UIID.UIOpenFunction) || oops.gui.has(UIID.UILevelUp)){
            return;
        }

        if(this.list == null || this.list.count <= 0){
            console.log("" + (closeUICallback != null));
            if(closeUICallback!=null){
                closeUICallback();
            }
            this.unlockContainer();
            return;
        }

        let id = this.list.pop();
        var cfg= ConfigManager.tables.TbOpenFunction.get(id);
        if(cfg == null){
            console.error("id id = " + id);
            return;
        }

        console.log("UI id = " + id);
        oops.gui.open(UIID.UIOpenFunction,
            {
                name : cfg.Name,
                desc : cfg.Desc,
                icon : cfg.Icon,
                closeCallback : closeUICallback
            });
        
        let notiType = cfg.RedType as Notification.Type;
        Notification.SetNeedRefresh(notiType);
    }

    public CheckCondition(){
        //
        let dates = ConfigManager.tables.TbOpenFunction.getDataList();
        if(dates == null){ return; }

        for(let i = 0;i< dates.length;i++){
            if(this.IsOpen(dates[i].OpenFunctionType)){
                continue;
            }
            
            let unlock = ConditionMgr.inst.checkAllConditions(dates[i].ConditionId, dates[i].UnConditionType);
            if(unlock){
                this.AddOpenFunction(dates[i].Id);
            }
        }
    }

    //
    private Container : Map<FunctionOpenType, Node> = new Map(); 

    public Register(type :FunctionOpenType , node : Node){
        if(this.Container.has(type) && this.Container.get(type) == node){
            return;
        }

        this.Container.set(type, node);
    }

    public Unregister(type :FunctionOpenType){
        if(!this.Container.has(type))
            return;

        this.Container.delete(type);
    }

    unlockContainer(){
        this.Container.forEach((value, key) => {
            value.active = this.IsOpen(key);
        });
    }
}

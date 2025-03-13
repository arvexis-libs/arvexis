import ConfigManager from "../../manager/Config/ConfigManager"
import { TrEvent } from "../../schema/schema";
import { GameData } from "../GameDataModel/GameData";
import { ItemEnum } from "../GameDataModel/GameEnum";
import { PlayerSystem } from "./PlayerSystem";
import { PlotMgr } from "./PlotMgr";
import { StorySystem } from "./StorySystem";


export enum EventType{
    PlayPlot = 1,
    RandomPlayPlot = 2,
    OpenGame = 3,
    NewMessage = 4,
    NewPYQ = 5,
    RoleValue = 6,
    PlayerValue = 7
}

export class EventMgr{
    private static _instance: EventMgr
    public static get inst(): EventMgr{
        if(!this._instance){
            this._instance = new EventMgr()
        }
        return this._instance
    }

    public trigger(eventId: number, roleId:number=0){
        let trEvent = ConfigManager.tables.TbEvent.get(eventId) as TrEvent;
        this.doEvent(trEvent,roleId);
    }

    private doEvent(event:TrEvent,roleId:number=0){
        switch(event.EventType){
            case EventType.PlayPlot:
                //
                this.playPlot(event,roleId);
                break;
            case EventType.RandomPlayPlot:
                //
                this.randomPlayPolt(event);
                break;
            case EventType.NewMessage:
                //
                this.addMessage(event);
                break;
            case EventType.NewPYQ:
                //
                this.addPYQ(event);
                break;
            
            case EventType.OpenGame:
                //
                this.openGame(event);
                break;
            case EventType.PlayerValue:
                this.motifyPlayerValue(event);
                //
                break;
            case EventType.RoleValue:
                this.motifyRoleValue(event);
                //
                break;
            default:
                console.error("");
                break;
        }
    }

    private motifyPlayerValue(event:TrEvent){
        let currencyType = parseInt(event.Param1);//
        let value = parseInt(event.Param2);//
        GameData.updateCurrency(currencyType, value);
    }

    //
    private motifyRoleValue(event:TrEvent){
        let currencyType = parseInt(event.Param1);//
        let value = parseInt(event.Param2);//
        let rate = PlayerSystem.Instance.getCurrencyRate(currencyType);//
        value *= rate;//

        let playerId = 1;
        //
        if(currencyType == ItemEnum.ExpPlayer1){
            playerId = 1;
        }else if(currencyType == ItemEnum.ExpPlayer2){
            playerId = 2;
        }

        const player = PlayerSystem.Instance.GetPlayerDataById(playerId);
        if(player){
            player.exp += value;
        }
        //GameData.updateCurrency(currencyType, value);
    }

    private openGame(event:TrEvent){

    }

    private addMessage(event:TrEvent){

    }

    private addPYQ(event:TrEvent){

    }

    private playPlot(event:TrEvent,roleId:number=0){
        StorySystem.Instance.Play(parseInt(event.Param1),null!,roleId);
    }

    private randomPlayPolt(event:TrEvent){

    }

}
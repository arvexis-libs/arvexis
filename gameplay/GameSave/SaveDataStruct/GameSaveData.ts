import { SerializeClass, SerializeData } from "db://assets/script/modules/base/SerializeClass";
import { PlayerData } from "../../GameDataModel/GameData";
import { Player } from "../../Manager/PlayerSystem";
import { PlayerInfo } from "../../GameDataModel/UserData";

export class GameSaveData extends SerializeClass
{
    // 
    // 
    // 
    // 
    // ...
    __className:string = "GameSaveData";

    public title:string = "";

    public date:number = 0;

    // 
    @SerializeData()
    public playerData:PlayerData = new PlayerData();

    //
    //if else newpublic productClassByName()

    public productClassByName(className:string):any
    {
        if(className == "Player"){
            return new Player();
        }
        else if(className == "PlayerInfo")
        {
            return new PlayerInfo();
        }
    }

}

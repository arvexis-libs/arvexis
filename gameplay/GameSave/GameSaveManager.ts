import { _decorator, Component, warn, error } from 'cc';
import { GameData, PlayerData } from '../GameDataModel/GameData';
import { GameSaveData } from './SaveDataStruct/GameSaveData';
import { oops } from 'db://oops-framework/core/Oops';
import { macro } from 'cc';
import { CloudSaveHelper } from './CloudSaveHelper';
import { DEBUG } from 'cc/env';
import { sys } from 'cc';
import { GameEvent } from '../../common/config/GameEvent';

const { ccclass } = _decorator;

@ccclass('GameSaveManager')
export class GameSaveManager  {

    private static _instance: GameSaveManager;
 
    public static get Instance() {
        if (this._instance == null) {
            this._instance = new GameSaveManager();
        }
 
        return this._instance;
    }

    private inited : boolean = false;
    private autoSaveFunc : Function | null = null;
    private autoUploadFunc : Function | null = null;
    // public readonly persistentDataProvider: PersistentDataProvider = new PersistentDataProvider(
    //     "GameSaveData", 
    //     ContentSaveType.PlainText, 
    //     true
    // );

    private current: GameSaveData = new GameSaveData();
    private lastSaveJsonString: string = "";
    private mLocalKey: string = "game_record";

    get gameRecordData(): PlayerData{
        return this.current?.playerData!;
    }

    Init()
    {
        oops.message.on(GameEvent.OpenUICount,this.SaveOpenUICount,this);
    }
    
    private SaveOpenUICount(event: string, args: any){
        const uiId = parseInt(args);
        GameData.PlayerData.GlobalData.EnterUICount.set(
            uiId, 
            (GameData.PlayerData.GlobalData.EnterUICount.get(uiId) ?? 0) + 1
        );
        
    }
    /**
     * 
     */
    private save(jsonStr: string){

        let zipStr = CloudSaveHelper.inst.zipData(jsonStr);
        console.log("key" + this.mLocalKey + " :" + zipStr);
        console.log("zipStrzipStr = " + zipStr.length);

        let pageSize = 500;
        let page = Math.ceil(zipStr.length / pageSize);
        console.log("page = " + page);

        oops.storage.set(this.mLocalKey + "page", page);
        for(let i = 0; i < page; i ++){
            let start = i * pageSize;
            let end = start + pageSize;
            if(end > zipStr.length){
                end = zipStr.length;
            }
            oops.storage.set(this.mLocalKey + i, zipStr.substring(start, end));
        }
    }

    private getFromLocal():string{
        let pageStr = oops.storage.get(this.mLocalKey + "page");
        if(pageStr === null || pageStr === undefined || pageStr === ''){
            return '';
        }
        console.log("page = " + pageStr);
        let page = parseInt(pageStr);

        let zipStr = '';
        for(let i = 0; i < page; i ++){
            let data = oops.storage.get(this.mLocalKey + i);
            if(data === null || data === undefined || data === ''){
                return '';
            }
            zipStr += data;
        }

        console.log("zipStr = " + zipStr.length);
        console.log("zipData:+++ : ", zipStr);
        let localData = CloudSaveHelper.inst.unZipData(zipStr);
        console.log("localData", localData);
        return localData;

    }

    public async load(){
        this.Init();
        if(this.inited){
            console.error("");
            return;
        }
        this.autoSaveFunc = this.autoSave.bind(this);
        this.autoUploadFunc = this.autoUpload.bind(this);

        let openId = GameData.openid;

        this.mLocalKey = "game_record";

       // console.log("localData:+++ : ", this.mLocalKey);
        let localData = this.getFromLocal();
        if(localData == '' || localData == null || localData == undefined){
            localData = await this.getFromServer();
            if(localData == '' || localData == null || localData == undefined){
                //
            }
            else{
                this.lastSaveJsonString = localData;
                this.current.fromJSON(JSON.parse(localData), this.current);
            }
        }
        else{
            this.lastSaveJsonString = localData;
            this.current.fromJSON(JSON.parse(localData), this.current);
        }

        this.inited = true;
        //
        oops.timer.schedule(this.autoSaveFunc, 2, macro.REPEAT_FOREVER, 2);
        oops.timer.schedule(this.autoUploadFunc, 100, macro.REPEAT_FOREVER, 100);
    }

    private async getFromServer(){
        let localData = '';
        if(!DEBUG ){
            if(sys.platform != sys.Platform.ANDROID){
                localData = await CloudSaveHelper.inst.download();
            }
        }
        return localData;
    }

    private autoUpload(){
        if(!DEBUG){
        CloudSaveHelper.inst.upload(this.lastSaveJsonString);
        }
    }

    private autoSave(){
        //console.log("~");
        let data = this.current?.toJSON();
        let dataStr = JSON.stringify(data);
        if(dataStr != this.lastSaveJsonString){
            //console.log("~" + dataStr);
            this.lastSaveJsonString = dataStr;
            this.save(dataStr);
        }
    }

}

import { director } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { BYTEDANCE } from 'cc/env';
import { GameComponent } from 'db://oops-framework/module/common/GameComponent';
import { Utility } from '../Utility/Utility';
import { oops } from 'db://oops-framework/core/Oops';
import { GameEvent } from '../../common/config/GameEvent';
import { UIID } from '../../common/config/GameUIConfig';
import { PlayerSystem } from './PlayerSystem';
const { ccclass, property } = _decorator;

interface IUIMusicInfo {
    uiId: UIID;
    musicId: number;
}

@ccclass('UIMusicManager')
export class UIMusicManager extends GameComponent {
    private static _inst: UIMusicManager;
    public static get inst(): UIMusicManager {


        if (this._inst == null) {
            this._inst = UIMusicManager.createMgr();
        }
        return this._inst;
    }

    private mInited: boolean = false;

    private mMusicList: IUIMusicInfo[] = [];

    private static createMgr():UIMusicManager{
        let musicMgr = new Node();
        musicMgr.name = '__uiMusicMgr__';
        director.getScene()?.addChild(musicMgr);
        director.addPersistRootNode(musicMgr);
        return musicMgr.addComponent(UIMusicManager);
    }

    public init(): void {
        if (this.mInited) {
            return;
        }
        this.mInited = true;
    }

    protected onLoad(): void {
        this.on(GameEvent.LayerRemove, this.onRemoveUI, this);
        this.on(GameEvent.StopUIMuisc, this.onStopUIMusic, this);
    }

    playUIMusic(uiId: UIID, musicId: number, isLoop: boolean = false, volume: number = 1): void {
        //UI
        let has = false;
        for(let i = 0; i < this.mMusicList.length; i ++){
            if(this.mMusicList[i].uiId == uiId){
                // console.log("playUIMusic uiId:%s, musicId:%s,mMusicListId:%s", uiId, musicId, this.mMusicList[i].musicId);
                if(this.mMusicList[i].musicId == musicId)
                {
                    //
                    return;
                }
                this.mMusicList[i].musicId = musicId;
                has = true;
                break;
            }
        }
        if(!has){
            this.mMusicList.push({uiId: uiId, musicId: musicId});
        }
        if(musicId == 0){
            oops.audio.stopMusic();
        }
        console.log("Bgm:"+musicId);
        if(oops.audio.volumeMusic == 0 && PlayerSystem.Instance.IsOpenVideo){
            volume = 0;
        }
        oops.audio.playMusic(Utility.GetMusicUrl(musicId), undefined, "Audios", isLoop, volume);
    }

    onRemoveUI(event: string, args: any): void {
        let hasMusic = false;
        for(let i = this.mMusicList.length - 1; i >= 0; i--){
            // console.log("onRemoveUI uiId:%s, args:%s", this.mMusicList[i].uiId, args);
            if(this.mMusicList[i].uiId == args){
                hasMusic = true;
                this.mMusicList.splice(i, 1);
                break;
            }
        }
        if(hasMusic){
            if(this.mMusicList.length > 0){
                let mInfo = this.mMusicList[this.mMusicList.length -1];
    
                console.log("Bgm:"+mInfo.musicId);
                oops.audio.playMusic(Utility.GetMusicUrl(mInfo.musicId), undefined, "Audios");
            }
        }
        
    }

    PlayMusicContinue()
    {
        if(this.mMusicList.length > 0){
            let mInfo = this.mMusicList[this.mMusicList.length -1];
            oops.audio.playMusic(Utility.GetMusicUrl(mInfo.musicId), undefined, "Audios");
        }
    }

    StopMusic(id: number)
    {
        for(let i = this.mMusicList.length - 1; i >= 0; i--){
            if(this.mMusicList[i].musicId == id){
                this.mMusicList.splice(i);
                break;
            }
        }
        oops.audio.stopMusic();
    }

    onStopUIMusic(event: string, args: any) {
        for(let i = this.mMusicList.length - 1; i >= 0; i--){
            if(this.mMusicList[i].musicId == args){
                this.mMusicList[i].musicId = 0;
                break;
            }
        }
    }

}
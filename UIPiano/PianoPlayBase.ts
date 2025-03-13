import { _decorator, Component, Node, Vec3, director, Camera, SpriteFrame, ImageAsset, Texture2D, EventHandler, ParticleSystem, tween } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { Console, debug, time } from 'console';
import { UITransform } from 'cc';
import { instantiate } from 'cc';
import { Sprite } from 'cc';
import ConfigManager from "../manager/Config/ConfigManager";
import { Label } from 'cc';
import { TrAudio, TrRhythmGame } from "../schema/schema";
import { UIPianoPlay } from "./UIPianoPlay";
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { Utility } from '../gameplay/Utility/Utility';
import { forEach } from 'jszip';
import { GameEvent } from '../common/config/GameEvent';
import { SdkManager } from '../../modules/sdk/SdkManager';
import { MusicNoteDrop } from './MusicNoteDrop';
import * as exp from 'constants';
import { Transform } from 'class-transformer';
import { TimeUtil } from 'db://oops-framework/core/utils/TimeUtils';
const { ccclass, property } = _decorator;
export enum E_OverLap
{
    miss,
    nice,
    great,
    perfect,
}
export enum E_MusicNoteType
{
    single,
    press,
}

export class PianoPlayBase{
    private readonly _singleMusicNoteInitPosY = 1000;
    private _btnClickArea: Node = null!;
    private _music_line: Node = null!;

    testTable:number[]=[];
    _dropSpeed: number = 4; // 
    private startPosition: Vec3 = new Vec3();
    private screenBottom: number = 0;
    protected musicline_x: number = 0;//
    startTime:number = 0;
    //startTime_MusicNote_press:number = 0;
    musicNoteList_single: Node[]=[];
    musicNoteList_press: Node[]=[];
    e_overLap:E_OverLap = E_OverLap.miss;
    private _isMouseDown:boolean=false;
    protected indexMusicNote:number=0;
    private _currentMusicInfo:MusicInfo|null=null;
    private delList_musicNote_single:number[]=[];
    private delList_musicNote_press:DelList_musicNote_press[]=[];
    protected _uiPianoPlay:UIPianoPlay=null!;
    private boundHandleCustomEvent: ((...args:any[]) => void)|null=null;
    protected allCfgData = new Map<number, TrRhythmGame[]>();
    //testData
    protected _list_musicInfo:MusicInfo[]=[];
    protected static _isLeftOver:boolean=false;
    protected static _isRightOver:boolean=false;
    protected musicalNoteData: number[][]|undefined;
    private startDate: number = 0;
    private height_MusicNote_Sc:number = 0;
    private height_MusicNote_Start:number = 0;
    private height_MusicNote_End: number = 61;
    private _audioPress:TrAudio=null!;
    public NextTime:number = 0
    onAdded(data: any) {
        return true;
    }
    onLoad(){

        this._uiPianoPlay = oops.gui.get(UIID.UIPianoPlay)?.getComponent(UIPianoPlay)!;
        //this._uiPianoPlay = oops.gui.get(UIID.UIPianoPlay);
        // this._uiPianoPlay.levelId = this._levelId;
        // this._uiPianoPlay.roleId = this._roleId;

    }
    init(btnClickArea:Node, music_line:Node){
        this._btnClickArea = btnClickArea;
        this._btnClickArea.on(Node.EventType.TOUCH_END, () => {
            this.On_BtnClickArea_Click()
        }, this);
        this._music_line = music_line;
        this._list_musicInfo=[];
        this.startDate = Date.now();
        this.loadCfgData();
        this.SetMusicLine();
        this._dropSpeed = this._dropSpeed * this._uiPianoPlay._tbRhythmGameGK?.MusicSpeed!
    }
    start() {
        this._audioPress =ConfigManager.tables.TbAudio.get(2059)!;
        this._uiPianoPlay?.EventBus.on('simpleEvent', this.boundHandleCustomEvent=(...args)=>
            {
                if (args.length>=4) {
                    //
                }
                    
        });
        if (!this._uiPianoPlay?.MusicNote_Single) {
            return;
        }
        this.height_MusicNote_Sc=this._uiPianoPlay.MusicNote_Sc?.getComponent(UITransform)?.height!
        this.height_MusicNote_Start=this._uiPianoPlay.MusicNote_Start?.getComponent(UITransform)?.height!
        this.startPosition = this._uiPianoPlay.MusicNote_Single.position.clone(); // 
        this._btnClickArea?.on('custom_mouse_down', this.onMouseDown, this);
        this._btnClickArea?.on('custom_mouse_up', this.onMouseUp, this);

        this.indexMusicNote = 0;
        if (this._list_musicInfo) {
            this._currentMusicInfo! = this._list_musicInfo[this.indexMusicNote];
            this.NextTime = this._currentMusicInfo?.disTime;
        }

        this.updateScreenBottom();
    }

    onMouseDown(eventData: string) {
        this._isMouseDown = true;
    }

    onMouseUp(eventData: string) {
        this._isMouseDown = false;
    }

    updateGame() {
        if (this._uiPianoPlay._isPaused) {
            return;
        }
        if (!this._uiPianoPlay.MusicNote_Single && !this._uiPianoPlay.MusicNote_Press) 
            return;
        
        // 
        
        let now = Date.now()/1000
        if(this._currentMusicInfo &&  now >= this._uiPianoPlay.startTime + this.NextTime + this._uiPianoPlay. GameHideTimeAdd)
        {
            switch (this._currentMusicInfo?.MusicNoteType) {
                case E_MusicNoteType.single:
                    this.createMusicIcon_single();
                    break;
                case E_MusicNoteType.press:
                    this.createMusicIcon_longPress(this._currentMusicInfo.length_MusicNote_press);
                    break;
                default:
                    break;
            }

            this.indexMusicNote++;
            this._currentMusicInfo = this._list_musicInfo[this.indexMusicNote];
            this.NextTime += this._currentMusicInfo?.disTime;
        }
        
        ///
        for(let i=0;i<this.musicNoteList_single.length;i++)
        {
            let node = this.musicNoteList_single[i]
            // let newPosition = node.position;
            // let y = newPosition.y - this._dropSpeed;
            // let pos = new Vec3(newPosition.x,y,newPosition.z);
            // newPosition = pos;
            // node.setPosition(newPosition);
            if (node.position.y<-1000) {
                this.delList_musicNote_single.push(i);
            }

            let nodeWorldY = node.getWorldPosition(new Vec3());
            if(!node.name.toString().includes("over") && nodeWorldY && nodeWorldY.y<300)
            {
                this.onMusicNoteDropOver(node);
            }
        }

        for (let i = 0; i < this.musicNoteList_press.length; i++) {
            let node = this.musicNoteList_press[i]
            //let newPosition = node.position;
            //let y = newPosition.y - this._dropSpeed;
            //let pos = new Vec3(newPosition.x, y, newPosition.z);
            let nodeChildEnd = node.getChildByName("MusicNote_End");
            let nodeChildStart = node.getChildByName("MusicNote_Start");
            
            //newPosition = pos;
            //node.setPosition(newPosition);
            if (node.position.y < -1000) {
                let ins = new DelList_musicNote_press(i,0)
                this.delList_musicNote_press.push(ins);
            }

            if (nodeChildStart) {
                let nodeWorldY = nodeChildStart.getWorldPosition();
                if (!node.name.toString().includes("over") && nodeWorldY && nodeWorldY.y<300) {
                    this.onMusicNoteDropOver(node);
                }
            }
            
            
        }

        this.removeMusicNote_single();
        this.removeMusicNote_press();

        if (this._isMouseDown) {
            this.On_longPress();
        }

    }

    PauseGame() {
        for (let i = 0; i < this.musicNoteList_single.length; i++) {
            const element = this.musicNoteList_single[i];
            let musicNoteDrop:MusicNoteDrop =  element.getComponent(MusicNoteDrop)!
            musicNoteDrop?.SetDropPause();
        }

        for (let i = 0; i < this.musicNoteList_press.length; i++) {
            const element = this.musicNoteList_press[i];
            let musicNoteDrop:MusicNoteDrop =  element.getComponent(MusicNoteDrop)!
            musicNoteDrop?.SetDropPause();
        }
    }
    ResumeGame() {
        for (let i = 0; i < this.musicNoteList_single.length; i++) {
            const element = this.musicNoteList_single[i];
            element.getComponent(MusicNoteDrop)?.SetDropResume();
        }
        
        for (let i = 0; i < this.musicNoteList_press.length; i++) {
            const element = this.musicNoteList_press[i];
            element.getComponent(MusicNoteDrop)?.SetDropResume();
        }
    }

    private loadCfgData() {
        this.allCfgData.clear();
        if (!this._uiPianoPlay) {
            console.error("_pianoDataManager ")
            return
        }
        if (!this._uiPianoPlay._tbRhythmGameGK) {
            console.error("_pianoDataManager._tbRhythmGameGK ")
            return
        }
      
        for (let m = 0; m < this.musicalNoteData!.length; m++) {
            const ele = this.musicalNoteData![m];
            let musicInfo = new MusicInfo;
            musicInfo.MusicNoteType = ele[0] == 0 ? E_MusicNoteType.single : E_MusicNoteType.press;
            musicInfo.disTime = ele[1] / 1000;
            musicInfo.length_MusicNote_press = ele[2];
            this._list_musicInfo.push(musicInfo);
        }
    }

    private SetMusicLine()
    {
        if(this.musicalNoteData!.length<=0)
        {
            this._music_line.active = false;
            this._btnClickArea.active=false;
        }
        else
        {
            this._music_line.active = true;
            this._btnClickArea.active=true;
        }
    }

    createMusicIcon_single()
    {
        let cloneObj;
        cloneObj = instantiate(this._uiPianoPlay.MusicNote_Single);
        if (cloneObj) {
            cloneObj.active = true;
            this._uiPianoPlay.node.addChild(cloneObj);
            this.musicNoteList_single.push(cloneObj);
            cloneObj.position = new Vec3(this.musicline_x, this._singleMusicNoteInitPosY, cloneObj.position.z)
            cloneObj.getComponent(MusicNoteDrop)!.InitPos_Y = this._singleMusicNoteInitPosY;
        }
    }
    
    createMusicIcon_longPress(pressLength:number)//
    {
        let yAdd = 0;
        let cloneObj = instantiate(this._uiPianoPlay.MusicNote_Press);
        
        if (cloneObj) {
            cloneObj.active = true;
            for (let i = 0; i < pressLength; i++) {
                let cloneSc = instantiate(this._uiPianoPlay.MusicNote_Sc);
                if (cloneSc)
                {
                    cloneSc.name = i.toString();
                    cloneSc.active = true;
                    cloneObj.addChild(cloneSc);
                }
                //yAdd += this.height_MusicNote_Sc/2
            }

            let cloneMusicNote_Start=instantiate(this._uiPianoPlay.MusicNote_Start);
            if (cloneMusicNote_Start) {
                cloneMusicNote_Start.active = true;
                cloneObj.addChild(cloneMusicNote_Start);
                //yAdd += this.height_MusicNote_Start/2
            }

            this._uiPianoPlay.node.addChild(cloneObj);
            this.musicNoteList_press.push(cloneObj);
            let initPos_Y = 1372 + yAdd
            cloneObj.position = new Vec3(this.musicline_x,initPos_Y,cloneObj.position.z)
            cloneObj.getComponent(MusicNoteDrop)!.InitPos_Y = initPos_Y;
        }
    }

    calculateTailDestroy(targetY:number,nodeObj:Node)
    {

    }

    resetIconPosition() {
        if (this._uiPianoPlay.MusicNote_Single) {
            this._uiPianoPlay.MusicNote_Single.setPosition(this.startPosition);
        }
    }

    updateScreenBottom() {
        if (this._uiPianoPlay.node.parent) {
            const uITransform = this._uiPianoPlay.node.parent.getComponent(UITransform);

            const parentHeight = uITransform?.contentSize.height;
            //this.screenBottom = -parentHeight / 2;
        }
    }

    reset(): void {

    }

    On_BtnClickArea_Click() {
        if (!this._btnClickArea) {
            return;
        }

        //combo
        let t_overlap = E_OverLap.miss;
        let maxLapVlaue=0;//
        let index=0;
        for (let i = 0; i < this.musicNoteList_single.length; i++) {
            let isInDelList = this.NoteSingleIsInDelList(i)
            if (isInDelList) {
                continue;
            }

            let cloneNode = this.musicNoteList_single[i];
            if (cloneNode) {
                let overlapVlaue = this._uiPianoPlay.calculateOverlapValue(this._btnClickArea, cloneNode)!
                if (overlapVlaue>maxLapVlaue) {
                    maxLapVlaue = overlapVlaue;
                    index=i;
                }
            }
        }

        let overlap = this._uiPianoPlay.calculateOverlap(maxLapVlaue);
        if (overlap != E_OverLap.miss) {
            t_overlap = overlap;
            if (this._uiPianoPlay) {
                this._uiPianoPlay.ComboCount ++;
            }
            this._uiPianoPlay?.OnScoreChange(maxLapVlaue);
            this.delList_musicNote_single.push(index);
            this.SetButtonEffect(this._uiPianoPlay.ComboCount)
            let audio =ConfigManager.tables.TbAudio.get(2012)!;
                oops.audio.playEffect(audio?.Resource, "Audios");
        }

    }

    On_longPress() {
        let maxLapValue=0;//
        let index=0;
        for (let i = 0; i < this.musicNoteList_press.length; i++) {
            let isInDelList = this.NotePressIsInDelList(i)
            if (isInDelList) {
                continue;
            }

            let cloneNode = this.musicNoteList_press[i];
            if (cloneNode) {
                let musicNote_start = cloneNode.getChildByName("MusicNote_Start")!;
                let overlapVlaue = this._uiPianoPlay.calculateOverlapValue(this._btnClickArea, musicNote_start)!
                if (overlapVlaue>maxLapValue) {
                    maxLapValue = overlapVlaue;
                    index=i;
                }
                
            }
        }

        let overlap = this._uiPianoPlay.calculateOverlap(maxLapValue);
        if (overlap != undefined && overlap != E_OverLap.miss && this._uiPianoPlay) {
            this.delList_musicNote_press.push(new DelList_musicNote_press(index, maxLapValue));

            oops.audio.playEffect(this._audioPress.Resource, "Audios");
        }
    }

    NotePressIsInDelList(index:number)
    {
        for (let i = 0; i < this.delList_musicNote_press.length; i++) {
            const element = this.delList_musicNote_press[i];
            if (element.MusicNote_pressIndex == index) {
                return true
            }
            
        }
        return false
    }

    NoteSingleIsInDelList(index:number)
    {
        for (let i = 0; i < this.delList_musicNote_single.length; i++) {
            const element = this.delList_musicNote_single[i];
            if (element == index) {
                return true
            }
            
        }
        return false
    }

    //todo
    //
    onMusicNoteDropOver(node:Node)
    {
        this._uiPianoPlay.ComboCount = 0;
        node.name = node.name + "_over";
        this._uiPianoPlay?.OnScoreChange(0);
        
        let audio =ConfigManager.tables.TbAudio.get(2011)!;
        oops.audio.playEffect(audio?.Resource, "Audios");
        
    }

    removeMusicNote_single() {
        for (let i = 0; i < this.delList_musicNote_single.length; i++) {
            let node = this.musicNoteList_single[this.delList_musicNote_single[i]]
            this.musicNoteList_single.splice(this.delList_musicNote_single[i], 1);
            if (node) {
                node.destroy();
            }
            
        }
        this.delList_musicNote_single=[];
    }

    removeMusicNote_press() {
        if (!this._btnClickArea) {
            return;
        }

        let allDel=false;
        for (let i = 0; i < this.delList_musicNote_press.length; i++) {
            let index = this.delList_musicNote_press[i].MusicNote_pressIndex
            let overlapValue = this.delList_musicNote_press[i].OverlapValue
            let node = this.musicNoteList_press[index]
            
            if (!node) {
                continue;
            }
            for (let index = node.children.length-1; index >=0; index--) {
                let childNode = node.children[index];
                let overlapVlaue = this._uiPianoPlay.calculateOverlapValue(childNode,this._btnClickArea)!;
                let overLap = this._uiPianoPlay.calculateOverlap(overlapVlaue)
                if (overLap == E_OverLap.perfect) {
                    if (childNode.name != "MusicNote_Start" && childNode.name != "MusicNote_End")
                    {
                        if (this._isMouseDown) {
                            this._uiPianoPlay.ComboCount++;
                            this.SetButtonEffect(this._uiPianoPlay.ComboCount)
                            this._uiPianoPlay?.OnScoreChange(overlapValue);
                        }
                    }

                    if (this._isMouseDown) {
                        childNode.destroy();  
                    }
                }

                if (childNode.getWorldPosition(new Vec3()).y <= -600) {
                    // this._uiPianoPlay.ComboCount++;
                    // this.SetButtonEffect(this._uiPianoPlay.ComboCount)
                    // this._uiPianoPlay?.OnScoreChange(overlapValue);
                    childNode.destroy();
                }
            }

            if (node.children.length<=0) {
                this.musicNoteList_press.splice(index, 1);
                node.destroy();
                allDel=true;
            }
        }

        if (allDel) {
            this.delList_musicNote_press=[];
        }
        //
    }

    private async loadImage(urlPath: string, node: Sprite | null) {
        let image = await oops.res.loadAsync<ImageAsset>("UIPianoPlay", urlPath);
        if (image && node != null) {
            const texture = new Texture2D();
            texture.image = image;

            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            node.spriteFrame = spriteFrame;
        }
    }

    SetButtonEffect(comboCount: number)
    {
        let MusicalChange1=ConfigManager.tables.TbConst.get("MusicalChange1")!.Int;
        let MusicalChange2=ConfigManager.tables.TbConst.get("MusicalChange2")!.Int;
        let effectNodeName:string;
        if (comboCount >= MusicalChange2) {
            effectNodeName = "Effect_Huan_03"
        }
        else if (comboCount >= MusicalChange1) {
            effectNodeName = "Effect_Huan_02"
        }
        else {
            effectNodeName = "Effect_Huan_01"
        }

        let effect = this._btnClickArea.getChildByName("Effect")!;
        let btnEffectNode = effect.getChildByName(effectNodeName)
        this.PlayNodeEffect(btnEffectNode!)
    }

    PlayNodeEffect(rootNode:Node)//
    {
        for (let i = 0; i < rootNode.children.length; i++) {
            const element = rootNode.children[i];
            let ptlSystem : ParticleSystem = element.getComponent(ParticleSystem)!
            if ( ptlSystem.isPlaying) {
                ptlSystem.stop()
            }
            ptlSystem?.play();
            this.PlayNodeEffect(element)
        }
    }

    protected async JudgGameOver()
    {
        if (PianoPlayBase._isLeftOver && PianoPlayBase._isRightOver) {
            console.log("!")
            let diffSeconds = (Date.now() - this.startDate) / 1000;
            SdkManager.inst.event("musicgame_time", { userid: PlayerSystem.Instance.CurPlayId, musicgame_time:Math.ceil(diffSeconds)});
            let ShapeUiOverTime = this.GetShowPianoOverTime()
            await this.delay(ShapeUiOverTime * 1000)//n
            let score:number|undefined=this._uiPianoPlay?.GetAllScore();
            
            SdkManager.inst.event("musicgame_end_times", { userid: PlayerSystem.Instance.CurPlayId, musicgame_end_times: 1});
            
            let uiPianoPlay = oops.gui.get(UIID.UIPianoPlay)?.getComponent(UIPianoPlay)!;
            if (uiPianoPlay) {
                oops.gui.openAsync(UIID.UIPianoOver, {
                    allScore: score,
                    levelId:this._uiPianoPlay.levelId,
                    roleId:this._uiPianoPlay.roleId,
                }).then(()=>{
                    oops.gui.remove(UIID.UIPianoPlay);
                })
            }
        }
    }

    GetShowPianoOverTime()
    {
        let musicId = this._uiPianoPlay._tbRhythmGameGK?.MusicId;
        const cfgs = ConfigManager.tables.TbRhythmGame.get(musicId!);
        console.log(cfgs?.Time + "")
        return cfgs!.Time
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onDestroy(): void {
        if (this.boundHandleCustomEvent) {
            this._uiPianoPlay?.EventBus.off('simpleEvent', this.boundHandleCustomEvent);
        }
        
        this._uiPianoPlay.node.off('custom_mouse_Down', this.onMouseDown, this);
        this._uiPianoPlay.node.off('custom_mouse_Up', this.onMouseUp, this);
    }
    
}

export class MusicInfo{
    public MusicNoteType:E_MusicNoteType = E_MusicNoteType.single;//
    public disTime:number = 0;//
    public length_MusicNote_press:number=0;//0
}

export class DelList_musicNote_press {
    public MusicNote_pressIndex: number = 0;
    public OverlapValue: number = 0;
    constructor(musicNote_pressIndex:number,overlapValue:E_OverLap){
        this.MusicNote_pressIndex = musicNote_pressIndex
        this.OverlapValue = overlapValue;
    }
}

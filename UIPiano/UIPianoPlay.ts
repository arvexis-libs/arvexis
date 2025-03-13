import { EventEmitter } from './EventEmitter';
import { _decorator, Sprite, Label, Component, Node, UITransform, Vec3, director, Camera, SpriteFrame, ImageAsset, Texture2D, EventHandler, Animation,ParticleSystem} from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { math } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { MusicInfo, PianoPlayBase, E_MusicNoteType, E_OverLap } from "./PianoPlayBase";
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { Utility } from '../gameplay/Utility/Utility';
import ConfigManager from '../manager/Config/ConfigManager';
import { TrRhythmGameGK } from '../schema/schema';
import { UIID } from '../common/config/GameUIConfig';
import { tips } from "../common/prompt/TipsManager";
import { error } from 'console';
import { StorySystem } from '../gameplay/Manager/StorySystem';
import { PianoPlayLeft } from './PianoPlayLeft';
import { PianoPlayRight } from './PianoPlayRight';
import { UIMusicManager } from '../gameplay/Manager/UIMusicManager';

const { ccclass, property } = _decorator;
@ccclass('UIPianoPlay') 
export class UIPianoPlay extends CCComp {
    @property({ type: Node })
    MusicNote_Single: Node | null = null; // 
    @property({ type: Node })
    MusicNote_Start: Node | null = null; // 
    @property({ type: Node })
    MusicNote_Press: Node | null = null; // 
    @property({ type: Node })
    MusicNote_Sc:Node|null = null;//
    @property(Sprite)
    Bg1: Sprite = null!;
    @property(Sprite)
    Bg2: Sprite = null!;

    @property(Node)
    NiceObj: Node = null!;
    @property(Sprite)
    NiceIcon: Sprite = null!;

    @property(Label)
    NiceValue: Label = null!;

    @property(Label)
    ComboValue: Label = null!;

    @property(Label)
    ScoreAdd:Label=null!;
    
    @property(Label)
    ScoreValue:Label=null!;

    @property(Node)
    btnClickArea_L: Node = null!;
    @property(Node)
    music_line_L: Node = null!;

    @property(Node)
    btnClickArea_R: Node = null!;
    @property(Node)
    music_line_R: Node = null!;

    private _allScore: number = 0;//
    private _scoreMusicNoteBase: number = 0;//(*)
    private _scoreBonus: number = 0.2;//-%
    private _currentSore: number = 0;//missnice
    public EventBus = new EventEmitter();
    public ComboCount: number = 0;
    public levelId = 0;//ID
    public roleId:number|undefined;//ID
    public _tbRhythmGameGK:TrRhythmGameGK|undefined=null!;//
    private _curBgName:string|undefined;
    private _pianoPlayLeft:PianoPlayLeft|null=null;
    private _pianoPlayRight:PianoPlayBase|null=null;
    private _progressMusic = 0;
    public _isPaused:boolean=false;//
    private _gameHideTime:number=0;//
    public GameHideTimeAdd:number=0;//

    onAdded(data: any) {
        this.levelId = data.levelId
        this.roleId = data.roleId
        return true;
    }
    protected onLoad(): void {
        this._pianoPlayLeft = new PianoPlayLeft();
        this._pianoPlayRight = new PianoPlayRight();
        this._pianoPlayLeft.onLoad();
        this._pianoPlayRight.onLoad();
     
        this._tbRhythmGameGK = ConfigManager.tables.TbRhythmGameGK.get(this.levelId);
        this._scoreMusicNoteBase = this._tbRhythmGameGK?.MusicalScore!;
    }
    protected onEnable(): void {
        this._pianoPlayLeft?.init(this.btnClickArea_L, this.music_line_L)
        this._pianoPlayRight?.init(this.btnClickArea_R, this.music_line_R)
    }

    public startTime = 0;
    start() {
        this.setGameHide();
        this.setGameShow();
        this.ScoreValue.string = "0";
        this.NiceValue.string="0";
        this.SetBg(0);
        this.SetInitDate()
        this.PlayBgMusic(0);
        
        this.startTime = Date.now()/1000;
        this._pianoPlayLeft?.start();
        this._pianoPlayRight?.start();
    }

    update(dt: number): void {
        if (this._isPaused) {
            return;
        }
        this._progressMusic = oops.audio.progressMusic;
        this._pianoPlayLeft!.updateGame()
        this._pianoPlayRight!.updateGame()
    }
    // gupdate()
    // {

        
    //     this.schedule(() => {
            
            
    //         console.log(":", director.getTotalFrames());
    //     },this.FIXEDTIME)
    // }

    public GetAllScore() {
        return this._allScore;
    }
    public OnScoreChange(maxLapValue:number) {
        console.log("maxLapValueee " + maxLapValue);
        let overlap = this.calculateOverlap(maxLapValue);
        let scoreMusicNote = this._scoreMusicNoteBase * maxLapValue;
        let comboBonusValue = this.GetComboBonusValue(this.ComboCount);
        let allBonus = this._tbRhythmGameGK?.ScoreBonus!/100 + comboBonusValue/100;
        this._currentSore = Math.round(scoreMusicNote * (1 + allBonus));
        this._allScore += this._currentSore;
        this.ScoreValue.string = this._allScore.toString();
        this.setNiceProp(overlap,this._currentSore);
        this.EventBus.emit("simpleEvent", this._allScore, this._currentSore,overlap,this.ComboCount);
        this.SetBg(this.ComboCount);
        
        this.ScoreAdd.string = (comboBonusValue+ this._tbRhythmGameGK!.ShowDifficulty).toString();
    }

    reset(): void {

    }

    GetComboBonusValue(comboCount:number)
    {
        let arrComboBouns = this._tbRhythmGameGK?.ComboBonus!
        let MusicalChange1=ConfigManager.tables.TbConst.get("MusicalChange1")!.Int;
        let MusicalChange2=ConfigManager.tables.TbConst.get("MusicalChange2")!.Int;
        if (comboCount >= MusicalChange2) {
            return arrComboBouns[1]
        }
        else if (comboCount >= MusicalChange1) {
            return arrComboBouns[0]
        }
        else {
            return 0
        }
    }

    SetInitDate()
    {
        if(this._tbRhythmGameGK)
        {
            this.ScoreAdd.string = this._tbRhythmGameGK!.ShowDifficulty.toString();
        }
    }

    async SetBg(comboCount: number) {
        const bgPic = this._tbRhythmGameGK?.BGChange!;
        let MusicalChange1=ConfigManager.tables.TbConst.get("MusicalChange1")!.Int;
        let MusicalChange2=ConfigManager.tables.TbConst.get("MusicalChange2")!.Int;
        let bgName;
        if (comboCount >= MusicalChange2) {
            bgName = bgPic[2]
        }
        else if (comboCount >= MusicalChange1) {
            bgName = bgPic[1]
        }
        else {
            bgName = bgPic[0]
        }

        if (this._curBgName == bgName) {
            return;
        }
        this._curBgName=bgName;
        let spF = await Utility.loadImage("Image/" + bgName, "UIPianoPlay");
        if (this.Bg1 && spF) {            
            this.Bg2.node.active = true;
            this.Bg2.spriteFrame = this.Bg1.spriteFrame;
            this.Bg1.spriteFrame = spF
            this.Bg1.getComponent(Animation)?.play("UIPianoPlayBGAnim_jianxian");
            this.Bg2.getComponent(Animation)?.play("UIPianoPlayBGAnim_jianyin");
        }
    }

    setNiceProp(overLap: E_OverLap, currentScore: number) {
        let spriteName;
        let animName;
        let effectNodeName:string|undefined="";
        switch (overLap) {
            case E_OverLap.miss:
                spriteName = "music_Miss";
                animName = "NiceIconAnim_Miss";
                effectNodeName = "";
                break;
            case E_OverLap.nice:
                spriteName = "music_nice";
                animName = "NiceIconAnim_NiceAndGreat";
                effectNodeName = "Effect_NiceAndGreat";
                break;
            case E_OverLap.great:
                console.log("great");
                spriteName = "music_great";
                animName = "NiceIconAnim_NiceAndGreat";
                effectNodeName = "Effect_NiceAndGreat";
                break;
            case E_OverLap.perfect:
                console.log("perfect");
                spriteName = "music_Perfect";
                animName = "NiceIconAnim_Prefect";
                effectNodeName = "Effect_Prefect";
                break;
            default:
                break;
        }

        this.setSprite(this.NiceIcon, "SpritesPianoPlay/" + spriteName + "/spriteFrame", "UIPianoPlay");
        this.NiceValue.string = currentScore.toString();
        this.ComboValue.string = this.ComboCount.toString();
        let anim = this.NiceObj.getComponent(Animation);
        anim?.play(animName);

        if (effectNodeName!="") {
            let btnEffectNode = this.NiceObj.getChildByName(effectNodeName)
            this.PlayNodeEffect(btnEffectNode!);
        }
        
    }

    public BtnBack_Click() {
        this._gameHideTime = Date.now()/1000;
        this._isPaused=true;
        this.PauseGame();
        
        this._progressMusic = oops.audio.progressMusic;
        oops.audio.stopMusic()
        tips.confirm("", () => {
            oops.gui.remove(UIID.UIPianoPlay)
            UIMusicManager.inst.PlayMusicContinue();
            StorySystem.Instance.ForceOver();
        }, "", () => {
            this._isPaused = false;
            this.GameHideTimeAdd += Date.now() / 1000 - this._gameHideTime
            this.ResumeGame();
            this.PlayBgMusic(this._progressMusic);
        }, "", true);
    }

    PauseGame() {
        this._pianoPlayLeft?.PauseGame()
        this._pianoPlayRight?.PauseGame()
    }
    ResumeGame() {
        this._pianoPlayLeft?.ResumeGame()
        this._pianoPlayRight?.ResumeGame()
    }

    PlayNodeEffect(parentNode: Node) {
        const children = parentNode.children;
        children.forEach(child => {
            const particleSystem = child.getComponent(ParticleSystem);
            if (particleSystem) {
                particleSystem.play();
            }
        })
    }

    calculateOverlap(overLapValue: number) {
        if (overLapValue <= 0) {
            return E_OverLap.miss;
        }
        else if (overLapValue <= 0.33) {
            return E_OverLap.nice;
        }
        else if (overLapValue <= 0.66) {
            return E_OverLap.great;
        }
        else if (overLapValue <= 1) {
            return E_OverLap.perfect;
        }
        else {

        }

        return E_OverLap.miss;
    }

    calculateOverlapValue(nodeA: Node, nodeB: Node) {
        if (!nodeA || !nodeB) {
            return;
        }
        let nodeATrans = nodeA.getComponent(UITransform);
        let nodeBTrans = nodeB.getComponent(UITransform);
        if (!nodeATrans || !nodeBTrans)

            return;

        const rA = nodeATrans.contentSize.height / 2;
        const rB = nodeBTrans.contentSize.height / 2;
        let des = this.calculateDistance(nodeA, nodeB);
        let overlap = Math.max(0, 1 - des / (rA + rB));
        return overlap;
    }

    calculateDistance(nodeA: Node, nodeB: Node): number {
        const screenPosA = (nodeA.getWorldPosition(new Vec3()));
        const screenPosB = (nodeB.getWorldPosition(new Vec3()));

        const dx = screenPosB.x - screenPosA.x;
        const dy = screenPosB.y - screenPosA.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    protected onGameHide(): void {
        if (!this._isPaused) {
            this._gameHideTime = Date.now()/1000;
        }
    }

    protected onGameShow(): void {
        if (!this._isPaused)
        {
            this.GameHideTimeAdd += Date.now() / 1000 - this._gameHideTime
            this.PlayBgMusic(this._progressMusic);
        }
    }

    protected onDestroy(): void {
        this._pianoPlayLeft?.onDestroy();
        this._pianoPlayRight?.onDestroy();
    }

    private PlayBgMusic(progress:number)
    {
        if (this._tbRhythmGameGK) {
            const cfgs = ConfigManager.tables.TbRhythmGame.get(this._tbRhythmGameGK!.MusicId);
            oops.audio.playMusic("Music/" + cfgs?.MusicRes, ()=>{
                oops.audio.progressMusic = progress;
            }, "UIPianoPlay");
        }
    }
}



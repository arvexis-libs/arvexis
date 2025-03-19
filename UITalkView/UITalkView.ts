import { _decorator, Component, Node, tween, color, Vec4, Color } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { Label } from 'cc';
import ConfigManager from '../manager/Config/ConfigManager';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { GameEvent } from '../common/config/GameEvent';
import { changeSpine, changeSpriteImage, getImagePath, getLabelText } from '../common/UIExTool';
import { Sprite } from 'cc';
import { sp } from 'cc';
import { Button } from 'cc';
import { Utility } from '../gameplay/Utility/Utility';
import { TipsNoticeUtil } from '../gameplay/Utility/TipsNoticeUtil';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { v2 } from 'cc';
import { v3 } from 'cc';
import { UIMusicManager } from '../gameplay/Manager/UIMusicManager';
import { ItemEnum } from '../gameplay/GameDataModel/GameEnum';
import { TbTalk, TrTalk, TbConst } from '../schema/schema';
import { instantiate } from 'cc';
import { StorySystem } from '../gameplay/Manager/StorySystem';
import { Prefab } from 'cc';
import { debug } from 'console';
import { Tween } from 'cc';
import { EventTouch } from 'cc';
import { Vec3 } from 'cc';
import { UITransform } from 'cc';
import { Vec2 } from 'cc';
import { SpriteFrame } from 'cc';
import { Animation } from 'cc';
import { sys } from 'cc';
import { DEBUG } from 'cc/env';
import { SdkManager } from '../../modules/sdk/SdkManager';
import { GameDot } from '../gameplay/Manager/GameDot';
import { forEach } from 'jszip';
import { size } from 'cc';
const { ccclass, property } = _decorator;

// enum SpineDirection {
//     None = -1,
//     Mid = 0,
//     Left = 1,
//     Right = 2,
// }

enum TalkAutoPlayState {
    None = 0,
    OneSpeed,
    TwoSpeed,
}

@ccclass('UITalkView')
export class UITalkView extends CCComp {

    @property(Node)
    spContenBg1: Node = null!;
    @property(Node)
    spContenBg2: Node = null!;
    @property(Node)
    spContenBg3: Node = null!;

    @property(Label)
    textLabel: Label = null!;
    @property(Label)
    textOwerLabel: Label = null!;
    @property(Label)
    textAsideLabel: Label = null!;
    @property(Node)
    leftTagNode: Node = null!;
    @property(Label)
    leftNameLabel: Label = null!;
    // @property(Node)
    // leftNameRoot: Node = null!;
    @property(Node)
    rightTagNode: Node = null!;
    @property(Label)
    rightNameLabel: Label = null!;
    @property(Sprite)
    bg1Sprite: Sprite = null!;
    @property(Sprite)
    bg2Sprite: Sprite = null!;
    @property(Sprite)
    spriteSplash: Sprite = null!;

    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null!;
    @property(Node)
    skeleton_Node: Node = null!;
    
    @property(Node)
    backNode: Node = null!;
    @property(Button)
    btnAuto: Button = null!;
    @property(Label)
    btnAutoLabel: Label = null!;
    @property(Label)
    btnAutoLabelSpeed: Label = null!;
    @property(Node)
    btnAutoNormalNode: Node = null!;
    @property(Node)
    btnAutoSpeedNode: Node = null!;
    @property(sp.Skeleton)
    owerSkeleton: sp.Skeleton = null!;
    @property(Node)
    owerSkeleton_Node: Node = null!;
    

    @property(Node)
    effectParent:Node = null!;
    @property(Animation)
    contentBgAnimation:Animation = null!;
    @property(Node)
    debugSkipBtn: Node = null!;

    _originText: string = '';
    // 
    private _processedText: string = ''; 
    // id
    _lastTalkCfgID : number = 0;
    _talkId: number = 100001;
    _firstTalkId: number = 100001;//id
    private _currentTypingIndex: number = 0;
    
    /**  */
    private _interval: number = 0.05;
    private _isOwner: boolean = false;
    // 
    private _textTypingTimer : number = -1;

    // spine
    private _curSpinePath: string = "";
    // private _initSpineY: number = 0;
    private _bgPath: string = "";
    // private _lastAnim: string = "";
    private _isChangingSpine: boolean = false;
    private _isShowChanging: boolean = false;
    /** cd */
    private _cdClick: number = 0;
    /** cd */
    private _cdAutoClick: number = 0;
    // cd
    private _totalAutoPlayTime: number = 0;
    private lastEffectTid : number = 0;
    private _effectCache: Map<number, boolean> = new Map();  
    // id
    private _lastAudioId: number = 0;
    
    /**  0- 1-12-2 */
    private _autoPlayState: number = TalkAutoPlayState.None;
    // 
    private _autoNextPlayState: number = TalkAutoPlayState.None;
    // id
    private _curGroupIdIsReaded: boolean = false;
    // bg1bg2
    private _siblingIndexArr:number[] = [];
    // 
    private _currentBgIndex: number = 0;
    private _lastTranformContentBg: Node|null = null;
    private _hasContentName: boolean = false;
    private _isDestroy: boolean = false;
    // private readonly _spineZero: Color = new Color(255,255,255,0);
    // private readonly _spineNormal: Color = new Color(255,255,255,255);

    // 
    // spine
    private _owerSpinePath: string = "";
    // spine
    private _spineCacheDic: Map<string, boolean> = new Map();
    /**  */
    private _audioLeftTime: number = 0;
    private lastAmbTid:number = 0;
    private lastBgmTid:number = 0;

    get nameLabel() {
        if (this._isOwner) {
            return this.leftNameLabel;
        }
        return this.rightNameLabel;
    }
    get contentLabel() {
        if (this._isOwner) {
            return this.textOwerLabel;
        }
        if(this._hasContentName) {
            return this.textLabel;
        }
        return this.textAsideLabel;
    }

    /**
     * 
     * @param args {Id:Id}
     * @returns 
     */
    onAdded(args: any) {
        console.log("args:%s", args);
        if (args == null || args.Id == null) {
            // throw "talk miss id";
            console.error("talk miss id");
            args = {};
            args.Id = 200001;
        }
        this._lastTalkCfgID = -1;
        this._talkId = args.Id;
        this._firstTalkId = args.Id;
        return true;
    }

    protected onLoad(): void {
        // 
        this.node.on(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this._siblingIndexArr = [this.bg1Sprite.node.getSiblingIndex(),this.bg2Sprite.node.getSiblingIndex()];
        // this.skipNode.on(Button.EventType.CLICK, this._onClickSkip, this);
        // this.backNode.on(Button.EventType.CLICK, this._onClickBack, this);

        this.on(GameEvent.ChoiceOver, this._onTalkEnd, this);
    }
    onDestroy() {
        oops.audio.stopMusic();
        if(this.lastBgmTid != 0) {
            this.dispatchEvent(GameEvent.StopUIMuisc, this.lastBgmTid);
        }
        this.lastBgmTid = 0;

        this._onClear();
        for (const [id,_] of this._effectCache) {
            let effectCfg=ConfigManager.tables.TbEffect.get(id);
            if(effectCfg != null)
            {
                oops.res.release(effectCfg.Path, "Art");
            }
        }
        
        this.dispatchEvent(GameEvent.StopUIMuisc, UIID.TalkView);
    }

    reset(): void {

    }

    protected update(dt: number): void {
        if(this._isShowChanging) {
            return;
        }
        if(this._cdClick >= 0) {
            this._cdClick -= dt;
        }
        if(this._textTypingTimer <= 0 && this._autoPlayState != TalkAutoPlayState.None && this._cdAutoClick >= 0){
            this._cdAutoClick -= dt;
            if(this._cdAutoClick <= 0) {
                this._turnNext();
                return;
            }
        }        
        
        this._loadTex(dt);
        if(this._audioLeftTime >= 0) {
            this._audioLeftTime -= dt;
        }
    }

    async testForCheckCfg() {
        const list = ConfigManager.tables.TbTalk.getDataList();
        let data: Map<number, boolean> = new Map();
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if((element.IsOwner && element.Name != "") || (!element.IsOwner && element.Name == "")) {
                console.error("id%s, NameIsOwnerNameIsOwner",element.Id);
            }
            if(getImagePath(element.BgPathKey) == "") {
                console.error("id%s, BgPathKey ",element.Id);
            }
            if((element.MeSpinePath != "" && element.MeSpineAnimGroup.length == 0) || (element.MeSpinePath == "" && element.MeSpineAnimGroup.length > 0)) {
                console.error("id%s, MeSpinePath  MeSpineAnimGroup ",element.Id);
            }
            if(element.IsOwner && (element.MeSpinePath == "" || element.MeSpineAnimGroup.length == 0)) {
                console.error("id%s, MeSpinePath  MeSpineAnimGroup IsOwner ",element.Id);
            }
            if((element.SpinePath != "" && element.SpineAnimGroup.length == 0) || (element.SpinePath == "" && element.SpineAnimGroup.length > 0)) {
                console.error("id%s, SpinePath  SpineAnimGroup ",element.Id);
            }
            if(element.MeSpinePath != "") {
                const skeletonData = await oops.res.loadAsync<sp.SkeletonData>("UITalkView", element.MeSpinePath, sp.SkeletonData);
                if(skeletonData == null || skeletonData == undefined) {
                    console.error("id%s, MeSpinePath ",element.Id);
                }
            }
            if(element.SpinePath != "") {
                const skeletonData = await oops.res.loadAsync<sp.SkeletonData>("UITalkView", element.SpinePath, sp.SkeletonData);
                if(skeletonData == null || skeletonData == undefined) {
                    console.error("id%s,SpinePath ",element.Id);
                }
            }
            if(element.NextId == element.Id) {
                 console.error("id%s,id",element.Id);
            }
            if(element.NextId != -1) {
                const cfg = ConfigManager.tables.TbTalk.get(element.NextId);
                if(cfg == undefined || cfg == null) {
                    console.error("id%s,idid",element.Id);
                }
            }
            if(element.ContentKey.length > 0 && element.ContentKey.at(0) === ' ') {
                console.error("id%s,",element.Id);
            }
        }
        console.log("TalkView testForCheckCfg Down!!!");
    }

    start() {
        this._totalAutoPlayTime = ConfigManager.tables.TbConst.get("AutoPlayTime")?.Float ?? 2;
        if(this._totalAutoPlayTime <= 0){
            this._totalAutoPlayTime = 2;
        }
        this._onOpenRefresh();
    }

    /**
     * 
     * @param args {lastTalkId: Id, newId: id}
     */
    public _onReOpen(args: any) {
        if(args == null || args == undefined) {
            console.error("UITalkView onOpen error args:%s", args);
            return;
        }
        this._lastTalkCfgID = args.lastTalkId;
        this._talkId = args.newId;
        this._firstTalkId = args.newId;
        if(this._lastTalkCfgID != -1){
            const lastCfg = ConfigManager.tables.TbTalk.get(this._lastTalkCfgID);
            if(lastCfg) {
                this.lastBgmTid = lastCfg.BGM;
            }
        }

        this._onClear();
        this._onOpenRefresh();
    }

    /**
     * 
     * @returns 
     */
    private _onOpenRefresh() {        
        this._bgPath = "";
        const cfg = ConfigManager.tables.TbTalk.get(this._talkId);
        if (cfg == null) {
            return;
        }
        this._curGroupIdIsReaded = GameData.PlayerData.TalkDic.get(cfg.GroupId) != undefined;
        GameData.PlayerData.TalkDic.set(cfg.GroupId, 1);
        if(GameData.talkViewAutoType != 0) {
            this._autoNextPlayState = GameData.talkViewAutoType as TalkAutoPlayState;
        }
        if(!this._curGroupIdIsReaded && this._autoNextPlayState == TalkAutoPlayState.TwoSpeed) {
            this._autoNextPlayState = TalkAutoPlayState.OneSpeed;
        }
        this._autoPlayState = this._autoNextPlayState;
        this._isDestroy = false;

        this._firstTalkId = cfg.Id;
        //SdkManager.inst.event("dialog_look", { id: this._firstTalkId, state: 0});
        GameDot.Instance.DialogTalkDot(this._firstTalkId, 0);
        this._updateInfo(cfg);

        this.debugSkipBtn.active = sys.platform == sys.Platform.DESKTOP_BROWSER || DEBUG;
        // this.testForCheckCfg();
    }

    /**
     * 
     */
    private _onClear()  {
        this._audioLeftTime = 0;
        this._cdClick = 0;
        this._isChangingSpine = false;
        this._isShowChanging = false;
        this._lastTranformContentBg = null;
        this._currentBgIndex = 0;
        
        GameData.talkViewAutoType = this._autoNextPlayState;
        
        this._stopTyping();
        if(this._lastAudioId > 0) {
            oops.audio.stopEffectById(this._lastAudioId);
        }
        this._lastAudioId = 0;
        
        this._stopAudio();
        this.off(GameEvent.ChoiceOver);
        if(this._bgPath != "") {
            oops.res.release(this._bgPath, "UITalkView");
            this._bgPath = "";
        }
        this._stopContentTween();
        this._stopBgTween();
        this._clearSpineData();
        this.unscheduleAllCallbacks();
        
        this._isDestroy = true;
    }
    
    protected onEnable(): void {
        oops.message.on(GameEvent.OnUpdateTalk, this._updateTalk, this);
        oops.message.on(GameEvent.OnTalkReOpen, this._onReOpen, this);
        this._isDestroy = false;
    }

    protected onDisable(): void {
        oops.message.off(GameEvent.OnUpdateTalk, this._updateTalk, this);
        oops.message.off(GameEvent.OnTalkReOpen, this._onReOpen, this);

        oops.audio.stopEffect();
        this._stopAudio();
        this._isDestroy = true;
    }

    // args Id id
    _updateTalk(event: string, args: any) {
        if (args == null || args.Id == null) {
            return;
        }
        this._lastTalkCfgID = -1;
        this._talkId = args.Id;
        // this._firstTalkId = args.Id;
        // SdkManager.inst.event("dialog_look", { id: this._firstTalkId, state: 0});   
        this._updateInfo();
    }

    /**
     * 
     * spine
     * 
     * 
     * @param cfg 
     * @returns 
     */
    async _updateInfo(cfg?: TrTalk) {        
        if (cfg == null) {
            cfg = ConfigManager.tables.TbTalk.get(this._talkId);
        }
        if(cfg == null) {
            return;
        }
        
        this._isShowChanging = true;
        // await this.RefreshBg(cfg);
        await this._updateSpineAnim(cfg);
        if (this._isDestroy) return;
        await this._changeBackground(getImagePath(cfg.BgPathKey));
        if (this._isDestroy) return;
        this._updateOwerSpine(cfg);
        // if (this._isDestroy) return;
        await this._updateTypingContent(cfg);
        if (this._isDestroy) return;
        await this._updateAutoState(cfg);
        if (this._isDestroy) return;
        // UIMusicManager.inst.playUIMusic(UIID.TalkView, cfg.BGM);
        await this._refEffect(cfg);
        if (this._isDestroy) return;
        this._isShowChanging = false;
        this._playSound(cfg);
        this._startTyping();
    }

    async _updateAutoState(cfg?: TrTalk) {
        if (this._isDestroy) return;
        //  1
        if(this._autoNextPlayState == TalkAutoPlayState.TwoSpeed && !this._curGroupIdIsReaded) {
            this._autoNextPlayState = TalkAutoPlayState.OneSpeed;
        }
        
        let lab = "";
        let speed = "1";
        // let path = "Sprites/common_autoplay";
        if(this._autoNextPlayState == TalkAutoPlayState.OneSpeed){
            // path = "Sprites/common_autoplay1";
        }
        else if(this._autoNextPlayState == TalkAutoPlayState.TwoSpeed) {
            // path = "Sprites/common_autoplay2";
            speed = "2";
        }
        else{
            lab = "";
        }

        this.btnAutoLabel.string = lab;
        this.btnAutoLabelSpeed.string = speed;
        
        this.btnAutoNormalNode.active = this._autoNextPlayState == TalkAutoPlayState.None;
        this.btnAutoSpeedNode.active = this._autoNextPlayState != TalkAutoPlayState.None;
        this.btnAutoLabelSpeed.node.active = this._autoNextPlayState != TalkAutoPlayState.None;
    }

    private _clearSpineData() {
        Tween.stopAllByTarget(this.skeleton.node);
        if(this.skeleton.skeletonData != null) {
            this.skeleton.clearTracks();
            this.skeleton.skeletonData = null;
        }
        Tween.stopAllByTarget(this.owerSkeleton.node);
        if(this.owerSkeleton.skeletonData != null) {
            this.owerSkeleton.clearTracks();
            this.owerSkeleton.skeletonData = null;
        }

        this._spineCacheDic.forEach((value, key) => {
            oops.res.release(key, "UITalkView");
        });
        this._spineCacheDic.clear();
    }

    /**
     * spine
     * @param cfg 
     * @returns 
     */
    private async _updateSpineAnim(cfg:TrTalk)
    {
        if(cfg == null || this._isDestroy) {
            console.error("TrTalk is null");
            return;
        }

        // this.skeleton_Node.active = cfg.SpinePath != "";           
        this._markTouchCdIsInTime(0.3);

        // ,
        if(cfg.SpinePath == "" && this.skeleton.skeletonData == null) {
            // return;
        }
        else if(cfg.SpinePath == "" && this.skeleton.skeletonData != null) {
            //  spine
            Tween.stopAllByTarget(this.skeleton.node);
            // this.clearSpineData();
            // return;
        }
        else if(cfg.SpinePath != "" && this.skeleton.skeletonData != null) {
            // 
            //Spine
            let lastSpinePath = this._curSpinePath;
            this._curSpinePath = cfg.SpinePath;
            
            // spine
            if(lastSpinePath != this._curSpinePath) {
                Tween.stopAllByTarget(this.skeleton.node);
                this._markTouchCdIsInTime(0.5);
                await this.nextFrame(0.3);
                // this.scheduleOnce(async () => {this._changeSpine(this.skeleton, cfg);}, 0.3);
                this._changeSpine(this.skeleton, cfg);
            }
            else{
                // 
                let lastCfg = null;
                if(this._lastTalkCfgID != -1){
                    lastCfg = ConfigManager.tables.TbTalk.get(this._lastTalkCfgID);
                }
                this._markTouchCdIsInTime(0.2);
                this._playAnimation(this.skeleton, cfg.SpineAnimGroup, lastCfg?.SpineAnimGroup);
            }
        }
        else {            
            this._markTouchCdIsInTime(0.4);
            this._curSpinePath = cfg.SpinePath;
            
            this.skeleton.node.opacity = 0;
            // 
            await this._createNewSpine(this.skeleton, cfg);
            if(this.skeleton && !this._isDestroy) {
                Tween.stopAllByTarget(this.skeleton.node);
                tween(this.skeleton.node)
                    .to(0.3, {opacity: 255})
                    .start();
            }
            this._playAnimation(this.skeleton, cfg.SpineAnimGroup);
        }
        if(!this._isDestroy) {
            this.skeleton_Node.active = cfg.SpinePath != ""; 
        }
    }

    /**
     * spine
     * @param cfg 
     * @returns 
     */
    private async _updateOwerSpine(cfg:TrTalk) {
        if(cfg == null || this._isDestroy || this.owerSkeleton == null) {
            console.error("TrTalk is null or owerSkeleton is null");
            return;
        }

        this.owerSkeleton_Node.active = cfg.MeSpinePath != "";           
        this._markTouchCdIsInTime(0.3);

        // ,
        if(cfg.MeSpinePath == "" && this.owerSkeleton.skeletonData == null) {
            //this.clearSpineData();
            //d,
            // this.scheduleOnce(() => {this._isChangingSpine = false;}, 0.2);
            return;
        }
        else if(cfg.MeSpinePath == "" && this.owerSkeleton.skeletonData != null) {
            //  spine
            Tween.stopAllByTarget(this.owerSkeleton.node);
            // this.clearSpineData();
            return;
        }
        else if(cfg.MeSpinePath != "" && this.owerSkeleton.skeletonData != null) {
            // 
            //Spine
            let lastSpinePath = this._owerSpinePath;
            this._owerSpinePath = cfg.MeSpinePath;
            
            // spine
            if(lastSpinePath != this._owerSpinePath) {
                Tween.stopAllByTarget(this.owerSkeleton.node);
                this._markTouchCdIsInTime(0.5);
                this.scheduleOnce(async () => {this._changeSpine(this.owerSkeleton, cfg, true);}, 0.3);
            }
            else{
                // 
                let lastCfg = null;
                if(this._lastTalkCfgID != -1){
                    lastCfg = ConfigManager.tables.TbTalk.get(this._lastTalkCfgID);
                }
                this._markTouchCdIsInTime(0.2);
                this._playAnimation(this.owerSkeleton, cfg.MeSpineAnimGroup, lastCfg?.MeSpineAnimGroup);
            }
        }
        else {            
            this._markTouchCdIsInTime(0.4);
            this._owerSpinePath = cfg.MeSpinePath;
            
            this.owerSkeleton.node.opacity = 0;
            // 
            await this._createNewSpine(this.owerSkeleton, cfg, true);
            // this.owerSkeleton.node.opacity = 255;
            if(this.owerSkeleton && !this._isDestroy) {
                Tween.stopAllByTarget(this.owerSkeleton.node);
                tween(this.owerSkeleton.node)
                    .to(0.3, {opacity: 255})
                    .start();
                // await this.nextFrame(0.3);
            }
            // await this.nextFrame();
            this._playAnimation(this.owerSkeleton, cfg.MeSpineAnimGroup);
        }
    }

    /**
     * spine
     * @param skSpine 
     * @param cfg 
     * @param isOwer 
     * @returns 
     */
    private async _changeSpine(skSpine: sp.Skeleton, cfg: TrTalk, isOwer: boolean = false) {
        if(skSpine != null && cfg != null && !this._isDestroy){
            Tween.stopAllByTarget(skSpine.node);
            skSpine.node.opacity = 0;//isOwer ? 255 : 0;
            await this._createNewSpine(skSpine, cfg, isOwer);
            if(this._isDestroy) return;
            await this.nextFrame(0);
            if (skSpine == null || this._isDestroy) {
                return;
            }
            this._markTouchCdIsInTime(0.4);
            this._playAnimation(skSpine, isOwer ? cfg.MeSpineAnimGroup : cfg.SpineAnimGroup);
            if(skSpine != null) {
                tween(skSpine.node)
                    .to(0.3, {opacity: 255 })
                    .start();
            }
        }
    }

    /**
     * spine
     * @param skSpine 
     * @param cfg 
     * @param isOwer 
     */
    private async _createNewSpine(skSpine: sp.Skeleton, cfg:TrTalk, isOwer: boolean = false) {    
        if(this._isDestroy) return;    
        const x = isOwer ? -429.6 : cfg.SpineOffset.get("x") ?? 0;
        const y = isOwer ? -25 : cfg.SpineOffset.get("y") ?? 0;
        const spinePath = isOwer ? cfg.MeSpinePath : cfg.SpinePath;
        this._isChangingSpine = true;
        Tween.stopAllByTarget(skSpine.node);
        skSpine.node.active = false;
        await changeSpine(skSpine, spinePath, "UITalkView");
        if(skSpine != null && !this._isDestroy) {
            skSpine.node.active = true;
        }
        
        // spine
        // if(skSpine && skSpine.skeletonData && !this._isDestroy) {
        //     // spine
        //     const json = (skSpine.skeletonData.skeletonJson as any)?.animations;
        //     if(json) {
        //         for (let name in json) {
        //             skSpine.setAnimation(0, name, true);
        //             break; // 
        //         }
        //     }
        // }
        
        // xy 0
        if(skSpine != null && !this._isDestroy) {
            skSpine.node.setPosition(v3(x,y));
        }
        this._spineCacheDic.set(spinePath, true);        
        this._isChangingSpine = false;
    }

    /**
     * spine
     * @param spine 
     * @param spineAnimGroup 
     * @param lastSpineAnimGroup 
     * @returns 
     */
    private _playAnimation(spine: sp.Skeleton, spineAnimGroup: string[], lastSpineAnimGroup: string[] = [])
    {
        if(this._isDestroy || spine == null || spineAnimGroup.length == 0) {
            return;
        }

        if(spineAnimGroup.length == 1){
            if(lastSpineAnimGroup.length == 1 && lastSpineAnimGroup[0] == spineAnimGroup[0]) {
                //
            }
            else{
                const currentAnimation = spine.getCurrent(0)?.animation?.name;
                if(currentAnimation != spineAnimGroup[0] && (currentAnimation != "" && currentAnimation != null && currentAnimation != undefined)){ 
                    spine.setMix(currentAnimation!, spineAnimGroup[0], 0.5);
                };

                spine.setAnimation(0, spineAnimGroup[0], true);
            }
            
        }
        else{
            spine.clearTrack(0);
            for(let i = 0; i < spineAnimGroup.length - 1; i++){
                if(i > 0){
                    spine.setMix(spineAnimGroup[i - 1], spineAnimGroup[i], 0.5);
                }
                spine.addAnimation(0, spineAnimGroup[i], false);
            }
            let lastAniName = spineAnimGroup[spineAnimGroup.length - 1];
            spine.addAnimation(0, lastAniName, true);
        }
    }

    /**
     * 
     * @param cfg 
     * @returns 
     */
    private async _refEffect(cfg:TrTalk)
    {
        if(this.lastEffectTid == cfg.EffectId || this._isDestroy)
            return;

        this.effectParent.active = false;

        //TODO 
        let effectCfg = ConfigManager.tables.TbEffect.get(cfg.EffectId);
        if(effectCfg == null)
            return;
        let effectGo = await oops.res.loadAsync("Art", effectCfg.Path, Prefab);
        if(this._isDestroy) return;

        console.log(":%s",effectCfg.Path);
        const node = instantiate(effectGo);
        this.effectParent.removeAllChildren();
        this.effectParent.addChild(node);
        this.effectParent.active = true;

        this.lastEffectTid = cfg.EffectId;
        this._effectCache.set(cfg.EffectId, true);
    }

    private OnLoadFinished()
    {
       console.error("");
       
    }
       
    private _resetContent(cfg:TrTalk) {
        this._resetTyping(); 
        if(this._isOwner != cfg.IsOwner || this._hasContentName != cfg.Name.length > 0) {
            this.spContenBg1.active = false;
            this.spContenBg2.active = false;
            this.spContenBg3.active = false;
            this.nameLabel.node.active = false;
            this.textOwerLabel.node.active = false;
            this.textLabel.node.active = false;
            this.textAsideLabel.node.active = false;
        }
    }
    /**
     * NPC0.3
     *   
     * @param cfg 
     */
    private async _updateTypingContent(cfg:TrTalk){
        if(this._isDestroy) {
            return;
        }
        this._resetContent(cfg);   
        this._isOwner = cfg.IsOwner;
        this._hasContentName = cfg.Name.length > 0;
        this._originText = cfg.ContentKey;//getLabelText(cfg.ContentKey);
        // console.log("ContentKey:",cfg.ContentKey);
        this.textLabel.string = "";
        // this.textLabel.node.active = this.fullText.length > 0;
        this.textOwerLabel.node.active = this._isOwner;
        this.textLabel.node.active = !this._isOwner && this._hasContentName;
        this.textAsideLabel.node.active = !this._isOwner && !this._hasContentName;

        this.spContenBg1.active = this._isOwner;
        this.spContenBg2.active = !this._isOwner && this._hasContentName;

        this.spContenBg3.active = !this._isOwner && !this._hasContentName;
        this.textLabel.color = this.spContenBg3.active ? Color.WHITE : new Color(79,74,71,255);

        const isLeft = cfg.IsOwner && this._hasContentName;
        const isRight = !cfg.IsOwner && this._hasContentName;
        // this.leftNameLabel.node.active = isLeft;
        this.leftTagNode.active = isLeft;
        this.rightTagNode.active = isRight;
        // this.rightNameLabel.node.active = isRight;
        this.nameLabel.node.active = true;
        this.nameLabel.string = cfg.Name;//getLabelText(cfg.Name);
        await this._performTransitionContentBg(cfg);
    }

    private _stopContentTween() {
        Tween.stopAllByTarget(this.spContenBg1);
        Tween.stopAllByTarget(this.spContenBg2);
        Tween.stopAllByTarget(this.spContenBg3);
        Tween.stopAllByTarget(this.leftTagNode);
        Tween.stopAllByTarget(this.rightTagNode);
        if(this._lastTranformContentBg != null){
            Tween.stopAllByTarget(this._lastTranformContentBg);
        }
    }

    private async _performTransitionContentBg(cfg:TrTalk): Promise<void> {
        if(this._isDestroy) {
            return;
        }
        let spContentBg: Node | null = null;
        let tagNode: Node = this.leftTagNode;
        // let isNeedFadeIn: boolean = false;
        if(!this._isOwner && this._hasContentName) {
            spContentBg = this.spContenBg2;
            tagNode = this.rightTagNode
        } else if(!this._isOwner && !this._hasContentName) {
            // spContentBg = this.spContenBg3;
        } else {
            spContentBg = this.spContenBg1;
        }
        
        this._stopContentTween();
        if(spContentBg != null && !(!this._isOwner && !this._hasContentName)) {
            tagNode.opacity = 0;
            spContentBg.opacity = 0;
        }
        this.contentBgAnimation.stop();
        if(this._lastTranformContentBg != null && this._lastTranformContentBg == spContentBg) {
            spContentBg.opacity = 255;
            tagNode.opacity = 255;
            return;
        }
        
        this._lastTranformContentBg = spContentBg;
        // 
        if(!this._hasContentName) {
            return;
        }
        this.contentBgAnimation.play(this._isOwner ? "UITalkViewAnim_NvZhu" : "UITalkViewAnim_NPC");
        // await new Promise((resolve) => {setTimeout(resolve, 300);})
        await this.nextFrame(0.3);        
    }

    /**
     *  
     * @param second 
     * @returns 
     */
    private nextFrame(second: number = 0) {
        return new Promise<void>(resolve => {
            this.scheduleOnce(() => {
                if (this._isDestroy) return;
                resolve();
            }, second);
        });
    }

    /**
     *  
     *  0.3 
     * @param path 
     * @param bundleName 
     */
    public async _changeBackground(path: string): Promise<void> {
        // 
        if (!path || this._isDestroy || this._bgPath == path) {
            return;
        }
        

        // 
        const currentBg = this._currentBgIndex === 0 ? this.bg1Sprite : this.bg2Sprite;
        const nextBg = this._currentBgIndex === 0 ? this.bg2Sprite : this.bg1Sprite;
        currentBg.node.setSiblingIndex(this._siblingIndexArr[1]);
        nextBg.node.setSiblingIndex(this._siblingIndexArr[0]);

        // 
        if (this._bgPath == "") {
            this.spriteSplash.node.active = true;
        }
        console.log("currentBgIndex:%s,bgPath:%s, path:%s",this._currentBgIndex,this._bgPath, path);

        try {            
            // 
            await this.loadAndSetSpriteFrame(nextBg, path);
            if(this._isDestroy) return;
            // this._spineCacheDic.set(path, true);
            nextBg.node.opacity = 255;
            await this._performTransitionBgFadeOut(currentBg, nextBg);
            if(this._isDestroy) return;
            if(this._bgPath != "" && this._bgPath != path) {
                oops.res.release(this._bgPath, "UITalkView");
            }
            this.spriteSplash.node.active = false;
            this._bgPath = path;
            
            // 
            this._currentBgIndex = this._currentBgIndex === 0 ? 1 : 0;
        } catch (error) {
            console.error(":", error);
        }
    }

    private _stopBgTween() {
        Tween.stopAllByTarget(this.bg1Sprite);
        Tween.stopAllByTarget(this.bg2Sprite);
        Tween.stopAllByTarget(this.spriteSplash);
    }

    /**
     * 
     * @param currentBg 
     * @param nextBg 
     */
    private _performTransitionBgFadeOut(currentBg: Sprite, nextBg: Sprite, fadeOut: boolean = true): Promise<void> {
        this._stopBgTween();
        return new Promise((resolve) => {
            let completedCount = 0;
            let totalCount = 1;             
            
            const checkCompletion = () => {
                completedCount++;
                if (this._isDestroy) return;
                if (completedCount >= totalCount) {
                    resolve();
                }
            };
            if(this.spriteSplash.node.active == true) {
                totalCount = 2;
                this.spriteSplash.node.opacity = 255;
                tween(this.spriteSplash.node)
                .to(0.5, { opacity: 0 })
                .call(checkCompletion)
                .start();
            } 
            currentBg.node.opacity = 255;
            // 
            tween(currentBg.node)
                .to(0.5, { opacity: 0 })
                .call(checkCompletion)
                .start();
        });
    }

    /**
     *  Sprite
     * @param targetSprite  Sprite 
     * @param path 
     * @param bundleName 
     */
    private async loadAndSetSpriteFrame(targetSprite: Sprite, path: string): Promise<void> {
        if (!targetSprite || !targetSprite.node.isValid || this._isDestroy) {
            console.error(" Sprite ");
            return;
        }
        targetSprite.node.active = false;
        await changeSpriteImage(targetSprite, path, "UITalkView");
        if(targetSprite && !this._isDestroy) {
            targetSprite.node.active = true;
        }
    }

    private _stopAudio() {
        // oops.audio.stopMusic();
        oops.audio.stopAmbMusic();
        // if(this.lastBgmTid != 0) {
        //     this.dispatchEvent(GameEvent.StopUIMuisc, this.lastBgmTid);
        // }
        // this.lastBgmTid = 0;
        this.lastAmbTid = 0;
    }

    async _playSound(cfg:TrTalk) {
        //oops.audio.stopAmbMusic();
        oops.audio.stopEffect();      
        Utility.PlayAudioOnId(cfg.SoundId);
        this._lastAudioId = await Utility.PlayAudioOnId(cfg.AudioId);//.then(a=>this._lastAudioId = a);
        //this._lastAudioId = cfg.AudioId;
        this._audioLeftTime = oops.audio.getAudioTimeOnId(this._lastAudioId);

        // cfg.AmbientSoundId= this.arrId[this.index];
        // this.index++;
        if(this.lastAmbTid != cfg.AmbientSoundId || cfg.AmbientSoundId == 0)
        {
            Utility.StopAmbMusic()
            Utility.PlayAmbMusic(cfg.AmbientSoundId);
            this.lastAmbTid = cfg.AmbientSoundId;
        }
        // console.log("lastBgmTid:%s,bgm:%s",this.lastBgmTid,cfg.BGM);
        // 
        if(this.lastBgmTid != 0 && this.lastBgmTid == cfg.BGM) {
            return;
        }

        oops.audio.stopMusic();
        if(this.lastBgmTid != 0) {
            this.dispatchEvent(GameEvent.StopUIMuisc, this.lastBgmTid);
        }
        this.lastBgmTid = 0;
        // 0 
        if(cfg.BGM != 0 || this.lastBgmTid != cfg.BGM)
        {
            UIMusicManager.inst.playUIMusic(UIID.TalkView, cfg.BGM, true);
            this.lastBgmTid = cfg.BGM;
        }
    }

    _getTextInterval() {
        switch (this._autoPlayState) {
            case TalkAutoPlayState.None:
                this._interval = 0.05;
                break;
            case TalkAutoPlayState.OneSpeed:
                this._interval = 0.03;
                break;
            case TalkAutoPlayState.TwoSpeed:
                this._interval = 0.015;
                break;
        
            default:
                break;
        }
    }

    async _startTyping() {
        //this._stopTyping();
        if (this._originText.length == 0) {
            return;
        }
        this._stopTyping();
        this._getTextInterval();
        this._resetTyping();

        // console.log("processedText:%s,fullText:%s",this._processedText,this._originText)
        this._processedText = await this.preprocessText(this._originText);
    }

    /**
     *  \n
     */
    private async preprocessText(text: string): Promise<string> {
        if (!text || text.length === 0) return '';

        // const containerWidth = this.contentLabel.node.uiTransform.width;
        const maxLineWidth = 708;//containerWidth; // 

        let processedText = '';
        let currentLineWidth = 0;
        const curTextWidth = this.contentLabel.fontSize;
        const curTextHeight = this.contentLabel.lineHeight;
        let contentWidth = maxLineWidth;
        let contentHeight = curTextHeight;
        // 
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            // const charWidth = await this.measureCharWidth(char); // 
            if(!this.isPunctuation(char) && currentLineWidth + curTextWidth > maxLineWidth) {
                processedText += '\n' + char;
                contentWidth = Math.max(contentWidth, currentLineWidth);
                currentLineWidth = curTextWidth;
                contentHeight += curTextHeight;
            }
            else {
                processedText += char;
                currentLineWidth += curTextWidth;
                contentWidth = Math.max(contentWidth, currentLineWidth);
            }
        }
        // console.log("text:%s",text);
        // console.log("contentWidth:%s,contentHeight:%s",contentWidth,contentHeight);
        this.contentLabel.node.uiTransform.setContentSize(size(contentWidth, contentHeight));
        this.contentLabel.updateRenderData();

        return processedText;
    }

    // 
    private isPunctuation(char : string) {
        const punctuationRegex = /[\u3000-\u303F\uFF00-\uFF60\u2000-\u206F!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;
        return punctuationRegex.test(char);
    }

    _resetTyping() {
        this._textTypingTimer = this._interval;
        this._currentTypingIndex = 0;
        this.textLabel.string = "";
        this.textOwerLabel.string = "";
        this.textAsideLabel.string = "";
    }

    _loadTex(dt: number){
        if(this._textTypingTimer < 0)
            return;

        this._textTypingTimer -= dt;
        if(this._textTypingTimer <= 0){
            //
            this._textTypingTimer = this._interval
            // this.contentLabel.string += this.fullText[this._currentIndex];
            this.contentLabel.string = this._processedText.substring(0, this._currentTypingIndex + 1);
            // this.textOwerLabel.string += this.fullText[this._currentIndex];
            this._currentTypingIndex++;
            if (this._currentTypingIndex >= this._originText.length){
                this._stopTyping();
            }
        }
    }

    _stopTyping() {
        this._textTypingTimer = -1;
        // this.contentLabel.string = this.fullText;
        this.contentLabel.string = this._processedText;
        // this.textOwerLabel.string = this.fullText;
        // this.textAsideLabel.string = this.fullText;
        this._currentTypingIndex = this._processedText.length;
        this._cdAutoClick = this._totalAutoPlayTime;
        if(this._autoPlayState != this._autoNextPlayState) {
            this._autoPlayState = this._autoNextPlayState;
        }
    }

    _onClickBack() {
        oops.gui.remove(UIID.TalkView);
        StorySystem.Instance.ForceOver();
    }

    // 
    _onClickSkip() {
        if(!this._isCanNext()) {
            return;
        }
        console.log("_onClickSkip");
        this._turnNext();
    }

    // 
    _onTouchEnd(event: EventTouch) {
        if(!this._isCanNext()) {
            return;
        }
        if(this._isAreaCanNotClick(event)){
            return;
        }
        // 
        if (this._currentTypingIndex < this._originText.length) {
            this._stopTyping();
            return;
        }
        this._turnNext();
    }

    /**
     * 
     */
    _isAreaCanNotClick(event: EventTouch) {
        const touchPos = event.getLocation();
        const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
        const uiTrans = this.btnAuto.getComponent(UITransform);
        if (!uiTrans) return;
        
        const localPos = uiTrans.convertToNodeSpaceAR(worldPos);
        // 
        const width = uiTrans.width;
        const height = uiTrans.height;
        
        // 
        const isInside = 
            localPos.x >= -width / 2 && 
            localPos.x <= width / 2 && 
            localPos.y >= -height / 2 && 
            localPos.y <= height / 2;
            
        // if (isInside) {
        //     console.log('');
            
        // } else {
        //     console.log('');
        // }
        return isInside;
    }

    private _markTouchCdIsInTime(cd: number = 0.2){
        this._cdClick = cd;
    }

    _turnNext() {
        this._cdAutoClick = this._totalAutoPlayTime;
        if(!this._isCanNext()) {
            return;
        }
        const cfg = ConfigManager.tables.TbTalk.get(this._talkId);
        if (cfg == null) {
            return;
        }
        this._markTouchCdIsInTime();
        
        if (cfg.NextId > 0) {
            this._lastTalkCfgID = this._talkId;
            this._talkId = cfg.NextId;
            this._updateInfo();
        }
        else {
            this._onTalkEnd();
        }
    }

    /**
     * 
     * @returns 
     */
    private _isCanNext() {
        if(this._cdClick > 0) {
            return false;
        }
        if(this._isChangingSpine) {
            return false;
        }
        if(this._isShowChanging) {
            return false;
        }
        if(this._audioLeftTime > 0) {
            return false;
        }
        return true;
    }

    private _onTalkEnd() {
        GameData.PlayerData.GlobalData.StoryState.set(this._talkId, true);
        // //SdkManager.inst.event("dialog_look", { id: this._firstTalkId, state: 1});
        GameDot.Instance.DialogTalkDot(this._firstTalkId, 1);

        // if (!StorySystem.Instance.NextIsChoice()) {
        //     oops.gui.remove(UIID.TalkView);
        // }
        
        // oops.message.dispatchEvent(GameEvent.StoryPlayOver);

        oops.message.dispatchEvent(GameEvent.OnTalkReadyClose, this._talkId);
    }

    /**
     *  
     */
    public onClickAuto() {
        if(this._autoNextPlayState == TalkAutoPlayState.None) {
            this._autoNextPlayState = TalkAutoPlayState.OneSpeed;
        }
        else if(this._autoNextPlayState == TalkAutoPlayState.OneSpeed) {
            this._autoNextPlayState = !this._curGroupIdIsReaded ? TalkAutoPlayState.None : TalkAutoPlayState.TwoSpeed;
        }
        else if(this._autoNextPlayState == TalkAutoPlayState.TwoSpeed) {
            this._autoNextPlayState = TalkAutoPlayState.None;
        }

        if(this._autoPlayState == TalkAutoPlayState.None) {
            this._autoPlayState = this._autoNextPlayState;
        }

        this._updateAutoState();
    }

    public onSkipDebug() {
        this._onTalkEnd();
    }
}

import { _decorator, Component, Node } from 'cc';
import { screen } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { VideoFactory } from '../../modules/video-module/VideoFactory';
import { VideoCom } from '../../modules/video-module/VideoCom';
import { GameEvent } from '../common/config/GameEvent';
import { EVideoType, IVideoParam } from '../../modules/video-module/VideoEnum';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { Label } from 'cc';
import { GameData } from '../gameplay/GameDataModel/GameData';
import ConfigManager from '../manager/Config/ConfigManager';
import { lookupService } from 'dns';
import { SdkManager } from '../../modules/sdk/SdkManager';
import { sys } from 'cc';
import { Animation } from 'cc';
import { PlotSegType, StorySystem } from '../gameplay/Manager/StorySystem';
import { GameDot } from '../gameplay/Manager/GameDot';
import { Sprite } from 'cc';
import { Color } from 'cc';
import { UIOpacity } from 'cc';
import { tween } from 'cc';
import { Tween } from 'cc';
import { ANDROID, NATIVE } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('UIMainVideoComp')
@executeInEditMode(true)
export class UIMainVideoComp extends CCComp {

    private static instance: UIMainVideoComp = null!;
    public static getInstance(): UIMainVideoComp {
        return UIMainVideoComp.instance;
    }

    private defaultParam: IVideoParam = null!;
    private videoType: number = -1;
    private isPlaying = false;

    private mFadeoutSchder: number = 0;

    constructor() {
        super();
        console.log("")
    }

    @property(Node)
    skipBtn: Node = null!;
    @property(Node)
    mVideoParentNode: Node = null!;
    @property(Animation)
    mTransformAni: Animation = null!;
    @property(UIOpacity)
    mFadeOpacity: UIOpacity = null!;

    mVideoCom: VideoCom = null!;

    mNeedTranformAni: boolean = false;
    mLastPlayVideoId: number = 0;

    protected onLoad(): void {

        if (UIMainVideoComp.instance != null) {
            console.error("UIMainVideoComp ");
        }
        UIMainVideoComp.instance = this;

        let videoNode = VideoFactory.getInstance().createVideo();
        console.log(`[video] , videoNode: ${videoNode?.name}`);
        this.mVideoParentNode.addChild(videoNode);
        this.mVideoCom = videoNode.getComponent(VideoCom)!;

        this.defaultParam = {
            videoid: 0,
            resourceType: EVideoType.Remote,
            src: "",
            loop: false,
            controls: false,
            progress: false,
            progressInControlMode: false,
            autoplay: true,
            playBtn: false,
            underGame: false,
            width: screen.windowSize.width,
            height: screen.windowSize.height,
            objectFit: "contain",
            poster: "",
            posterBundle: "Sprites",
            stopedCallback: this.onVideoStopped.bind(this),
            completeCallback: this.onVideoPlayComplete.bind(this),
            readyToPlayCallback: this.onReadyToPlay.bind(this),
            callThisArgs: this
        };

        this.on(GameEvent.ChoiceOver, this.Close, this);
    }
    public get IsMainVideoPlaying() {
        return this.mVideoCom.mIsPlaying;
    }

    onDestroy() {
        this.off(GameEvent.ChoiceOver);
        this.isPlaying = false;
    }
    playUrl(cfgId: number, loop: boolean = false, posterImage: string = "", randomVideo: boolean = false, isHomeVideoRandomVideo = false): void {
        // if (this.isPlaying) {
        //     return;
        // }
        if(this.mLastPlayVideoId == cfgId && this.mLastPlayVideoId != 0){
            console.log(` , cfgId: ${cfgId}, mLastPlayVideoId: ${this.mLastPlayVideoId}`);
            this.seek(0);
            return;
        }

        this.isPlaying = true;
        const platform = SdkManager.inst.getPlatform();
        const config = ConfigManager.tables.TbVideo.get(cfgId);
        // let newurl = GameData.VIDEO_WEBGL_URL + config?.ResPathPhone + ".m3u8";
        // if (sys.isBrowser) {
        //     newurl = GameData.VIDEO_URL + config?.ResPath;
        // }
        // else {
        //     if (platform == "windows" || platform == "mac") {
        //         newurl = GameData.VIDEO_URL + config?.ResPath;
        //     }
        //     //newurl = GameData.VIDEO_URL + config?.ResPath;
        // }

        // //
        // if(config?.ResLocation == 1 && ((NATIVE && ANDROID))){
        //     this.defaultParam.resourceType = EVideoType.Local;
        //     newurl = config?.ResPath.slice(0, -4);
        // }
        // else{
        //     this.defaultParam.resourceType = EVideoType.Remote;
        // }

        // let newurl = GameData.VIDEO_WEBGL_URL + config?.ResPathPhone + ".m3u8";
        let newurl = GameData.VIDEO_URL + config?.ResPath;
 
        this.defaultParam.resourceType = EVideoType.Remote;

        this.mNeedTranformAni = true;

        console.log(`[video] , url: ${newurl}, resourceType: ${this.defaultParam.resourceType}, resPath: ${config?.ResPath}`);
        this.defaultParam.videoid = cfgId;
        this.defaultParam.src = newurl;
        this.defaultParam.loop = loop;
        this.defaultParam.poster = ConfigManager.tables.TbAtlas.get(config?.Pic!)?.Path!;
        this.defaultParam.posterBundle = "Sprites";

        this.mFadeOpacity.opacity = 255;
        this.mLastPlayVideoId = this.defaultParam.videoid;
        this.mVideoCom.play(this.defaultParam);

        if (isHomeVideoRandomVideo) {
            // 
            this.skipBtn.active = false;
        }
        else {
            if (loop || randomVideo) {
                this.skipBtn.active = false;
            }
            else {
                this.skipBtn.active = true;
            }
        }

    }

    play(param: IVideoParam) {
        this.mVideoCom?.play(param);
    }

    skip() {
        this.onSkipFadeout(()=>{
            this.mVideoCom.stop();
        });

    }

    seek(time: number) {
        this.mVideoCom.seek(time);
        this.resetFadeoutScheder();
    }

    stop() {
        this.mVideoCom?.stop();
        this.Close();
    }

    start() {

    }

    //scheder
    resetFadeoutScheder(){
        this.unschedule(this.fadeoutVideo);
        if(this.defaultParam.loop){
            console.log(`[video]resetFadeoutScheder, , `);
            return;
        }
        let duration = this.mVideoCom.getDuration() * 1000;
        let currentTime = this.mVideoCom.getCurrentTime() * 1000;
        let time = duration - currentTime - 250;
        time = time > 250? time: 0;
        console.log(`[video]resetFadeoutScheder, time:${time}, duration:${duration}, currentTime:${currentTime}`);
        this.scheduleOnce(this.fadeoutVideo, time / 1000);
    }

    onSkipFadeout(callback: Function | null){
        this.fadeoutVideo();
        this.scheduleOnce(callback, 0.25);
    }

    fadeoutVideo(){
        console.log(`[video] fadeoutVideo`);
        Tween.stopAllByTarget(this.mFadeOpacity);
        tween(this.mFadeOpacity).to(0.25, {opacity: 255}).start();
    }

    fadeinVideo(){
        console.log(`[video] fadeinVideo`);
        Tween.stopAllByTarget(this.mFadeOpacity);
        tween(this.mFadeOpacity).to(0.25, {opacity: 0}).start();
    }

    onPlayVideo(event: string, args: any) {
        let videoParam = args as IVideoParam;
        this.mVideoCom.play(videoParam);
    }

    onVideoPlayComplete(param: IVideoParam) {
        console.log(`, opacity: ${this.mFadeOpacity.opacity}`);
        this.Close();
    }

    testThis() {
        console.log("testThis");
    }

    onReadyToPlay(param: IVideoParam) {
        console.log("[video] onReadyToPlay");
        this.resetFadeoutScheder();
        this.fadeinVideo();
    }

    onVideoStopped(param: IVideoParam) {

    }

    update(deltaTime: number) {

    }

    reset(): void {

    }

    onTestClick(eventData: Event, param: any) {
        //this.playUrl("https://shiyele-download.wyx.cn/HeartFlutter/MP4/2.0.2.4/Video/J_0.mp4", param == "1", "VideoCover/J_Main_01/spriteFrame");
        this.stop();
    }

    private open_Carport() {

        oops.gui.open(UIID.UICarport);
    }

    Close(event: string = "", type: any = 0) {
        console.log(`[video] Close, event: ${event}, type: ${type}`);
        let id = this.defaultParam.videoid;
        GameDot.Instance.VideoStatusDot(id, 1);
        if (!StorySystem.Instance.NextIsChoice()) {
            oops.message.dispatchEvent(GameEvent.MAIN_VIDEO_END);
        }
        oops.message.dispatchEvent(GameEvent.StoryPlayOver, { type: 2, id: id });
    }
}



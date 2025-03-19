import { _decorator, Component, Node,tween, game, input} from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { UIID } from '../common/config/GameUIConfig';
import { ScrollView } from 'cc';
import { BuildItemCom } from './BuildItemCom';
import { EventHandler } from 'cc';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { AvatorItemCom } from './AvatorItemCom';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { BigCityMapData, IBigCityEvent } from '../gameplay/GameDataModel/BigCityMapData';
import { GameEvent } from '../common/config/GameEvent';
import { Utility } from '../gameplay/Utility/Utility';
import { UIMusicManager } from '../gameplay/Manager/UIMusicManager';
import { CurrencyShow, EItemClass } from '../gameplay/GameDataModel/GameEnum';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { EventMgr } from '../gameplay/Manager/EventMgr';
import { Label } from 'cc';
import { ConstellationTool } from '../UIConstellation/ConstellationTool';
import ConfigManager from '../manager/Config/ConfigManager';
import { Input } from 'cc';
import { GameHelper } from '../gameplay/GameTool/GameHelper';
import { Button } from 'cc';
import { EventTriggerMgr } from '../gameplay/Manager/EventTriggerMgr';
import { DEBUG } from 'cc/env';
import { screen } from 'cc';
import { GuideManager } from "../UIGuide/GuideManager";
import { Game } from 'cc';
import { Vec3 } from 'cc';
import { FunctionOpenSystem } from '../gameplay/Manager/FunctionOpenSystem';
const { ccclass, property } = _decorator;

@ccclass('UIBigCityMap')
export class UIBigCityMap extends CCComp {

    @property(ScrollView)
    mScrollView: ScrollView = null!;

    @property(Node)
    mBuildGroup: Node = null!;
    @property(Node)
    mAvatorGroup: Node = null!;
    @property(Prefab)
    avatorParentNode: Prefab = null!;
    @property(Label)
    labMZSNotice: Label = null!;
    @property(Node)
    mZSNoticeNode: Node = null!;
    @property(Button)
    ArrBtnGuide: Button[] = []!;
    @property(Node)
    ArrNodeGuideTakeUp: Node[] = []!;//
    @property(Node)
    freeBtn: Node = null!;
    @property(Node)
    BackBtn:Node = null!;
    @property(Node)
    SVContent:Node = null!;
    @property(Node)
    Msprite:Node = null!;
    @property(Node)
    MzsBtn: Node = null!;//
    @property(Node)
    LogoBlackBg:Node = null!;
    @property(Node)
    LogoMini:Node = null!;
    @property(Node)
    Logo:Node = null!;

    private buildItemComs: BuildItemCom[] = null!;
    private avatorItemComs: AvatorItemCom[] | null = null;
    private avatorNodes: Node[] = [];


    protected onLoad(): void {
        this.initCityLogo()
        const scrollViewEventHandler = new EventHandler();
        scrollViewEventHandler.target = this.node; //  node 
        scrollViewEventHandler.component = 'UIBigCityMap';// 
        scrollViewEventHandler.handler = 'onMapScrollViewScroll';
        //scrollViewEventHandler.customEventData = 'foobar';

        this.mScrollView.scrollEvents.push(scrollViewEventHandler);

        this.buildItemComs = this.mBuildGroup.getComponentsInChildren(BuildItemCom);
        this.buildItemComs.sort((a, b) => a.BuildId - b.BuildId);
        for (let i = 0; i < this.buildItemComs.length; i++) {
            let node = instantiate(this.avatorParentNode);
            this.mAvatorGroup.addChild(node);
            node.setWorldPosition(this.buildItemComs[i].AvatorHolder.worldPosition);
            this.avatorNodes.push(node);
            //node.on(Input.EventType.MOUSE_UP, this.buildItemComs[i].onClickBuild, this.buildItemComs[i])
        }

        this.on(GameEvent.GoMapPlot, this.onClickGoAndSee, this);
    }
    protected onEnable(): void {
        this.Msprite.active = false;
        UIMusicManager.inst.playUIMusic(UIID.UIBigCityMap, 1005);
        Utility.PlayAmbMusic(3001);

        const result = GameData.GetGuideStep()>=1000 && GameData.GetGuideStep()<1050
        if (!result) {
            // bug 
            oops.gui.open(UIID.CurrencyBar, EItemClass.XinWu);
            if (this.freeBtn) this.freeBtn.active = false;
        }

        oops.message.on(GameEvent.ConstellationStarUp, this.refreshMZS, this);
        oops.message.on(GameEvent.ConstellationLevelUp, this.refreshMZS, this);
        this.on(GameEvent.UIStoryKilledEvent, this.onStoryBeKilled, this);
        this.on(GameEvent.UIStoryCompleteEvent, this.onStoryCompelte, this);
        
    }
    protected onDisable(): void {
        //oops.gui.remove(UIID.CurrencyBar);
        oops.message.off(GameEvent.ConstellationStarUp, this.refreshMZS, this);
        oops.message.off(GameEvent.ConstellationLevelUp, this.refreshMZS, this);
        this.off(GameEvent.UIStoryKilledEvent);
        this.off(GameEvent.UIStoryCompleteEvent);
        Utility.StopAmbMusic();
    }

    protected onDestroy(): void {
        oops.gui.remove(UIID.CurrencyBar);
        super.onDestroy();
    }

    private onStoryBeKilled(evt: any, args: any) {
        //
        this.refreshEvent();
        this.focusBuild();
    }

    private onStoryCompelte(evt: any, args: any) {
        this.finieshCompleteEventByRoleId(args.roleId, args.cfgId);
        //
        this.refreshEvent();
        this.focusBuild();
    }

    private finieshCompleteEventByRoleId(roleId: number, plotId:number) {
        GameData.PlayerData.BigCityMapData.finieshEventByRoleIdAndPlotId(roleId, plotId);
    }

    private refreshEvent(){
        if(true)
        {
            //v2
            GameData.PlayerData.BigCityMapData.initEventV2();
            this.refreshShowInfo();
            return;
        }


        let isSpecial = GameData.PlayerData.BigCityMapData.CreateSpecialEvents();
        if(!isSpecial) {
            //  
            // 
            GameData.PlayerData.BigCityMapData.initEvents();
        }
        else{
            // 
            let events = GameData.PlayerData.BigCityMapData.getEvents();
            let excludeMap: { [key: number]: number } = {};
            for(let i = 0; i < events.length; i ++){
                excludeMap[events[i].roleId] = events[i].buildId;
            }

            let unlockPlayers = PlayerSystem.Instance.getUnlockPlayerCnt();
            if(events.length < unlockPlayers){
                GameData.PlayerData.BigCityMapData.initEvents();
                let players = ConfigManager.tables.TbPlayer.getDataList();
                for(let i = 0; i < players.length; i ++){
                    if(!PlayerSystem.Instance.PlayerIsUnlock(players[i].Id)){
                        continue;
                    }
                    if(this.playerHasEvent(players[i].Id)){
                        continue;
                    }

                    let shuffleArray = GameData.PlayerData.BigCityMapData.GetShuffleArrayBuilds();
                    for(let i = events.length - 1; i >=0 ; i--){
                        for(let j = 0; j< shuffleArray.length; j ++){
                            if(shuffleArray[j].Id == events[i].buildId){
                                shuffleArray.splice(j, 1);
                                break;
                            }
                        }
                    }

                    let eventInfo = GameData.PlayerData.BigCityMapData.createEventForRole(players[i].Id, shuffleArray);
                    GameData.PlayerData.BigCityMapData.addMapEvent(eventInfo);
                }
            }
        }
        this.refreshShowInfo();
    }

    private playerHasEvent(playerId: number): boolean {
        let events = GameData.PlayerData.BigCityMapData.getEvents();
        for (let i = 0; i < events.length; i++) {
            if (events[i].roleId === playerId) {
                return true;
            }
        }
        return false;
    }

    start() {
        //GameData.PlayerData.BigCityMapData.initEvents();
        this.refreshEvent();
        let guideStep = GameData.GetGuideStep();
        if (guideStep >=1020 && guideStep<1040) {
            this.BackBtn.active = false;
            let tb = ConfigManager.tables.TbAudio.get(2057);
            if (tb) {
                oops.audio.playEffect(tb?.Resource, "Audios");
            }
            this.browseMap(()=>{
                console.log("")
                this.mAvatorGroup.active = true;
                this.ShowGuide();
            });
        }
        else{
            this.LogoMini.active = true;
            FunctionOpenSystem.Instance.ShowOpenFunction(()=>
            {
                this.ShowGuide();
            });
        }

        this.MzsBtn.active = guideStep >= 2015;
        if(GameData.GetGuideStep() > 1040)
        {
            this.focusBuild();
        }
    }

    initCityLogo()
    {
        this.LogoMini.active = false;
        this.LogoBlackBg.active = false;
        this.Logo.active = false;
    }

    focusBuild(){
        //
        let roleId = PlayerSystem.Instance.CurPlayId;
        let events = GameData.PlayerData.BigCityMapData.getEvents();
        for(let i = 0; i < events.length; i ++){
            if(events[i].roleId == roleId){
                this.scroll(events[i].buildId);
                break;
            }
        }
    }
    ShowGuide() {
        GuideManager.Instance.TryShowGuide(1040, this.ArrBtnGuide, () => {
            this.scroll(3);
        },() => {},()=>{},[],this.ArrNodeGuideTakeUp);

        GuideManager.Instance.TryShowGuide(2020, this.ArrBtnGuide, () => {
            this.MzsBtn.active = true;
         }, () => {}, ()=>{},[],this.ArrNodeGuideTakeUp)
    }

    refreshShowInfo() {
        let events = GameData.PlayerData.BigCityMapData.getEvents();
        for (let i = 0; i < this.avatorNodes.length; i++) {
            if (GameData.PlayerData.BigCityMapData.getEventByBuildId(i + 1)) {

            }
            else {
                this.avatorNodes[i].removeAllChildren();
            }
        }

        for (let i = 0; i < events.length; i++) {
            let buildId = events[i].buildId;
            this.buildItemComs[buildId - 1].showEvent(events[i]);

            let eventInfo = events[i];
            let childNode = this.avatorNodes[buildId - 1].getChildByName("AvatorItem");
            if (childNode) {
                childNode.getComponent(AvatorItemCom)?.show(eventInfo);
            }
            else {
                this.loadAsync<Prefab>("UIBigCityMap", "Prefab/MapAvatorItem").then((prefab) => {
                    if (this.isValid) {
                        let node = instantiate(prefab);
                        node.name = "AvatorItem";
                        this.avatorNodes[buildId - 1].addChild(node);
                        let avatorCom = node.getComponent(AvatorItemCom)
                        avatorCom?.show(eventInfo);
                    }
                });
            }
        }

        this.refreshMZS();
    }

    private refreshMZS() {
        const nextStarInfo = ConstellationTool.IsHasRed();

        this.mZSNoticeNode.active = nextStarInfo.flag;
        const starCfg = nextStarInfo.starId != 0 ? ConfigManager.tables.TbStarSingle.get(nextStarInfo.starId) : null;
        if (starCfg) {
            this.labMZSNotice.string = "" + starCfg.Name;
        }
    }

    update(deltaTime: number) {

    }

    reset(): void {

    }

    onClickBack() {
        //Utility.PlayMusicWhenCloseUI(1);
        GameHelper.TransformWait(()=>{
            oops.gui.remove(UIID.UIBigCityMap);
            oops.message.dispatchEvent(GameEvent.UITransformToCloseEvent);
            oops.message.dispatchEvent(GameEvent.OnReturnUIHome);
        });
        oops.message.dispatchEvent(GameEvent.OnGuideShow);
    }

    onMapScrollViewScroll(scrollview: ScrollView, eventType: any, customEventData: any) {
        //console.log("onMapScrollViewScroll::::" + eventType);
        if (eventType != 4) {
            return;
        }
        for (let i = 0; i < this.avatorNodes.length; i++) {
            let avatorItemNode = this.avatorNodes[i].getChildByName("AvatorItem");
            if (avatorItemNode) {
                avatorItemNode.getComponent(AvatorItemCom)?.showExplanInfo(false);
                avatorItemNode.getComponent(AvatorItemCom)?.refreshPosition();
            }
        }
    }

    scroll(index: number) {
        const build = this.buildItemComs[index - 1];
        let xOffet = Math.abs(build.node.position.x) / (this.mBuildGroup.uiTransform.width / 2);
        const num = build.node.position.x > 0 ? 0.5 + xOffet:(1 - xOffet) / 2;
        if (!this.mScrollView.isScrolling()) {
            this.mScrollView.scrollToPercentHorizontal(num-0.096, 0.5, true);
        }

    }
///“”
    onClickGoAndSee(event: any, buildId: number) {

        //
        // let lvUp= PlayerSystem.Instance.AddCacheHeartValue(10);
        // if(lvUp)
        // {
        //     oops.gui.toast("~");
        //     return;
        // }

        let eventInfo = GameData.PlayerData.BigCityMapData.getEventByBuildId(buildId);
        if (eventInfo) {
            //GameData.PlayerData.BigCityMapData.changeRoleEvent(eventInfo.roleId);
            EventMgr.inst.trigger(eventInfo.eventId,eventInfo.roleId);

            this.refreshShowInfo();

        }
        else {
            oops.gui.toast("");
        }

        GuideManager.Instance.FinishGuide();
    }

    onClickMZS() {
        if(GameData.GetGuideStep() >= 2010){
            oops.gui.openAsync(UIID.UIConstellationNew);
        }
        else {
            oops.gui.toast("");
        }

        GuideManager.Instance.FinishGuide();
    }

    browseMap(onComp:()=>void) {
        this.Logo.active = true;
        this.LogoBlackBg.active = true;
        this.mAvatorGroup.active = false;
        const targetX = this.mScrollView.getMaxScrollOffset().x;
        let vec = new Vec3();
        vec = this.SVContent.position
        vec.x = targetX / 2
        this.SVContent.position = vec;
        this.scheduleOnce(() => {
            this.Logo.active = false;
            this.LogoMini.active = true;
            this.LogoBlackBg.active = false;
            tween(this.SVContent)
                .to(4,
                    { position: new Vec3(-targetX / 2, vec.y, vec.z) },
                    {
                        easing: 'linear',
                        onStart: () => {
                            this.Msprite.active = true;
                        },
                        onUpdate: (target) => {

                        },
                        onComplete: () => {
                            this.Msprite.active = false;
                            this.scheduleOnce(onComp, 0.5);
                            
                        }
                    }
                )
                .start();
        }, 100/30)

    }
}



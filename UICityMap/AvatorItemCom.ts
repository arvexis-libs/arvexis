import { _decorator, Component, Node } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { IBigCityEvent } from '../gameplay/GameDataModel/BigCityMapData';
import { Sprite } from 'cc';
import ConfigManager from '../manager/Config/ConfigManager';
import { SpriteFrame } from 'cc';
import { sp } from 'cc';
import { Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { screen } from 'cc';
import { Label } from 'cc';
import { GameEvent } from '../common/config/GameEvent';
import { Button } from 'cc';
import { GuideManager } from "../UIGuide/GuideManager";

@ccclass('AvatorItemCom')
export class AvatorItemCom extends CCComp {

    private eventInfo:IBigCityEvent | null = null;

    @property(Node)
    moveNode:Node = null!;
    @property(Node)
    noMoveNode:Node = null!;
    @property(Node)
    infoExplane:Node = null!;

    @property(Sprite)
    avatorIcon:Sprite = null!;
    @property(Sprite)
    avatorIcon2 : Sprite = null!;

    @property(Sprite)
    avatorIconExplan : Sprite = null!;
    @property(Label)
    explanLocal:Label = null!;
    @property(Label)
    explanPlotSimpleTips:Label = null!;

    @property(Node)
    arrow:Node = null!;
    @property(Button)
    ArrBtnGuide:Button[]=[]!;
    @property(Node)
    ArrNodeGuideTakeUp: Node[] = []!;//

    arrowOffset = 58;   //
    screenOffset = 80; //

    isShowingExplan = false;

    protected onLoad(): void {
        this.on(GameEvent.OnClickMapBuild, this.onClickBuildHandler, this);
    }
    start() {

    }

    update(deltaTime: number) {
        //
    }

    reset(): void {

    }

    show(eventInfo:IBigCityEvent){

        this.eventInfo = eventInfo;
        let avatorInfo = ConfigManager.tables.TbPlayer.get(eventInfo.roleId);
        let mapAvatorIcon = avatorInfo?.MapIconPath;
        //let mapBoardIcon = avatorInfo?.MapBorderPath;

        this.loadAsync<SpriteFrame>("CommonRes", "Sprites/" + mapAvatorIcon + "/spriteFrame").then((sp)=>{
            if(this.isValid){
                this.avatorIcon.spriteFrame = sp;
                this.avatorIcon2.spriteFrame = sp;
                this.avatorIconExplan.spriteFrame = sp;
            }
        });

        let plotId = eventInfo.plotId || 0;

        let eventInfoEx = ConfigManager.tables.TbBigMapPopInfo.get(plotId);
        if(eventInfoEx != null){
            this.explanLocal.string = eventInfoEx.Name;
            this.explanPlotSimpleTips.string = eventInfoEx.Tip;
        }

        /*this.loadAsync<SpriteFrame>("CommonRes", "Sprites/" + mapBoardIcon + "/spriteFrame").then((sp)=>{
            if(this.isValid){
                this.avatorBorder.spriteFrame = sp;
            }
        });*/

        this.refreshPosition();
    }
    ShowGuide() {
        GuideManager.Instance.TryShowGuide(1050, this.ArrBtnGuide, () => {}, () => {}, ()=>{},[],this.ArrNodeGuideTakeUp);
    }

    showExplanInfo(isShow:boolean){
        if(isShow){
            this.isShowingExplan = true;
            this.noMoveNode.active = false;
            this.moveNode.active = false;
            this.infoExplane.active = true;
            this.ShowGuide();
        }
        else{
            this.isShowingExplan = false;
            this.infoExplane.active = false;
        }
    }

    refreshPosition(){

        this.showExplanInfo(false);

        this.moveNode.active = this.noMoveNode.active = false;

        if(this.eventInfo == null){
            return;
        }
        const IconWidth = -100;
        const ShowWidth = 1080;

        let worldPosition = this.node.parent?.getWorldPosition();
        //console.log(this.eventInfo.buildId + " : worldPosition = " + worldPosition?.x);
        let x = worldPosition?.x || 0;
        if(x + IconWidth < 0){
            this.moveNode.active = true;
            //
            this.refreshArrow(false, true);
            
            this.moveNode.setWorldPosition(new Vec3(this.screenOffset, this.moveNode.worldPosition.y, 0));
        }else if(x - IconWidth > ShowWidth){
            this.moveNode.active = true;
            this.refreshArrow(false, false);
            this.moveNode.setWorldPosition(new Vec3(ShowWidth - this.screenOffset, this.moveNode.worldPosition.y, 0));
        }
        else{
            this.noMoveNode.active = true;
            this.refreshArrow(true, false);
            this.moveNode.setPosition(Vec3.ZERO);
        }
    }

    refreshArrow(isCenter:boolean, isLeft:boolean){
        if(isCenter){
            this.arrow.position = new Vec3(0, -this.arrowOffset, 0);
            this.arrow.eulerAngles = Vec3.ZERO;
        }
        else if(isLeft){
            this.arrow.position = new Vec3(-this.arrowOffset, 0, 0);
            this.arrow.eulerAngles = new Vec3(0,0, -90);
        }
        else{
            this.arrow.position = new Vec3(this.arrowOffset, 0, 0);
            this.arrow.eulerAngles = new Vec3(0,0, 90);
        }
    }

    onClickAvatorIcon(){
        this.onClickBuildHandler(null, this.eventInfo?.buildId!);
    }

    onClickBuildHandler(event:any, buildId:number){
        if(buildId == this.eventInfo?.buildId && this.isShowingExplan == false){
            this.showExplanInfo(true);
        }
        else{
            this.refreshPosition();
        }
    }
    onClickGo(){
        GuideManager.Instance.FinishGuide();
        this.showExplanInfo(false);
        this.dispatchEvent(GameEvent.GoMapPlot, this.eventInfo?.buildId);
    }
}



import { _decorator, Component, UITransform, Node, EventTouch, Vec2, Vec3, Color ,BlockInputEvents,tween} from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import ConfigManager from '../manager/Config/ConfigManager';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { Utility } from '../gameplay/Utility/Utility';
import { debug, error } from 'console';
import { Sprite } from 'cc';
import { instantiate } from 'cc';
import { Button } from 'cc';
import { Label } from 'cc';
import { TbGuide, TrGuide, TrRhythmGameGK } from '../schema/schema';
import { math } from 'cc';
import { GameEvent } from '../common/config/GameEvent';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { MiniGameData } from '../gameplay/GameDataModel/MiniGameData';
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
import { GuideType, GuideManager } from './GuideManager';
import { Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIGuide')
export class UIGuide extends CCComp 
{
    @property(Node)
    Mask:Node=null!;
    // @property(Node)
    // _targetBtn:Node = null!;//
    @property(Node)
    Bubble:Node = null!;
    @property(Label)
    BubbleTxt:Label = null!;
    @property(Node)
    SignPost:Node = null!;
    @property(Node)
    ClickArea:Node = null!;
    @property(Node)
    CopyTargetBtn:Node = null!;

    private _guideId:number=0;
    private _trGuide:TrGuide=null!;
    private _targetBtn:Node=null!;
    private _targetNodeTakeUp:Node=null!;
    private _bubbleTxt:string=null!;
    private _bubblePos1:Vec3=null!//
    private _bubblePos2:Vec3=null!//
    private _bubblePos3:Vec3=null!//
    private _bubblePos4:Vec3=null!//
    private _bubblePos5:Vec3=null!;//
    private _onComplete:()=>void=null!;

    protected onLoad(): void {
        this.Mask.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.Mask.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onAdded(data: any) {

        this._guideId = data.guideId;
        this._targetBtn = data.targetBtn
        this._targetNodeTakeUp = data.targetNodeTakeUp
        this._bubbleTxt = data.bubbleTxt;
        this._trGuide = ConfigManager.tables.TbGuide.get(data.guideId)!;
        this._onComplete = data.onComplete;
        return true;
    }
    start() {
        this.Bubble.getComponent(Sprite)!.enabled = false

        if (this._targetNodeTakeUp) {
            this.setMaskAnim()
        }
        else {
            this.Mask.getComponent(Sprite)!.color = new Color(0, 0, 0, 0)
        }

        this.scheduleOnce(()=>{
            this.setSignPost();
            this.setBubble();
            this.setBtnUp();
        }, 0.8);

    }

    update(deltaTime: number) {

    }

    onTouchStart(event: EventTouch) {
        switch (this._trGuide?.Type) {
            case GuideType.OnlyShowDesc:
                GuideManager.Instance.FinishGuide();
                if (this._onComplete) {
                    this._onComplete()
                }
                
                if (oops.gui.has(UIID.UIGuide)) {
                    oops.gui.remove(UIID.UIGuide)
                }
                return;
            default:
                break;
        }

        const touchLocation = event.getUILocation(); // UI
        if (this.isPointInRect(touchLocation,this._targetBtn)) {
            event.preventSwallow = true//
        }
        else {

        }
    }

    onTouchEnd(event: EventTouch) {
        event.preventSwallow = true
    }

    isPointInRect(point: Vec2, btnTarget: Node): boolean {
        if (!btnTarget) {
            return true
        }
        const btnWorldPos = btnTarget.getWorldPosition();
        const uiTransform = btnTarget.getComponent(UITransform)!;
        return (
            point.x >= btnWorldPos.x - uiTransform.width * uiTransform.anchorX && point.x <= btnWorldPos.x + uiTransform.width  * (1 - uiTransform.anchorX) &&
            point.y >= btnWorldPos.y - uiTransform.height * uiTransform.anchorY && point.y <= btnWorldPos.y + uiTransform.height  * (1 - uiTransform.anchorY)
        );
    }

    setSignPost()
    {
        let node = this._targetBtn?this._targetBtn:this.node;
        const uiTransform = node.getComponent(UITransform)!;
        let targetPos = node.worldPosition
        let offset = new Vec3(uiTransform.width*(0.5-uiTransform.anchorX), uiTransform.height*(0.5-uiTransform.anchorY), 0);
        const result = Vec3.add(new Vec3(), targetPos, offset);
        this.SignPost.setWorldPosition(result)
    }

    setBubble()
    {
        this.BubbleTxt.string = this._bubbleTxt;

        if (this._trGuide.Type == GuideType.OnlyShowDesc) {
            this.ClickArea.active = false;
        }

        if (this._bubbleTxt==null || this._bubbleTxt=="") {
            this.Bubble.active = false;
        }
        
        this.SetBubblePos();
    }

    setBtnUp()
    {
        if (this._targetNodeTakeUp) {
            let node = instantiate(this._targetNodeTakeUp)
            node.parent = this.CopyTargetBtn
            this.delAllComp(node);
            node.getComponent(Widget)?.destroy()//
            this.scheduleOnce(()=>{
                node.setWorldPosition(this._targetNodeTakeUp.worldPosition)
            });
        }
    }

    private delAllComp(node:Node)//buttonccblockinputEvent
    {
        this.delComp(node)
        for (let i = 0; i < node.children.length; i++) {
            const element = node.children[i];
            this.delAllComp(element)
        }
    }

    private delComp(node:Node)
    {
        let comBtn = node.getComponent(Button);
        let comBlockInput = node.getComponent(BlockInputEvents);
        if(comBtn)
        {
            comBtn.destroy();
        }
        if(comBlockInput)
        {
            comBlockInput.destroy();
        }
    }

    protected onDestroy(): void {
        try {
            this.Mask.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.Mask.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
            
        } catch (error) {
            
        }
    }

    SetBubblePos() {
        this.scheduleOnce(() => {
            let bubbleWidth = Math.max(this.BubbleTxt.node.getComponent(UITransform)!.width + 90, 446)
            this.Bubble.getComponent(UITransform)?.setContentSize(bubbleWidth, this.Bubble.getComponent(UITransform)!.height)
            this.Bubble.getComponent(Sprite)!.enabled = true
            let offsetX = bubbleWidth / 2-100;
            this._bubblePos1 = new Vec3(-offsetX, 163)
            this._bubblePos2 = new Vec3(offsetX, 163)
            this._bubblePos3 = new Vec3(-offsetX, -175)
            this._bubblePos4 = new Vec3(offsetX, -175)
            this._bubblePos5 = new Vec3(0, 80)
            switch (this._guideId) {
                case 1020:
                    this.Bubble.position = this._bubblePos1;
                    break;
                case 1080:
                    this.Bubble.position = this._bubblePos4;
                    break;
                case 1140:
                    this.Bubble.position = this._bubblePos3;
                    break;
                case 2020:
                    this.Bubble.position = Vec3.add(new Vec3(), this._bubblePos1, new Vec3(80, 0, 0));//
                    break;
                case 2022:
                    this.Bubble.position = this._bubblePos5;
                    break;
                case 2040:
                    this.Bubble.position = this._bubblePos4;
                    break;

                default:
                    break;
            }
        })


    }

    reset(): void {

    }

    setMaskAnim()
    {
        tween(this.Mask.getComponent(Sprite)!).to(0.1
            , { color: new Color(0, 0, 0, 90) }, {
            onComplete: () => { }
        }).start(); 
    }
}



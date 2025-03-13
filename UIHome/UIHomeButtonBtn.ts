// UIHomeButtonBtn.ts
import { _decorator, Component, Node, Button, EventTouch } from 'cc';
import { GameComponent } from 'db://oops-framework/module/common/GameComponent';
import { GameHelper } from '../gameplay/GameTool/GameHelper';
import { FunctionOpenType } from '../gameplay/GameDataModel/FunctionOpenType';
const { ccclass, property } = _decorator;

@ccclass('UIHomeButtonBtn')
export class UIHomeButtonBtn extends GameComponent {
    @property(Node)
    lockImage: Node = null!;
    @property(Node)
    redImage: Node = null!;
    @property(Node)
    iconImage: Node = null!;
    @property(Node)
    nameText: Node = null!;
    @property(Button)
    btn: Button = null!;
    private _onClick: Function = null!;
    private  _functionOpenType:FunctionOpenType=FunctionOpenType.None;
    public OnInit(onClick:Function, type:FunctionOpenType)
    {
        this._functionOpenType = type;
        this._onClick = onClick;
        this.btn.node.on(Button.EventType.CLICK, this.onButtonClicked, this);
        this.onRefresh();
    }

    public onRefresh()
    {
        const isUnlock = this._functionOpenType == FunctionOpenType.None || GameHelper.IsFunctionOpen(this._functionOpenType, false);
        this.lockImage.active=!isUnlock;
    }
    onButtonClicked(event: EventTouch) {
        if (this._onClick) {
            this._onClick();
        }
    }

    onDestroy() {
        if(this.btn.node!= null)
            this.btn.node.off(Button.EventType.CLICK, this.onButtonClicked, this);
    }
}
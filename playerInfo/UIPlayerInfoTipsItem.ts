import { Button } from 'cc';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { changeSpriteImage, getLabelText } from '../common/UIExTool';
import { GameData } from '../gameplay/GameDataModel/GameData';
const { ccclass, property } = _decorator;

@ccclass('UIPlayerTipsItem')
export class UIPlayerTipsItem extends Component {

    @property(Label)
    targetValueBtnText: Label = null!;
    @property(Label)
    descText: Label = null!;
    
    @property(Button)
    unlockBtn: Button = null!;
    
    @property(Sprite)
    unlockImage: Sprite = null!;
    @property(Sprite)
    icon: Sprite = null!;
    
    private _infoType: number = 0;
    private _onAdCallback: Function = null!;
    // ADEnum adenum = ADEnum.PlayerInfo_adv;

    protected onLoad(): void {
        this.unlockBtn.node.on(Button.EventType.CLICK, this._onClick, this);
    }

    public OnInit(infoType: number, isUnlock: boolean, desc: string, curNum: number = 0, targetNum: number = 0, callback: Function = (a:string)=>{})
    {
        this._infoType = infoType;
        this._onAdCallback = callback;
        this.descText.string = isUnlock ? desc : getLabelText("Player_Guess");
        this.targetValueBtnText.string = `${curNum}/${targetNum}`;
        this.unlockBtn.node.active = !isUnlock;
        this.unlockImage.node.active = isUnlock;
        this.RefreshIcon();
    }
    private RefreshIcon()
    {
        // changeSpriteImage(this.icon, GameData.GetIconPathByADEnum(adenum), "UIPlayerInfo")
    }
    private _onClick()
    {
        console.error("");
        // WxADSystem.Instance.ShowRewardedVideoAd(_adSuccessCallback, adenum);
    }

    private _adSuccessCallback()
    {
        if(this._onAdCallback){
            this._onAdCallback(this._infoType);
        }
    }
}



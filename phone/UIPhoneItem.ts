import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { GameEvent } from '../common/config/GameEvent';
import ConfigManager from '../manager/Config/ConfigManager';
import { TimeExUtil } from '../common/TimeExUtils';
import { changeLabelText, changeSpriteImage, getImagePath, getLabelText, getPhoneHeadIconPath } from '../common/UIExTool';
import { Button } from 'cc';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { Animation } from 'cc';
import { TimeUtility } from '../gameplay/Utility/TimeUtility';
import { SdkManager } from '../../modules/sdk/SdkManager';
import { GuideManager } from '../UIGuide/GuideManager';
const { ccclass, property } = _decorator;

@ccclass('UIPhoneItem')
export class UIPhoneItem extends CCComp {
    
    @property(Sprite)
    headImage: Sprite = null!;
    @property(Sprite)
    redImage: Sprite = null!;
    @property(Sprite)
    lineImage: Sprite = null!;
    @property(Label)
    labName: Label = null!;
    @property(Label)
    labInfo: Label = null!;
    @property(Label)
    labTime: Label = null!;
    @property(Button)
    bgButton: Button = null!;
    @property(Animation)
    animation: Animation = null!;


    _roleId: number = 0;
    _callback: Function = null!;
    _iconPath: string = "";

    start() {

        this.bgButton.node.on(Button.EventType.CLICK, this._onClickBg, this);
    }

    update(deltaTime: number) {
        
    }

    reset(): void {
        
    }
    /**
     * 
     * @param roleId 
     * @param content key
     * @param time 
     */
    public OnInit(roleId: number, content: string, time: number, callback: Function){
        this._roleId = roleId;
        var cfg = ConfigManager.tables.TbBook.get(this._roleId);
        if(cfg == null || cfg == undefined) {
            return 0;
        }
        this.animation.stop();
        this._callback = callback;
        
        this.labName.string = cfg.Name;
        this.labInfo.string = content;
        // changeLabelText(this.labInfo, content)

        this.bgButton.node.active = false;
        // const dtTime = TimeUtility.GetTimeStamp() - time;
        this.labTime.string = TimeUtility.FormatTime(time*1000);//TimeUtility.GetTimeFormat_HHMM(dtTime);//+ getLabelText("WordPrevious");// TimeExUtil.getTimeDescription(time);
        
        if(this._iconPath != cfg.PhoneIcon) {
            changeSpriteImage(this.headImage, getImagePath(cfg.PhoneIcon), "UIPhone");
        }
        this._iconPath = cfg.PhoneIcon;
        // changeSpriteImage(this.headImage, getPhoneHeadIconPath(roleId), "UIPhone");

        this.redImage.node.active = !GameData.IsCurrentChatEnd(this._roleId);
        this.bgButton.node.active = true;

        return this.node.uiTransform.height;
    }

    public RunSwitchAnimation()
    {
        // this.animation.play();
    }

    // 
    _onClickBg(){
        GuideManager.Instance.FinishGuide();
        if(this._callback != null) {
            this._callback(this._roleId);
            // const chatData = GameData.GetChatDataListByRoleId(this._roleId);
            // if(chatData) {
            //     chatData.AddNewSeeCount();
            //     SdkManager.inst.event("message_view", {roleID: this._roleId, num: chatData.ClickSeeCount});
            // }
        }     
    }
}



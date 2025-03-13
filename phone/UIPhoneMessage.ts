import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { Button } from 'cc';
import ConfigManager from '../manager/Config/ConfigManager';
import { changeLabelText, changeSpriteImage, getImagePath, getPhoneHeadIconPath } from '../common/UIExTool';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { GameEvent } from '../common/config/GameEvent';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { SdkManager } from '../../modules/sdk/SdkManager';
import { GuideManager } from '../UIGuide/GuideManager';
const { ccclass, property } = _decorator;

@ccclass('UIPhoneMessage')
export class UIPhoneMessage extends CCComp {

    @property(Sprite)
    headImage: Sprite = null!;

    @property(Label)
    lab_info: Label = null!;
    @property(Label)
    lab_name: Label = null!;
    @property(Node)
    ArrNodeGuideTakeUp: Node[] = []!;//

    @property(Button)
    bgBtn: Button = null!;

    _roleId: number = 0;

    private _showContentKey: string = "";
    private _isCheck: boolean = false;
    private _cd: number = 0;

    onAdded(args: any) {
        // let param = {roleId, message};
        console.log("args:%s", args);
        this._showContentKey = args?.message;
        this._roleId = args?.roleId;
        if(args.roleId == null) {
            console.error("no find roleId in UIPhoneMessage");
        }
        if(args.message == null) {
            console.error("no find message in UIPhoneMessage");
        }
        return true;
    }

    protected onLoad(): void {
        let audio =ConfigManager.tables.TbAudio.get(2008)!;
            oops.audio.playEffect(audio?.Resource, "Audios");
    }

    reset(): void {
        this._init();
    }
    start() {
        this._init();
        this.showGuide();
    }

    private _init(){
        this._cd = 5;
        this._isCheck = true;

        this._updateAll();
    }

    update(deltaTime: number) {
        if (!this._isCheck || this._cd < 0)
        {
            return;
        }
        this._cd -= deltaTime;
        if (this._cd < 0)
        {
            oops.gui.remove(UIID.PhoneMessage);
        }
    }


    private async _updateAll()
    {
        if(this._roleId == null) {
            return;
        }
        if(this._showContentKey == null) {
            this._showContentKey = "";
        }
        changeLabelText(this.lab_info, this._showContentKey == "" ? "PhoneMessageDefault" : this._showContentKey);
        var playerCfg = ConfigManager.tables.TbBook.get(this._roleId);
        if(playerCfg != null) {
            this.lab_name.string = playerCfg.Name;
            this.headImage.node.active = false;
            await changeSpriteImage(this.headImage, getImagePath(playerCfg.PhoneIcon), "UIPhone");
            if(this.node.isValid){
                this.headImage.node.active = true;
            }
        }
    }

    showGuide()
    {
        GuideManager.Instance.TryShowGuide(1200, [this.bgBtn], () => {
            this._isCheck = false;
            GuideManager.Instance.SetGuideIdFinished(1200);//1200
        }, () => {}, ()=>{},[],this.ArrNodeGuideTakeUp);
    }

    public onClick()
    {
        GuideManager.Instance.FinishGuide();
        this._isCheck = false;
        oops.gui.remove(UIID.PhoneMessage);
        try  {
            oops.gui.remove(UIID.UILevelUp);
        } catch (error) {
            console.error(' ' ,error);
        }
        // oops.message.dispatchEvent(GameEvent.ShowPhone);
        oops.gui.openAsync(UIID.Phone, {roleId:this._roleId});
        const chatData = GameData.GetChatDataListByRoleId(this._roleId);
        if(chatData) {
            //chatData.AddNewSeeCount();
            SdkManager.inst.event("message_view", {userid: this._roleId, message_view: 1});
        }
    }
}



import { Label, Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from '../../../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { CCComp } from '../../../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { UIID } from '../../../common/config/GameUIConfig';
import { changeSpriteImage } from '../../../common/UIExTool';
import { FunctionOpenSystem } from '../../Manager/FunctionOpenSystem';
import { GuideManager } from '../../../UIGuide/GuideManager';
import { Utility } from '../../Utility/Utility';
const { ccclass, property } = _decorator;

@ccclass('UIOpenFunction')
export class UIOpenFunction extends CCComp {
    
    @property(Label)
    nameLabel: Label = null!;
    @property(Label)
    descLabel: Label = null!;
    @property(Sprite)
    icon: Sprite = null!;

    private closeCallback : Function = null!;
    onAdded(args: any) {
        console.log("args:%s", args);
        if (args == null || args.name == "" || args.desc == "" || args.icon == "") {
            console.error("");
            return;
        }
        this.nameLabel.string = args.name;
        this.descLabel.string = args.desc;
        this.closeCallback = args.closeCallback;
        changeSpriteImage(this.icon, args.icon, "OpenFunction");
        return true;
    }

    start() {
        Utility.PlayAudioOnId(2048);
    }

    reset(): void {
    }
 

    onClickClose() {
        oops.gui.remove(UIID.UIOpenFunction);
        FunctionOpenSystem.Instance.ShowOpenFunction(this.closeCallback);
    }
}



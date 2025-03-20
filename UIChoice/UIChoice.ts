import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { UIID } from '../common/config/GameUIConfig';
import { GameEvent } from '../common/config/GameEvent';
import ConfigManager from '../manager/Config/ConfigManager';
import { PlotSegType, StorySystem } from '../gameplay/Manager/StorySystem';
import { UIMainVideoComp } from '../UIMainVideo/UIMainVideoComp';
import { Label } from 'cc';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { find } from 'cc';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { Utility } from '../gameplay/Utility/Utility';
const { ccclass, property } = _decorator;

@ccclass('UIChoice')
export class UIChoice extends CCComp {

    @property({ type: Node })
    private btn1: Node = null!;
    @property({ type: Node })
    private btn2: Node = null!;
    @property({ type: Node })
    private btn3: Node = null!;
    @property({ type: Node })
    private btn4: Node = null!;

    reset(): void {

    }

    onEnable(){
        this.on(GameEvent.UIStoryKilledEvent, this.onUIStoryKilledEvent, this);
    }

    onDisable(){
        this.off(GameEvent.UIStoryKilledEvent);
    }

    private Id: number = 0;
    onAdded(id: any) {
        this.Id = id;
        return true;
    }

    start() {
        this.refreshBtn(1);
        this.refreshBtn(2);
        this.refreshBtn(3);
        this.refreshBtn(4);
    }

    private type = 0;
    private OnChoice(choiceID: number): void {
        Utility.PlayAudioOnId(2046);
        const cfg = ConfigManager.tables.TbChoice.get(this.Id)!;
        this.type = cfg.Type;

        this.onClose();

        let isMain = false;
        if (cfg) {
            let id = 0;
            switch (choiceID) {
                case 1:
                    id = cfg.Next1Id;
                    isMain = cfg.C1type == 1;
                    break;
                case 2:
                    id = cfg.Next2Id;
                    isMain = cfg.C2type == 1;
                    break;
                case 3:
                    id = cfg.Next3Id;
                    isMain = cfg.C3type == 1;
                    break;
                case 4:
                    id = cfg.Next4Id;
                    isMain = cfg.C4type == 1;
                    break;
            }
            GameData.PlayerData.GlobalData.ChoiseState.set(this.Id * 10 + choiceID, true);
            if (isMain)
                StorySystem.Instance.unresolvedId = 0;
            else
                StorySystem.Instance.unresolvedId = this.Id;

            switch (cfg.Type) {
                case PlotSegType.NextStory:
                    // 
                    StorySystem.Instance.Over();
                    StorySystem.Instance.Play(id);
                    break;

                case PlotSegType.PlayDuiHua:
                    // 
                    oops.gui.openAsync(UIID.TalkView, {Id: id});
                    break;
                case PlotSegType.PlayVideo:
                    // 
                    PlayerSystem.Instance.PlayVideo(id);
                    // UIMainVideoComp.getInstance().playUrl(id, false);
                    break;
                case PlotSegType.OpenGame:
                    // 
                    oops.gui.openAsync(UIID.UIPiano);
                    break;

            }

            if (cfg.Type > PlotSegType.PlayDuiHua) {
                if(oops.gui.has(UIID.TalkView)){
                    oops.gui.remove(UIID.TalkView);
                }
            }
        }
    }

    private onClose(): void {
        oops.gui.remove(UIID.UIChoice)
        // oops.message.dispatchEvent(GameEvent.ChoiceOver);
        StorySystem.Instance.unresolveding = false;
        oops.message.dispatchEvent(GameEvent.ChoiceOver, this.type);
    }

    public onUIStoryKilledEvent(){
        oops.gui.remove(UIID.UIChoice)
    }


    private refreshBtn(id : number) {
        const cfg = ConfigManager.tables.TbChoice.get(this.Id)!;
        let btn = this.btn1;
        let Text = '';
        let isMain = false;

        switch (id) {
            case 1:
                btn = this.btn1;
                Text = cfg.Text1;
                isMain = cfg.C1type == 1;
                break;
            case 2:
                btn = this.btn2;
                Text = cfg.Text2;
                isMain = cfg.C2type == 1;
                break;
            case 3:
                btn = this.btn3;
                Text = cfg.Text3;
                isMain = cfg.C3type == 1;
                break;
            case 4:
                btn = this.btn4;
                Text = cfg.Text4;
                isMain = cfg.C4type == 1;
                break;
        }
        if (Text.length <= 0) {
            btn.active = false;
            return;
        }
        btn.active = true;

        btn.on(Button.EventType.CLICK, () => { this.OnChoice(id); }, this);

        let text = find("Label", btn)?.getComponent(Label)!;
        text.string = Text;

        let bgName = isMain ? 'bg' : 'bg2';
        let bg = find(bgName, btn)!;
        bg.active = true;
 
        let zx = find("zx", btn)!;
        zx.active = isMain;

        let ls = find("ls", btn)!;
        ls.active = GameData.PlayerData.GlobalData.ChoiseState.get(this.Id * 10 + id) == true;
    }    

}



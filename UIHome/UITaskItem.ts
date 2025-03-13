import { Button } from "cc";
import { ProgressBar } from "cc";
import { Label } from "cc";
import { _decorator } from "cc";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { TaskType } from "../gameplay/GameDataModel/TaskType";
import { GameEvent } from "../common/config/GameEvent";
import { PlayerSystem } from "../gameplay/Manager/PlayerSystem";
import { GameData } from "../gameplay/GameDataModel/GameData";
import { GameHelper } from "../gameplay/GameTool/GameHelper";
import { Node } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "../common/config/GameUIConfig";
import ConfigManager from "../manager/Config/ConfigManager";
import { Widget } from "cc";
import { RichText } from "cc";
import LanguageUtils from "../gameplay/Utility/LanguageUtils";
import { StorySystem } from '../gameplay/Manager/StorySystem';
import { PlotSegType } from "../gameplay/Manager/StorySystem";

const { ccclass, property } = _decorator;
@ccclass
export class UITaskItem extends GameComponent {
    @property(Node)
    completeNode: Node = null!;
    
    @property(Button)
    clickBtn: Button = null!;
    
    @property(RichText)
    des: RichText = null!;

    @property(Node)
    goIcon: Node = null!;
    
    @property(Node)
    line: Node = null!;
    
    @property(Node)
    gift: Node = null!;

    @property(Node)
    pro: Node = null!;
    @property(Node)
    noDoneEff: Node = null!;
    
    @property(ProgressBar)
    proValue: ProgressBar = null!;

    taskType: TaskType = TaskType.Nothing;
    taskParam:number = 0;
    
    private curTaskAwayCfg: any = null!;

    onLoad() {
        this.on(GameEvent.CharacterAttributeChange,this.characterAttributeChange,this)
    }

    onDestroy() {
        this.off(GameEvent.CharacterAttributeChange)
    }

    private characterAttributeChange() {
 
    }

    showComplete(show: boolean) {
        
        this.completeNode.active = show;
        this.goIcon.active = !show;
        this.noDoneEff.active = !show;

        if(this.taskType == TaskType.Exp) {
            this.goIcon.active = false;
        }
    }

    public init(taskType: TaskType, des: string, taskParam: number, isEnd: boolean, click?: () => void) {
        //this.node.getComponent(Widget)?.updateAlignment();
        this.taskType = taskType;
        this.taskParam = taskParam;
        this.des.string = des;

        this.line.active = !isEnd;
        this.gift.active = false;
        this.completeNode.active = false;
        //this.pro.active = false;
        this.node.active = true;
        this.noDoneEff.active = false;

        if (taskType === TaskType.KaDian) {
            const taskCfg = PlayerSystem.Instance.GetTbTask();
            for (let i = 0; i < taskCfg.EventId.length; i++) {
                const events = taskCfg.EventId[i].split('|');
                for (let j = 0; j < events.length; j++) {
                    if (parseInt(events[j]) === TaskType.KaDian) {
                        this.curTaskAwayCfg = ConfigManager.tables.TbTaskAway.get(parseInt(taskCfg.EventParam[i].split('|')[j]));
                        break;
                    }
                }
            }
            //this.pro.active = true;
            //this.proValue.progress = 0;
        }
    }

    private onClickItem() {
        switch (this.taskType) {
            case TaskType.KaDian:
                if (!PlayerSystem.Instance.IsStartAwayTask || 
                    (PlayerSystem.Instance.IsStartAwayTask && 
                     PlayerSystem.Instance.CurTaskAwayTimeStamp >= 0)) {

                        
                    oops.gui.open(UIID.UIKadianTask);
                }
                break;
            case TaskType.MingZuoShe:
                oops.gui.openAsync(UIID.UIConstellation, {starId:this.taskParam});
                break;
            case TaskType.Strength:
            case TaskType.Endurance:
            case TaskType.Intelligence:
            case TaskType.Appearance:
            case TaskType.Charisma:
                oops.gui.open(UIID.Fitness);
                break;
            case TaskType.PhoneMessage:
                //UIPhoneTipsContext.instance.close();
                oops.gui.remove(UIID.PhoneMessage);
                oops.message.dispatchEvent(GameEvent.ShowPhone);
                break;
            case TaskType.Story:
                if (!StorySystem.Instance.IsLookComplete(this.taskParam)) {
                    //oops.gui.openAsync(UIID.TalkView, {Id: this.taskParam});
                    StorySystem.Instance.Play(this.taskParam,()=>{
                        this.showComplete(true);
                        PlayerSystem.Instance.TryLevelUp();
                    });
                }
                break;
            case TaskType.Date:
            case TaskType.LittleGame:
            case TaskType.DateAndGame:
                GameHelper.TransformLayer("HeiPingZhuanChang", 0.33, () => {
                    oops.gui.openAsync(UIID.UIBigCityMap);
                });
                break;
        }
    }

    update(dt: number) {
        if (this.taskType === TaskType.KaDian && this.curTaskAwayCfg && !this.completeNode.active) {
            if (!PlayerSystem.Instance.IsStartAwayTask) return;

            const curTime = Math.floor(Date.now() / 1000);
            if (PlayerSystem.Instance.CurTaskAwayTimeStamp <= 0) {
                //this.proValue.progress = 1;
                this.gift.active = true;
                return;
            }

            let remindTime = PlayerSystem.Instance.CurTaskAwayTimeStamp - curTime;
            if (remindTime < 0) remindTime = 0;
            
            //this.proValue.progress = 1 - (remindTime / (this.curTaskAwayCfg.Time * 60));
        }
    }
}

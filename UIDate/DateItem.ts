import { Sprite } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { GameEvent } from '../common/config/GameEvent';
import { oops } from 'db://oops-framework/core/Oops';
import { tips } from '../common/prompt/TipsManager';
import { StorySystem } from '../gameplay/Manager/StorySystem';
import { SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DateItem')
export class DateItem extends CCComp {

    @property(Sprite)
    datePic: Sprite = null!;
    @property(Node)
    dateLocked: Node = null!;
    @property(Label)
    dateLevel: Label = null!;
    @property(Label)
    dateName: Label = null!;

    mDateItemId:number = 0

    start() {

    }

    update(deltaTime: number) {
        
    }

    reset(): void {
        
    }

    showItem(dateId: number){
        this.mDateItemId = dateId;
        let dateInfo = PlayerSystem.Instance.getDateInfoByDateId(dateId);
        if(dateInfo){
            //this.setSprite(this.datePic, dateInfo.Pic, "UIDate");
            oops.res.loadAsync<SpriteFrame>("UIDate", dateInfo.Pic).then((sp)=>{
                if(this.isValid){
                    this.datePic.spriteFrame = sp;
                }
            });

            this.dateName.string = dateInfo.Name;
            const player = PlayerSystem.Instance.GetPlayerDataById(dateInfo.RoleId);
            if(player && dateInfo.UnlockLevel <= player.level){
                this.dateLocked.active = false;
                this.datePic.grayscale = false;
            }
            else{
                this.dateLocked.active = true;
                this.datePic.grayscale = true;
            }

            this.dateLevel.string = "LV." + dateInfo.UnlockLevel.toString();
        }
    }

    onClickItem(){
        let dateInfo = PlayerSystem.Instance.getDateInfoByDateId(this.mDateItemId);
        if(dateInfo){
            const player = PlayerSystem.Instance.GetPlayerDataById(dateInfo.RoleId);
            if(player && dateInfo.UnlockLevel <= player.level){
                //
                tips.confirm("", () => {
                    StorySystem.Instance.Play(dateInfo.PlotId);
                }, "", () => {}, "", true);
            }
            else{
                oops.gui.toast("");
            }
        }
    }
}



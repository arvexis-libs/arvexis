import { _decorator, Component, Node } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import ConfigManager from '../manager/Config/ConfigManager';
import { UIRoleSelectItem } from './UIRoleSelectItem';
import { GameEvent } from '../common/config/GameEvent';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { ScrollView } from 'cc';
import { EventHandler } from 'cc';
import { TipsNoticeUtil } from '../gameplay/Utility/TipsNoticeUtil';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
import { GameHelper } from '../gameplay/GameTool/GameHelper';
import { tips } from '../common/prompt/TipsManager';
import { SdkManager } from '../../modules/sdk/SdkManager';
import { game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIRoleSelect')
export class UIRoleSelect extends CCComp {

    @property(Node)
    itemParent:Node = null!
    @property(Node)
    arrowNode:Node = null!

    @property(ScrollView)
    mScrollView:ScrollView = null!

    protected onLoad(): void {
        this.on(GameEvent.RoleSelectItemClick, this.onClickItem, this);

        const scrollViewEventHandler = new EventHandler();
        scrollViewEventHandler.target = this.node; //  node 
        scrollViewEventHandler.component = 'UIRoleSelect';// 
        scrollViewEventHandler.handler = 'onMapScrollViewScroll';
        //scrollViewEventHandler.customEventData = 'foobar';

        this.mScrollView.scrollEvents.push(scrollViewEventHandler);
        UIMusicManager.inst.playUIMusic(UIID.UIRoleSelect, 1006);
    }
    async start() {
        let roleList = ConfigManager.tables.TbPlayer.getDataList();
        for(let i = 0; i < roleList.length; i++){
            console.log(roleList[i].Name);

            let itemNode = await this.createPrefabNodeAsync('Prefab/RoleSelectItem', 'UIRoleSelect');
            itemNode.setParent(this.itemParent);
            itemNode.getComponent(UIRoleSelectItem)?.setRoleId(roleList[i].Id, i);
        }
        this.refreshArrow();
    }

    onClickItem(event:any, roleId:number){
        GameHelper.TransformLayer("XuanJueAni", 0.5, () => {
            oops.gui.remove(UIID.UIRoleSelect);
        });
    }

    
    private onClickZhuXiao(){
        tips.confirm("?", () => {
            SdkManager.inst.logout();
            this.scheduleOnce(() => {
                game.end();
            }, 0.1)
        }, "common_prompt_ok", () => {
            
        }, "common_prompt_cancal", true);

    }

    onClickClose() {
        oops.gui.remove(UIID.UIRoleSelect);
    }

    private getPlayerDescription(playerId: number): string {
        var cfg = ConfigManager.tables.TbPlayer.get(playerId)!;
        const playerData = PlayerSystem.Instance.GetPlayerDataById(playerId)!;

        if (PlayerSystem.Instance.PlayerIsUnlock(playerId)) {
            return `${cfg.Name}              Lv.${playerData.level}`;
        } else {
             return ``;
            /*const [requiredId, requiredLevel] = cfg.Unlock;
            const requiredConfig = ConfigManager.tables.TbPlayer.get(requiredId)!;
            return `${requiredConfig.Name}${requiredLevel}`;*/
        }
    }

    onMapScrollViewScroll(scrollview:ScrollView, eventType:any, customEventData:any){
        //console.log("onMapScrollViewScroll::::" + eventType);
        if(eventType != 4){
            return;
        }
        this.refreshArrow();

    }

    refreshArrow(){

        let max = this.mScrollView.getMaxScrollOffset();
        let curMax = this.mScrollView.getScrollOffset().y;
        if(curMax >= max.y){
            this.arrowNode.active = false;
        }else{
            this.arrowNode.active = true;
        }
    }

    reset(): void {
        
    }

}



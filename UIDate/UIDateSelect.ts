import { _decorator, Component, Node } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { UIID } from '../common/config/GameUIConfig';
import ConfigManager from '../manager/Config/ConfigManager';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { UIDateSelectItem } from './UIDateSelectItem';
const { ccclass, property } = _decorator;

@ccclass('UIDateSelect')
export class UIDateSelect extends CCComp {

    @property(Node)
    itemParent:Node = null!


    protected async start() {
        let players = ConfigManager.tables.TbPlayer.getDataList();
        let itemPrefab = await oops.res.loadAsync<Prefab>("UIDate", "Prefab/UIDateSelectItem");
        for(let i = 0; i < players.length; i++){
            let itemNode = instantiate(itemPrefab);
            itemNode.setParent(this.itemParent);
            itemNode.getComponent(UIDateSelectItem)?.showItem(players[i].Id);
        }
    }
    reset(): void {
        
    }

    onCloseHandler() {
        oops.gui.remove(UIID.UIDateSelect);
    }
}



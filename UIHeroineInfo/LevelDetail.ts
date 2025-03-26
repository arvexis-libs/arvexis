import { _decorator, Component, Node, Prefab } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import ConfigManager from 'db://assets/script/game/manager/Config/ConfigManager';
import { instantiate } from 'cc';
import { TrLevel } from '../schema/schema';
import { LevelDetailItem } from './LevelDetailItem';
import { Layout } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIHeroineInfo/LevelDetail')
export class LevelDetail extends Component {

    isRefresh: boolean = false;

    @property({type: Node})
    contentNode: Node = null!;

    async refresh() {
        if (this.isRefresh) return;
        this.contentNode.active = false;
        const prefab = await oops.res.loadAsync("UIHeroineInfo", "Prefab/LevelDetailItem", Prefab);
        ConfigManager.tables.TbLevel.getDataList().forEach((config, index) => {
            this.createItem(prefab, config, index);
        });
        // this.contentNode.getComponent(Layout)!.updateLayout();
        this.contentNode.active = true;
        this.isRefresh = true;
    }

    createItem(prefab: Prefab, config: TrLevel, index: number) {
        const node = instantiate(prefab);
        this.contentNode.addChild(node);
        const item = node.getComponent(LevelDetailItem)!;
        item.refresh(config, index);
    }
}



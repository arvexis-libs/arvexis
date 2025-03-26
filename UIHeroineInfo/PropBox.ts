import { instantiate } from 'cc';
import { _decorator, Component, Node, Prefab } from 'cc';
import ConfigManager from 'db://assets/script/game/manager/Config/ConfigManager';
import { oops } from 'db://oops-framework/core/Oops';
import { PropItem } from './PropItem';
const { ccclass, property } = _decorator;

@ccclass('UIHeroineInfo/PropBox')
export class PropBox extends Component {
    
    @property({type: Node})
    contentNode: Node = null!;

    async start() {
        const prefab = await oops.res.loadAsync("UIHeroineInfo", "Prefab/PropLine", Prefab);
        ConfigManager.tables.TbHeroinePropType.getDataList().forEach(item => {
            const node = instantiate(prefab);
            this.contentNode.addChild(node);
            const propItem = node.getComponent(PropItem)!;
            propItem.refresh(item);
        });
    }
}
import { Label } from 'cc';
import { UITransform } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { TrLevel } from 'db://assets/script/game/schema/schema';
const { ccclass, property } = _decorator;

@ccclass('UIHeroineInfo/LevelDetailItem')
export class LevelDetailItem extends Component {
    config: TrLevel = null!;
    index: number = 0;
    refresh(config: TrLevel, index: number) {
        this.config = config;
        for (let i = 0; i < this.node.children.length; i++) {
            const child = this.node.children[i];
            this.refreshNode(child, i);
        }
        // const trs = this.node.getComponent(UITransform)!;
        // this.node.setPosition(0,  -trs.height * (index + 0.5), 0);
        // console.log(`[LevelDetailItem]refresh ,position: ${this.node.position},index: ${index}`);
    }

    refreshNode(node: Node, index: number) {
        const label = node.getChildByName("text")?.getComponent(Label)!;
        switch (index) {
            case 0:
                label.string = `${this.config.Id}`;
                break;
            case 1:
                label.string = `+${this.config.PowAdd}`;
                break;
            case 2:
                label.string = `+${this.config.MagicKey}`;
                break;
            case 3:
                label.string = `${this.config.MagicKeyMax}`;
                break;
            case 4:
                label.string = `+${this.config.MagicBoxReward}%`;
                break;
        }
    }
}
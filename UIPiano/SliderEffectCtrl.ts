import { _decorator, Component, Node, Sprite, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SliderEffectCtrl')
export class SliderEffectCtrl extends Component {
    @property(Node)
    Effect_Trail:Node = null!;

    private sprite:Sprite|null = null!;
    start() {
        this.sprite = this.node.getComponent(Sprite)
    }

    update(deltaTime: number) {
        let pos = new Vec3(this.node.uiTransform.contentSize.x * this.sprite!.fillRange, 0, 0);
        this.Effect_Trail.position = pos;
    }
}



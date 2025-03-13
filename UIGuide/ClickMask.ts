import { Camera } from 'cc';
import { Vec3 } from 'cc';
import { _decorator, Component, Node, UITransform, Vec2, EventTouch, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ClickMaskWithArea')
export class ClickMaskWithArea extends Component {
    @property(Node)
    BtnNode:Node = null!;

    onLoad() {


        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.anchorX = 0.5;
            uiTransform.anchorY = 0.5;
        }

        // 
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        const touchLocation = event.getUILocation(); // UI
        if (this.isPointInRect(touchLocation,this.BtnNode)) {
            event.preventSwallow = true//
        }
        else {

        }
    }

    onTouchEnd(event: EventTouch) {
        event.preventSwallow = true
    }

    isPointInRect(point: Vec2,btnTarget:Node): boolean {
        const btnWorldPos = btnTarget.getWorldPosition();
            const uiTransform = btnTarget.getComponent(UITransform)!;
        return (
            point.x >= btnWorldPos.x - uiTransform.width/2 && point.x <= btnWorldPos.x + uiTransform.width/2 &&
            point.y >= btnWorldPos.y - uiTransform.height/2 && point.y <= btnWorldPos.y + uiTransform.height/2
        );
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
}
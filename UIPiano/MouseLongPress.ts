import { EventTouch } from 'cc';
import { _decorator, Component, Node, EventMouse, Event } from 'cc';

@_decorator.ccclass('GlobalLongPressDetector')
export class GlobalLongPress extends Component {
    
    private longPressTime: number = 0.1; // 
    private isPressed: boolean = false;
    private timerId: NodeJS.Timer = null!;  // ID
    onLoad() {
        //  Canvas 
        // this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);
        // this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.TOUCH_START, this.onPointerDown, this);
        this.node.on(Node.EventType.TOUCH_END, this.onPointerExit, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onPointerExit, this);

        this.node.emit('custom_mouse_down', { message: "Hello from emit!" });
        this.node.emit('custom_mouse_up', { message: "Hello from emit!" });
    }
    private onPointerDown(event: EventTouch): void {
        this.timerId = setInterval(()=> {
            this.node.emit('custom_mouse_down', 'down');
        }, 100); 
    }


    private onPointerExit(event: EventTouch): void {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.node.emit('custom_mouse_up', 'up');
        }

    }
    onDestroy() {
        // this.node.off(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // this.node.off(Node.EventType.MOUSE_UP, this.onMouseUp, this);
        // this.node.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.off(Node.EventType.TOUCH_START, this.onPointerDown, this);
        this.node.off(Node.EventType.TOUCH_END, this.onPointerExit, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onPointerExit, this);
    }

    // onMouseDown(event: EventMouse) {
    //     this.isPressed = true;

    //     this.scheduleOnce(() => {
    //         if (this.isPressed) {
    //             this.onLongPress();
    //         }
    //     }, this.longPressTime);
    //     this.node.emit('custom_mouse_down', 'down');
    // }

    // onMouseUp(event: EventMouse) {
    //     this.isPressed = false;
    //     this.node.emit('custom_mouse_up', 'up');
    // }

    // onMouseLeave(event: EventMouse) {
    //     this.isPressed = false;
    // }

    onLongPress() {
    }
}
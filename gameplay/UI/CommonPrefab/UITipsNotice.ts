import { Label } from "cc";
import { Sprite } from "cc";
import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { GameEvent } from "../../../common/config/GameEvent";
import { instantiate, Vec3 } from "cc";
import { Node } from "cc";
import { UITransform } from "cc";

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("UI/UITipsNoticeView")
export default class UITipsNoticeView extends GameComponent 
{
    // 
    @property(Node)
    private templateNode: Node = null!;

    @property(Node)
    private container: Node = null!;

    // 
    private noticePool: Node[] = [];
    private activeNotices: Set<Node> = new Set();

    // // 
    // @property(Animation)
    // private entryAnimation: Animation = null!;
    @property(Number)
    private displayDuration: number = 1;

    // // 
    // @property(Label)
    // private textLabel: Label = null!;
    // @property(Sprite)
    // private backgroundSprite: Sprite = null!;

    private str:string=null!;
    private ShowBg:boolean=false;
    onAdded(args: any) {
        this.str=args[0];
        this.ShowBg=args[1];
        return true;
    }

    protected onLoad() 
    {
        this.initPool(5);
    }

    protected onEnable() 
    {
        this.on(GameEvent.OnShowNoticeTips, this.onHandler, this);
        this.onShowNotice(this.str, this.ShowBg);
    }
    private onHandler(event: string, args: any): void {
        this.onShowNotice(args[0],args[1]);
    }
    protected onDisable() 
    {
        this.off(GameEvent.OnShowNoticeTips);
        this.clearAllNotices();
    }

    /**  */
    private initPool(initialSize: number): void 
    {
        for (let i = 0; i < initialSize; i++) 
        {
            const newNode = instantiate(this.templateNode);
            newNode.active = false;
            this.noticePool.push(newNode);
            this.container.addChild(newNode);
        }
    }

    /**  */
    public onShowNotice(message: string, showBg: any): void 
    {
        const noticeNode = this.getAvailableNode();
        this.setupNotice(noticeNode, message, showBg);
        this.scheduleAutoRecycle(noticeNode);
    }

    /**  */
    private getAvailableNode(): Node 
    {
        // 
        if (this.noticePool.length > 0) 
        {
            return this.noticePool.pop()!;
        }
        
        // 
        const newNode = instantiate(this.templateNode);
        this.container.addChild(newNode);
        return newNode;
    }

    /**  */
    private setupNotice(node: Node, message: string, showBg: boolean): void 
    {
        // 
        const label = node.getComponentInChildren(Label)!;
        label.string = message;

        // 
        const bgSprite = node.getComponent(Sprite)!;
        bgSprite.enabled = showBg;

        // 
        node.active = true;
        node.position = Vec3.ZERO;
        this.playEntryAnimation(node);
        
        this.activeNotices.add(node);
    }

    /**  */
    private playEntryAnimation(node: Node): void 
    {
        //const animState = this.entryAnimation.play();
        // if (animState) 
        // {
        //     animState.wrapMode = WrapMode.Normal;
        //     animState.speed = 1;
        // }
    }

    /**  */
    private scheduleAutoRecycle(node: Node): void 
    {
        this.scheduleOnce(() => 
        {
            this.recycleNode(node);
        }, this.displayDuration);
    }

    /**  */
    private recycleNode(node: Node): void 
    {
        if (!this.activeNotices.has(node)) return;

        // 
        node.active = false;
        //node.stopAllActions();
        
        // 
        this.activeNotices.delete(node);
        
        // 
        this.noticePool.push(node);
    }

    /**  */
    public clearAllNotices(): void 
    {
        this.activeNotices.forEach(node => {
            node.destroy();
        });
        this.activeNotices.clear();
        this.noticePool = [];
    }

    /**  */
    private updateLayout(): void 
    {
        let yPos = 0;
        this.container.children.forEach(child => 
        {
            if (child.active) 
            {
                child.y = yPos;
                yPos -= child.getComponent(UITransform)?.height! + 10;
            }
        });
    }
}

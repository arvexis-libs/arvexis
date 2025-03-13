
import { _decorator, Component, Node } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { GameComponent } from 'db://oops-framework/module/common/GameComponent';
import { UIID } from '../../../common/config/GameUIConfig';
import { ScrollView } from 'cc';
import { instantiate } from 'cc';
import UIItem from './UIItem';
const { ccclass, property } = _decorator;

@ccclass('UICommonGetAward')
export class UICommonGetAward extends GameComponent {
    @property(ScrollView)
    ScrollView: ScrollView = null!;
    @property(Node)
    UIItemPreFab: Node = null!;

    private config: any = {};
    onAdded(args: any) {
        this.config = args;
        this.ScrollView.content?.destroyAllChildren();
        this.Refresh();
        return true;
    }

    protected Refresh(): void {

        if (this.config.ids == null || this.config.nums == null || this.config.ids.Count != this.config.nums.Count) {
            this.OnClickClose();
            return;
        }

        const scrollContent = this.ScrollView.content!;
        for (let i = 0; i < this.config.ids; i++) {
            let itemNode: Node;
            if (scrollContent.children.length > i) {
                itemNode = scrollContent.children[i];
            }
            else {
                itemNode = instantiate(this.UIItemPreFab);
                itemNode.parent = scrollContent;
            }
            itemNode.active = true;
            const uiItem = itemNode.getComponent(UIItem);
            if (uiItem) {
                uiItem.init(this.config.ids[i], this.config.nums[i]);
            }
        }


    }


    private OnClickClose() {
        oops.gui.remove(UIID.UICommonGetAwardView);
    }
}



/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-08-05 10:13:47
 */

import { Node, tween, Vec3 } from "cc";
import { UICallbacks } from "../../../../../extensions/oops-plugin-framework/assets/core/gui/layer/Defines";
import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { UIID } from "../config/GameUIConfig";

/**  */
class TipsManager {
    test(callback?: Function) {
        let operate: any = {
            title: 'common_prompt_title_sys',
            content: "common_prompt_content",
            okWord: 'common_prompt_ok',
            cancelWord: 'common_prompt_cancal',
            okFunc: () => {
                console.log("okFunc");
            },
            cancelFunc: () => {
                
                console.log("cancelFunc");
            },
            needCancel: true
        };
        oops.gui.open(UIID.Confirm, operate, this.getPopCommonEffect());
    }

    alert(content: string, cb?: Function, title?: string, okWord?: string) {
        let operate: any = {
            title: title ? title : 'common_prompt_title_sys',
            content: content,
            okWord: okWord ? okWord : 'common_prompt_ok',
            okFunc: () => {
                cb && cb();
            },
            needCancel: false
        };
        oops.gui.open(UIID.Confirm, operate, tips.getPopCommonEffect());
    }

    confirm(content: string, cb: Function, okWord: string = "common_prompt_ok",cancelCb?: Function, cancelWord: string = "common_prompt_cancal", needCancel: boolean = false) {
        let operate: any = {
            title: 'common_prompt_title_sys',
            content: content,
            okWord: okWord,
            cancelWord: 'common_prompt_cancal',
            okFunc: () => {
                cb && cb()
            },
            cancelFunc: () => {
                cancelCb && cancelCb()
            },
            needCancel: needCancel
        };
        oops.gui.open(UIID.Confirm, operate, tips.getPopCommonEffect());
    }

    /**  */
    public getPopCommonEffect(callbacks?: UICallbacks) {
        let newCallbacks: UICallbacks = {
            // 
            onAdded: (node, params) => {
                node.setScale(0.1, 0.1, 0.1);

                tween(node)
                    .to(0.2, { scale: new Vec3(1, 1, 1) })
                    .start();
            },
            // 
            onBeforeRemove: (node, next) => {
                tween(node)
                    .to(0.2, { scale: new Vec3(0.1, 0.1, 0.1) })
                    .call((target, data) => {
                        next();
                    })
                    .start();
            },
        }

        if (callbacks) {
            if (callbacks && callbacks.onAdded) {
                let onAdded = callbacks.onAdded;
                // @ts-ignore
                callbacks.onAdded = (node: Node, params: any) => {
                    onAdded(node, params);

                    // @ts-ignore
                    newCallbacks.onAdded(node, params);
                };
            }

            if (callbacks && callbacks.onBeforeRemove) {
                let onBeforeRemove = callbacks.onBeforeRemove;
                callbacks.onBeforeRemove = (node, params) => {
                    onBeforeRemove(node, params);

                    // @ts-ignore
                    newCallbacks.onBeforeRemove(node, params);
                };
            }
            return callbacks;
        }
        return newCallbacks;
    }
}

export var tips = new TipsManager();
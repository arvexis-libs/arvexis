/*
 * @Author: dgflash
 * @Date: 2022-07-22 17:06:22
 * @LastEditors: dgflash
 * @LastEditTime: 2022-09-22 14:41:58
 */

import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { AsyncQueue, NextFunction } from "../../../../../extensions/oops-plugin-framework/assets/libs/collection/AsyncQueue";
import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { GameEvent } from "../../common/config/GameEvent";
import { UIID } from "../../common/config/GameUIConfig";
import { Initialize } from "../Initialize";
import { LoadingViewComp } from "../view/LoadingViewComp";

/**  */
@ecs.register('InitRes')
export class InitResComp extends ecs.Comp {
    reset() { }
}

@ecs.register('Initialize')
export class InitResSystem extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
    filter(): ecs.IMatcher {
        return ecs.allOf(InitResComp);
    }

    entityEnter(e: Initialize): void {
        var queue: AsyncQueue = new AsyncQueue();

        // 
        this.loadCustom(queue);
        // 
        this.loadLanguage(queue);
        // 
        //this.loadCommon(queue);
        // 
        this.onComplete(queue, e);

        queue.play();
    }

    /**  */
    private loadCustom(queue: AsyncQueue) {
        queue.push(async (next: NextFunction, params: any, args: any) => {
            // 
            oops.res.load("language/font/" + oops.language.current, next);
        });
    }

    /**  */
    private loadLanguage(queue: AsyncQueue) {
        queue.push((next: NextFunction, params: any, args: any) => {
            // 
            let lan = oops.storage.get("language");
            if (lan == null || lan == "") {
                lan = "zh";
                oops.storage.set("language", lan);
            }

            // 
            oops.language.setLanguage(lan, next);
        });
    }

    /**  */
    private loadCommon(queue: AsyncQueue) {
        queue.push((next: NextFunction, params: any, args: any) => {
            oops.res.loadDir("common", next);
        });
    }

    /**  */
    private onComplete(queue: AsyncQueue, e: Initialize) {
        queue.complete = async () => {
            var node = await oops.gui.openAsync(UIID.Loading);
            oops.message.dispatchEvent("InitResComplete"); //   
            //if (node) e.add(node.getComponent(LoadingViewComp) as ecs.Comp);
            e.remove(InitResComp);
        };
    }
}
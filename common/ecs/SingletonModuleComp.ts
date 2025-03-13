/*
 * @Author: dgflash
 * @Date: 2021-11-18 14:20:46
 * @LastEditors: dgflash
 * @LastEditTime: 2022-07-25 17:06:15
 */

import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { Account } from "../../account/Account";
import { Initialize } from "../../initialize/Initialize";

/**  */
@ecs.register('SingletonModule')
export class SingletonModuleComp extends ecs.Comp {
    /**  */
    initialize: Initialize = null!;
    /**  */
    get account(): Account {
        return this.initialize.account;
    }

    reset() { }
}

export var smc: SingletonModuleComp = ecs.getSingleton(SingletonModuleComp);
/*
 * @Author: dgflash
 * @Date: 2021-11-11 17:45:23
 * @LastEditors: dgflash
 * @LastEditTime: 2022-08-01 13:49:35
 */
import { ecs } from "../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { Account } from "../account/Account";
import ConfigManager from "../manager/Config/ConfigManager";
import { InitResComp, InitResSystem } from "./bll/InitRes";

/**
 * 
 * 1
 * 2
 */
@ecs.register('Initialize')
export class Initialize extends ecs.Entity {
    /**  */
    account: Account = null!;

    protected init() {
        // 
        this.account = ecs.getEntity<Account>(Account);
        this.addChild(this.account);

        // 
        this.add(InitResComp);
    }
}

// export class EcsInitializeSystem extends ecs.System {
//     constructor() {
//         super();

//         this.add(new InitResSystem());
//     }
// }
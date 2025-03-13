// /*
//  * @Author: dgflash
//  * @Date: 2022-01-25 17:49:26
//  * @LastEditors: dgflash
//  * @LastEditTime: 2022-07-21 16:49:00
//  */

// import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";
// import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
// import { RoleModelJobComp } from "../model/RoleModelJobComp";
// import { Role } from "../Role";
// import { RoleEvent } from "../RoleEvent";

// /**
//  * 
//  * 
//  * 
//  * 1
//  * 2
//  * 3
//  * 
//  * 
//  * 1ecs.Compecsecs.System 
//  * 2
//  */
// @ecs.register('RoleChangeJob')
// export class RoleChangeJobComp extends ecs.Comp {
//     /**  */
//     jobId: number = -1;

//     reset() {
//         this.jobId = -1;
//     }
// }

// @ecs.register('Role')
// export class RoleChangeJobSystem extends ecs.ComblockSystem implements ecs.IEntityEnterSystem {
//     filter(): ecs.IMatcher {
//         return ecs.allOf(RoleChangeJobComp, RoleModelJobComp);
//     }

//     entityEnter(e: Role): void {
//         // 
//         e.RoleModelJob.id = e.RoleChangeJob.jobId;

//         // 
//         oops.message.dispatchEvent(RoleEvent.ChangeJob);

//         e.remove(RoleChangeJobComp);
//     }
// }

// /*
//  * @Author: dgflash
//  * @Date: 2021-11-18 17:47:56
//  * @LastEditors: dgflash
//  * @LastEditTime: 2022-08-01 13:49:32
//  */
// import { Node, Vec3 } from "cc";
// import { ViewUtil } from "../../../../extensions/oops-plugin-framework/assets/core/utils/ViewUtil";
// import { ecs } from "../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
// import { MoveToComp } from "../common/ecs/position/MoveTo";
// import { RoleChangeJobComp, RoleChangeJobSystem } from "./bll/RoleChangeJob";
// import { RoleUpgradeComp, RoleUpgradeSystem } from "./bll/RoleUpgrade";
// import { RoleAnimatorType } from "./model/RoleEnum";
// import { RoleModelBaseComp } from "./model/RoleModelBaseComp";
// import { RoleModelComp } from "./model/RoleModelComp";
// import { RoleModelJobComp } from "./model/RoleModelJobComp";
// import { RoleModelLevelComp } from "./model/RoleModelLevelComp";
// import { RoleViewComp } from "./view/RoleViewComp";
// import { RoleViewInfoComp } from "./view/RoleViewInfoComp";

// /** 
//  *  
//  * 
//  * 1
//  * 2
//  * 3
//  * 4
//  * 5
//  */
// @ecs.register('Role')
// export class Role extends ecs.Entity {
//     // 
//     RoleModel!: RoleModelComp;
//     RoleModelBase!: RoleModelBaseComp;          // 
//     RoleModelJob!: RoleModelJobComp;
//     RoleModelLevel!: RoleModelLevelComp;

//     // 
//     RoleChangeJob!: RoleChangeJobComp;          // 
//     RoleUpgrade!: RoleUpgradeComp;              // 
//     RoleMoveTo!: MoveToComp;                    // 

//     // 
//     RoleView!: RoleViewComp;                    // 
//     RoleViewInfo!: RoleViewInfoComp;            // 

//     protected init() {
//         //  ECS 
//         this.addComponents<ecs.Comp>(
//             RoleModelComp,
//             RoleModelBaseComp,
//             RoleModelJobComp,
//             RoleModelLevelComp);
//     }

//     /** ECS System */
//     changeJob(jobId: number) {
//         var rcj = this.add(RoleChangeJobComp);
//         rcj.jobId = jobId;
//     }

//     /** MVVM */
//     upgrade(lv: number = 0) {
//         var ru = this.add(RoleUpgradeComp);
//         ru.lv = lv;
//     }

//     /** ECS System  */
//     move(target: Vec3) {
//         var move = this.get(MoveToComp) || this.add(MoveToComp);
//         move.target = target;
//         move.node = this.RoleView.node;
//         move.speed = 100;
//     }

//     destroy(): void {
//         // ecs
//         this.remove(RoleViewComp);
//         super.destroy();
//     }

//     /** cc.ComponentECSECS ECS API  */
//     load(parent: Node, pos: Vec3 = Vec3.ZERO) {
//         var node = ViewUtil.createPrefabNode("game/battle/role");
//         var mv = node.getComponent(RoleViewComp)!;
//         this.add(mv);

//         node.parent = parent;
//         node.setPosition(pos);
//     }

//     /** DEMO */
//     attack() {
//         this.RoleView.animator.setTrigger(RoleAnimatorType.Attack);
//     }
// }

// // export class EcsRoleSystem extends ecs.System {
// //     constructor() {
// //         super();

// //         this.add(new RoleChangeJobSystem());
// //         this.add(new RoleUpgradeSystem());
// //     }
// // }
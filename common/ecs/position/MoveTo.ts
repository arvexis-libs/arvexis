// /*
//  * @Author: dgflash
//  * @Date: 2021-08-11 16:41:12
//  * @LastEditors: dgflash
//  * @LastEditTime: 2023-01-19 15:27:24
//  */
// import { Node, Vec3 } from "cc";
// import { Timer } from "../../../../../../extensions/oops-plugin-framework/assets/core/common/timer/Timer";
// import { Vec3Util } from "../../../../../../extensions/oops-plugin-framework/assets/core/utils/Vec3Util";
// import { ecs } from "../../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";

// /**  */
// @ecs.register('MoveTo')
// export class MoveToComp extends ecs.Comp {
//     /**  */
//     node: Node = null!;
//     /**  */
//     velocity: Vec3 = Vec3Util.zero;
//     /**  */
//     speed: number = 0;
//     /** ECS */
//     target: Vec3 | Node | null = null;

//     /**  */
//     ns: number = Node.NodeSpace.LOCAL;
//     /**  */
//     offset: number = 0;
//     /**  */
//     offsetVector: Vec3 | null = null;
//     /**  */
//     onComplete: Function | null = null;
//     /**  */
//     onChange: Function | null = null;

//     reset() {
//         this.ns = Node.NodeSpace.LOCAL;
//         this.offset = 0;
//         this.target = null;
//         this.offsetVector = null;
//         this.onComplete = null;
//         this.onChange = null;
//     }
// }

// @ecs.register('VariableMoveTo')
// class VariableMoveToComponent extends ecs.Comp {
//     /**  */
//     timer: Timer = new Timer();
//     /**  */
//     end: Vec3 | null = null;
//     /**  */
//     target!: Vec3;

//     reset() {
//         this.end = null;
//         this.timer.reset();
//     }
// }

// /**  */
// export class MoveToSystem extends ecs.ComblockSystem<ecs.Entity> implements ecs.IEntityEnterSystem, ecs.IEntityRemoveSystem, ecs.ISystemUpdate {
//     filter(): ecs.IMatcher {
//         return ecs.allOf(MoveToComp);
//     }

//     entityEnter(e: ecs.Entity): void {
//         e.add(VariableMoveToComponent);
//     }

//     entityRemove(e: ecs.Entity): void {
//         e.remove(VariableMoveToComponent);
//     }

//     update(e: ecs.Entity) {
//         let move = e.get(MoveToComp);
//         let mtv = e.get(VariableMoveToComponent);
//         let end: Vec3;

//         console.assert(move.speed > 0, "");

//         if (move.target instanceof Node) {
//             end = move.ns == Node.NodeSpace.WORLD ? move.target.worldPosition : move.target.position;
//         }
//         else {
//             end = move.target as Vec3;
//         }

//         // 
//         if (mtv.end == null || !mtv.end.strictEquals(end)) {
//             let target = end.clone();
//             if (move.offsetVector) {
//                 target = target.add(move.offsetVector);           // 
//             }

//             // 
//             let start = move.ns == Node.NodeSpace.WORLD ? move.node.worldPosition : move.node.position;
//             move.velocity = Vec3Util.sub(target, start).normalize();

//             // 
//             let distance = Vec3.distance(start, target) - move.offset;

//             move.onChange?.call(this);

//             if (distance - move.offset <= 0) {
//                 this.exit(e);
//             }
//             else {
//                 mtv.timer.step = distance / move.speed;
//                 mtv.end = end.clone();
//                 mtv.target = move.velocity.clone().multiplyScalar(distance).add(start);
//             }
//         }

//         if (move.speed > 0) {
//             let trans = Vec3Util.mul(move.velocity, move.speed * this.dt);
//             move.node.translate(trans, Node.NodeSpace.LOCAL);
//         }

//         // 
//         if (mtv.timer.update(this.dt)) {
//             if (move.ns == Node.NodeSpace.WORLD)
//                 move.node.worldPosition = mtv.target;
//             else
//                 move.node.position = mtv.target;

//             this.exit(e);
//         }
//     }

//     private exit(e: ecs.Entity) {
//         let move = e.get(MoveToComp);
//         move.onComplete?.call(this);
//         e.remove(VariableMoveToComponent);
//         e.remove(MoveToComp);
//     }
// }
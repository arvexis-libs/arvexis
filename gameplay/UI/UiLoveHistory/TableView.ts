// import { Prefab } from "cc";
// import { UITransform } from "cc";
// import { instantiate } from "cc";
// import { ScrollView } from "cc";
// import { _decorator } from "cc";
// import { Component } from "cc";

// const { ccclass, property } = _decorator;
 
// /** 
//  * - 
//  * -  
//  * 
//  * - item setItemData 
//  * 
//  * - prefabitem pfbType
//  * 
//  * - itemcontenty10.5
//  * @author 
// */
// @ccclass
// export default class TableView extends Component {
 
//     @property({ displayName: '', tooltip: ' setItemData ', type: [Prefab] })
//     private pre_item: Prefab[] = [];
//     @property({ displayName: '', tooltip: ' setItemData ', type: [String] })
//     private scr_item: string[] = [];
//     /**  */
//     @property({ displayName: '' })
//     private itemInterval: number = 0;
 
//     /**  */
//     private itemData: any = null;
//     /**  */
//     private scrollView: ScrollView = null!;
//     /** item */
//     private item: Array<any> = null!;
//     /**  */
//     private content: Node = null!;
//     /**  */
//     private layerHeight: any = null;
//     /**  */
//     private firstItemIndex: number = 0;
//     private lastItemIndex: number = 0;
//     private firstItemData: any = {};
//     private lastItemData: any = {};
//     private itemArr: Array<any> = [];
//     private itemNode: Array<any> = [];
//     private itemPosMap: any = new Map();
//     private initItemData: boolean = true;
//     private count: number = 0;
//     private itemCanMoveDown: boolean = false;
//     private itemCanMoveUp: boolean = false;
 
//     onLoad() {
//         this.initPro();
//         // 
//         // let itemData = [];
//         // for (let i = 0; i < 20; i++) {
//         //     let test_data = {
//         //         pfbType: 0,
//         //     }
//         //     itemData.push(test_data);
//         // }
//         // this.init(itemData);
//     }
 
//     private initPro() {
//         this.scrollView = this.getComponent(ScrollView)!;
//         this.content = this.scrollView.content!;
//         this.item = this.pre_item;
//         this.layerHeight = this.getComponent(UITransform)?.height;
//         for (let i = 0; i < this.item.length; i++) {
//             this.itemNode[i] = instantiate(this.item[i]);
//         }
//         this.node.on('srollview-init', this.init, this);
//         this.node.on('srollview-update', this.updateList, this);
//     }
 
//     /**
//      * @param itemData 
//      * @param isSkipInit 
//      * @returns 
//      */
//     public init(itemData: Array<any>, isSkipInit: boolean = false) {
//         if (!itemData[0]) {
//             return false;
//         }
//         this.clearItem();
 
//         this.itemData = itemData; //item
//         this.firstItemIndex = 0;
//         this.lastItemIndex = 0;
//         this.firstItemData = {};
//         this.lastItemData = {};
//         this.itemArr = [];
//         this.itemPosMap = new Map();
//         this.initItemData = true;
//         this.count = 0;
//         if (isSkipInit) return;
//         // this.itemNode = [];
//         // for (let i = 0; i < this.item.length; i++) {
//         //     this.itemNode[i] = instantiate(this.item[i]);
//         // }
//         // log(this.testTime(0));// 
//         this.initItem();
//         this.initItemPos(0);
//         this.scrollView.node.on('scrolling', this.callback, this);
//         // log('tableView:' + this.testTime());
//     }
 
//     /**
//      * 
//      * - 1data
//      * @param itemData 
//      */
//     public updateList(itemData: Array<any>) {
//         this.itemData = itemData;
//         const old_count = this.itemArr.length;
//         for (let i = 0; i < old_count; i++) {
//             if (this.itemData[i]) {
//                 if (!this.itemArr[i]) {
//                     let y = 0;
//                     if (i > 0) {
//                         y = this.itemArr[i - 1].y - this.itemArr[i - 1].height - this.itemInterval;// 
//                     }
//                     let item_node = this.addItemNode(i, y);
//                     this.updateContentHeigh(this.itemArr[i].height - item_node.y);
//                 }
//                 let comp_script = this.itemArr[i].getComponent(this.scr_item[this.itemData[i].pfbType || 0]);
//                 comp_script && comp_script.setItemData(this.itemData[i], this);
//             } else {
//                 this.itemArr[i].destroy();
//                 this.itemArr[i] = null;
//             }
//         }
 
//     }
 
//     private initItemPos(index: number) {
//         let item_data_count = this.itemData.length;
//         for (let i = index; i < item_data_count; i++) {
//             let obj: any = {}
//             let y;
//             if (i === 0) {
//                 obj.startPos = 0;
//             } else {
//                 obj.startPos = this.itemPosMap.get(i - 1).endPos;
//             }
//             let j = this.itemData[i].pfbType || 0;
//             obj.endPos = obj.startPos + this.itemNode[j].height + this.itemInterval;
//             this.itemPosMap.set(i, obj);
//         }
//         if (item_data_count > 0) {
//             this.updateContentHeigh(this.itemPosMap.get(item_data_count - 1).endPos);
//         }
//     }
 
//     /**
//      * itemitem
//      */
//     private initItem() {
//         let j = 0;
//         for (let i = 0; i < this.itemData.length; i++) {
//             if (this.content.height > this.layerHeight) {
//                 j++
//                 if (j > 2) {
//                     break;
//                 }
//             }
//             let y = 0;
//             if (i > 0) {
//                 y = this.itemArr[i - 1].y - this.itemArr[i - 1].height - this.itemInterval;// 
//             }
//             let item_node = this.addItemNode(i, y);
//             this.updateContentHeigh(this.itemArr[i].height - item_node.y);
//         }
//     }
 
//     /**
//      * 
//      * @param i 
//      * @param y y
//      */
//     private addItemNode(i: number, y: number) {
//         let pfbType = this.itemData[i].pfbType || 0;
//         let item = instantiate(this.itemNode[pfbType]);
//         item.parent = this.content;
//         item.pfbType = pfbType;
//         item.index = i;
//         if (i === 0) {
//             item.y = 0;
//         } else {
//             item.y = y;
//         }
//         item.x = 0;
//         //item
//         let comp_script = item.getComponent(this.scr_item[pfbType]);
//         comp_script && comp_script.setItemData(this.itemData[i], this);
//         this.itemArr.push(item);
//         return item;
//         // log('itemNode' + i);
//     }
 
//     /**
//      * centent
//      * @param num  
//      */
//     private updateContentHeigh(num: number) {
//         this.content.height = num > this.layerHeight ? num : this.layerHeight;
//         // log(':', this.content.height);
//     }
 
//     /**
//      * 
//      * @param event 
//      * @param eventType 
//      * @returns 
//      */
//     private callback(event: string, args: any) {
//         // log(event && event.type || eventType)
//         if (this.content.height > this.layerHeight) {
//             let firstItemPos = this.scrollView.getScrollOffset().y;
//             let lastItemPos = firstItemPos + this.layerHeight;
//             if (firstItemPos < 0) return;
//             if (this.initItemData) {
//                 // log('111:%o', this.itemPosMap)
//                 this.initItemData = false;
//                 this.updateFirstItemIndex();
//                 this.itemCanMoveDown = true;
//                 this.updateLastItemIndex();
//                 this.itemCanMoveDown = false;
//             }
 
//             //.
//             //
//             if (firstItemPos > this.firstItemData.endPos) {
//                 if (this.lastItemIndex + 1 < this.itemData.length) {
//                     this.updateFirstItemIndex();
//                 }
//                 this.count++;
//             }
//             if (lastItemPos > this.lastItemData.endPos) {
//                 if (this.lastItemIndex + 1 < this.itemData.length) {
//                     this.itemCanMoveDown = true;
//                     this.updateLastItemIndex();
//                     this.itemCanMoveDown = false;
//                 }
//             }
//             //
//             if (lastItemPos < this.lastItemData.startPos) {
//                 this.updateLastItemIndex();
//                 this.count--;
//             }
//             if (firstItemPos < this.firstItemData.startPos) {
//                 this.itemCanMoveUp = true;
//                 this.updateFirstItemIndex();
//                 this.itemCanMoveUp = false;
//             }
 
//         }
 
//     }
 
//     private updateFirstItemIndex() {
//         let num = this.firstItemIndex;
//         if (this.itemCanMoveUp && num > this.getItemIndex()[0] && num > 0) {
//             this.itemMoveUp(this.firstItemIndex - 1);
//         }
//         this.updateItemIndex();
//     }
//     private updateLastItemIndex() {
//         let num = this.lastItemIndex;
//         if (this.itemCanMoveDown && num < this.getItemIndex()[1] && num + 1 < this.itemData.length) {
//             this.itemMoveDown(this.lastItemIndex + 1);
//         }
//         this.updateItemIndex();
//     }
 
//     private updateItemIndex() {
//         //log(this.firstItemIndex, this.lastItemIndex, this.itemArr, this.itemData)
//     }
 
//     /**
//      * itemNode,,
//      * @returns 
//      */
//     private getItemIndex() {
//         let firstItemPos = this.scrollView.getScrollOffset().y;
//         let lastItemPos = firstItemPos + this.layerHeight;
//         let arr = [];
//         this.itemPosMap.forEach((value, key) => {
//             let status1 = value.startPos <= firstItemPos && value.endPos > firstItemPos;
//             let status2 = value.startPos >= firstItemPos && value.endPos < lastItemPos;
//             let status3 = value.startPos <= lastItemPos && value.endPos > lastItemPos;
//             if (status1) {
//                 this.firstItemData.startPos = value.startPos;
//                 this.firstItemData.endPos = value.endPos;
//                 this.firstItemIndex = key;
//                 arr.push(key);
//             }
//             if (status3) {
//                 this.lastItemData.startPos = value.startPos;
//                 this.lastItemData.endPos = value.endPos;
//                 this.lastItemIndex = key;
//                 arr.push(key);
//             }
//         })
//         return arr;
//     }
 
//     /**
//      * 
//      * @param num 
//      * @returns 
//      */
//     private itemMoveUp(num: number) {
//         if (num < 0 || this.lastItemIndex + 1 < num || num + 1 > this.itemData.length) {
//             return;
//         }
//         if (!this.hasItem(num)) {
//             this.itemMove(num, -this.itemPosMap.get(num).startPos);
//         }
//         num++;
//         return this.itemMoveUp(num);
//     }
 
//     /**  */
//     public itemMoveDown(num: number) {
//         if (num < 0 || this.firstItemIndex - 1 > num || num + 1 > this.itemData.length) {
//             return;
//         }
//         if (!this.hasItem(num)) {
//             this.itemMove(num, -this.itemPosMap.get(num).startPos);
//         }
//         num--;
//         return this.itemMoveDown(num);
//     }
 
//     /**
//      * indexitemNode
//      * @param index 
//      * @returns 
//      */
//     private hasItem(index: number) {
//         for (let i = 0; i < this.itemArr.length; i++) {
//             if (this.itemArr[i].index === index) {
//                 return true;
//             }
//         }
//         return false;
//     }
 
//     /**
//      * 
//      * ,,itemArr,itemNode
//      * @param index 
//      * @param y 
//      * @returns 
//      */
//     private itemMove(index: number, y: number) {
//         for (let i = 0; i < this.itemArr.length; i++) {
//             //index-1,item.
//             let status1 = this.itemArr[i].index < this.firstItemIndex - 1 ? true : false;
//             let status2 = this.itemArr[i].index > this.lastItemIndex + 1 ? true : false;
//             let status3 = this.itemArr[i].pfbType === (this.itemData[index].pfbType || 0);
//             //log('item', this.firstItemIndex, this.lastItemIndex)
//             if (status1 && status3 || status2 && status3) {
//                 //log(i, index, this.itemArr, this.content.height);
//                 //item
//                 this.itemArr[i].index = index;
//                 this.itemArr[i].y = y;
//                 let comp_script = this.itemArr[i].getComponent(this.scr_item[this.itemArr[i].pfbType]);
//                 comp_script && comp_script.setItemData(this.itemData[index], this);
//                 return;
//             }
//         }
//         this.addItemNode(index, y);
//     }
 
//     /**
//      * 
//      * @param index index
//      */
//     public contentMoveByIndex(index: number) {
//         let pos_y = this.itemPosMap.get(index).startPos;
//         this.scrollView.scrollToOffset(new Vec2(this.content.x, pos_y), 0.5);
//     }
 
//     /**
//      * index
//      * 
//      * @param pos 
//      * @returns 
//      */
//     public getPosIndex(pos: Vec2) {
//         for (let [key, value] of this.itemPosMap.entries()) {
//             if (value.endPos > pos && value.startPos <= pos) {
//                 return key;
//             }
//         }
//     }
 
//     /**
//      * 
//      * @param obj 
//      * @returns 
//      */
//     public addItem(obj: any) {
//         this.itemData.push(obj);
//         this.initItemPos(this.itemData.length - 1);
//         let endPos = this.itemPosMap.get(this.itemData.length - 1).endPos;
//         if (endPos - this.layerHeight > 0) {
//             let startPos = endPos - this.layerHeight;
//             //firstItemIndex;
//             for (let i = this.itemData.length - 1; i >= 0; i--) {
//                 if (this.itemPosMap.get(i).endPos > startPos && this.itemPosMap.get(i).startPos <= startPos) {
//                     this.firstItemIndex = i;
//                 }
//             }
//             this.scrollView.scrollToBottom();
//             this.lastItemIndex = this.itemData.length - 1;
//             let num = this.firstItemIndex - 1 > 0 ? (this.firstItemIndex - 1) : 0;
//             this.itemMoveUp(num);
//             return true;
//         } else {
//             this.firstItemIndex = 0;
//             this.lastItemIndex = this.itemData.length - 1;
//             this.itemMoveUp(this.firstItemIndex);
//             return false;
//         }
 
//     }
 
//     /**
//      * 
//      */
//     public clearItem() {
//         this.itemData = [];
//         this.itemPosMap.clear();
//         this.scrollView.scrollToTop();
//         this.content.height = 0;
//         for (let i in this.itemArr) {
//             // this.itemArr[i].index = -1;
//             // this.itemArr[i].y = 3000;
//             this.itemArr[i].destroy();
//         }
//     }
 
//     /**
//      * 
//      * @param i .index
//      * @returns 
//      */
//     public deleteItem(i: number) {
//         this.itemData.splice(i, 1);
//         const item_data_count = this.itemData.length;
//         if (item_data_count <= 0) return;
//         this.initItemPos(item_data_count - 1);
 
//         //this.itemArr
//         for (let j = 0; j < this.itemArr.length; j++) {
//             if (this.itemArr[j].index === i) {
//                 this.itemArr[j].index = -1;
//                 this.itemArr[j].y = 3000;
//             }
//             if (this.itemArr[j].index > i) {
//                 let num = this.itemArr[j].index;
//                 this.itemArr[j].y = -this.itemPosMap.get(num - 1).startPos;
//                 this.itemArr[j].index = num - 1;
//             }
//         }
//         this.updateContentHeigh(this.itemPosMap.get(this.itemData.length - 1).endPos);
//         if (!this.lastItemIndex) this.getItemIndex();// 0.item
//         this.itemMoveUp(this.firstItemIndex);//
//     }
 
//     /**
//      * item
//      * @param index 
//      * @param item_data 
//      */
//     public resetItemData(index: number, item_data?: any) {
//         for (let i = 0; i < this.itemArr.length; i++) {
//             if (this.itemArr[i].index === index) {
//                 if (item_data) this.itemData[i] = item_data;
//                 let comp_script = this.itemArr[i].getComponent(this.scr_item[this.itemArr[i].pfbType]);
//                 comp_script && comp_script.setItemData(this.itemData[index], this);
//                 break;
//             }
//         }
//     }
 
//     private lastResetItemInfoHeight: any = null;
//     private lastResetItemIndex: any = null;
//     /**
//      * 
//      * @param index 
//      * @param infoHeight 
//      */
//     public resetItemSize(index: number, infoHeight: number) {
//         let func = (function (index, infoHeight) {
 
//             for (let i = 0; i < this.itemArr.length; i++) {
//                 if (this.itemArr[i].index > index) {
//                     this.itemArr[i].y -= infoHeight;
//                 }
//             }
 
//             for (let [key, value] of this.itemPosMap.entries()) {
//                 if (key === index) {
//                     value.endPos += infoHeight;
//                 }
//                 if (key > index) {
//                     value.endPos += infoHeight;
//                     value.startPos += infoHeight;
//                 }
//             }
//             this.lastResetItemInfoHeight = infoHeight;
//             this.lastResetItemIndex = index;
//         }).bind(this);
//         if (this.lastResetItemIndex !== null && this.lastResetItemInfoHeight) {
//             if (this.lastResetItemIndex === index) {
//                 func(this.lastResetItemIndex, -this.lastResetItemInfoHeight);
//                 this.lastResetItemIndex = null;
//                 this.lastResetItemInfoHeight = 0;
//             } else {
//                 func(this.lastResetItemIndex, -this.lastResetItemInfoHeight);
 
//                 func(index, infoHeight);
//             }
//         } else {
//             func(index, infoHeight);
//         }
//         this.itemMoveUp(this.firstItemIndex);
//         this.updateContentHeigh(this.itemPosMap.get(this.itemData.length - 1).endPos);
//     }
 
 
// }
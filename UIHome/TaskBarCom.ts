import { _decorator, Component, Node } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { UITaskItem } from './UITaskItem';
import { TaskSystem } from '../gameplay/Manager/TaskSystem';
import { instantiate } from 'cc';
import { Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TaskBarCom')
export class TaskBarCom extends CCComp {

    @property(Node)
    taskNode: Node = null!

    @property(Prefab)
    UITaskItem: Prefab = null!;

    @property(Array(UITaskItem)) 
    taskList: UITaskItem[] = [];

    mMaxTaskCount: number = 5;

    start() {
        //

    }

    refreshTasks(){

        this.taskClear();

        const taskDatas = TaskSystem.Instance.GetShowTaskList();
        for (let i = 0; i < taskDatas.length; i++) {
            const data = taskDatas[i];
            this.taskList[i].node.active = true;
            this.taskList[i].init(data.taskType, data.taskDes,data.targetVaule,  i + 1 >= taskDatas.length);
            this.taskList[i].showComplete(data.CheckComplete());
        }
    }
    reset(): void {
        
    }

    private taskClear() {
        for (let i = 0; i < this.mMaxTaskCount; i++) {
            this.taskList[i].node.active = false;
        }

        TaskSystem.Instance.ReSetTaskData(); // 

        //
    }
}



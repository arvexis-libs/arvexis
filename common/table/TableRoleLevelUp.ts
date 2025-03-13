
import { JsonUtil } from "../../../../../extensions/oops-plugin-framework/assets/core/utils/JsonUtil";

export class TableRoleLevelUp {
    static TableName: string = "RoleLevelUp";

    private data: any;

    init(id: number) {
        var table = JsonUtil.get(TableRoleLevelUp.TableName);
        this.data = table[id];
        this.id = id;
    }

    /** KEY */
    id: number = 0;

    /**  */
    get needexp(): number {
        return this.data.needexp;
    }
    /**  */
    get hp(): number {
        return this.data.hp;
    }
}
    
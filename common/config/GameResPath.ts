/*
 * @Author: dgflash
 * @Date: 2022-08-05 17:05:23
 * @LastEditors: dgflash
 * @LastEditTime: 2022-08-05 17:05:52
 */

/**  */
export class GameResPath {
    /**  */
    static getConfigPath(relative_path: string) {
        return "config/game/" + relative_path;
    }

    /**  */
    static getRolePath(name: string) {
        return `content/role/${name}`;
    }
}
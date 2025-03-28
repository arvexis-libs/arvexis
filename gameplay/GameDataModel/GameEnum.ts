export enum CharacterAttribute {
    None = 0,
    Strength,
    Endurance,
    Intelligence,
    Charisma,
    Appearance
}

export enum ItemEnum{
    None = 0,
    /**  */
    FinalcialClass = 10000000,   //
    /**  */
    Cash = 100001,       //
    /**  */
    Gem = 100002,
    /**  */
    Key = 100003,
    /**   */
    Biao = 10000002,        //  
    /**   */
    YuPei = 10000003,       //  
    /**  */
    ExpClass = 20000000,    //
    /**  1 */
    ExpPlayer1 = 20000002,  // 1
    /**  2 */
    ExpPlayer2 = 20000003,  // 2

    ExpEnd = 20000100,
}

export interface ICurrencyClass{
    name:string,
    currency: number[];
}

/**
 * 
 */
export enum EItemClass{
    XinWu = 1,      //
}

export const CurrencyShow = {
    [EItemClass.XinWu]: {
        name: "",
        currency: [ItemEnum.Biao, ItemEnum.YuPei]
    }
}
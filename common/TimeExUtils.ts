/**  */
export class TimeExUtil {
    
    /**
     * xxx   
     * @param timestamp 
     * @returns 
     */
    public static getTimeDescription(timestamp: number): string {
        if(timestamp <= 0) {
            console.error("getTimeDescription timestamp error:",timestamp);
            return "";
        }
        const now = Date.now();
        const diff = now - timestamp;
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
    
        if (diff < hour) {
            const minutes = Math.floor(diff / minute);
            return `${minutes} `;
        } else if (diff < day) {
            const hours = Math.floor(diff / hour);
            return `${hours} `;
        } else {
            const days = Math.floor(diff / day);
            return `${days} `;
        }
    }
        
}
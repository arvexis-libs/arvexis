import { UITransform } from 'cc';
import { _decorator, Component, Graphics, Color, Vec2, math } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('RadarChart')
@executeInEditMode
export class RadarChart extends Component {

    @property(Graphics)
    public graphics: Graphics | null = null;

    @property({ tooltip: "=11Grid" }) groupItemTotal: number = 1

    @property({tooltip: ""})
    public verticesCount: number = 5;

    @property({tooltip: "",})
    public maxValues: number[] = [100, 100, 100, 100, 100];

    @property({tooltip: ""})
    public minValues: number[] = [0, 0, 0, 0, 0];

    @property({

        tooltip: ","
    })
    public currentValues: number[] = [80, 90, 70, 60, 50];

    @property({

        tooltip: ""

    })
    public fillColor: Color = new Color(255, 0, 0, 128);

    @property({

        tooltip: ""

    })
    public lineColor: Color = new Color(255, 0, 0, 255);

    @property({

        tooltip: ""
    })
    public lineWidth: number = 2;

    @property({tooltip: ""})
    public maxRadiusRatio: number = 0.8;
    @property({tooltip: ""})
    isChagne: boolean = false;


    start() {
        if (!this.graphics) {
            this.graphics = this.node.addComponent(Graphics);
        }
        this.drawRadar();
    }

    update() {
        if(this.isChagne) {
            this.drawRadar();
        }
    }

    private drawRadar() {
        if (!this.graphics) return;

        // 
        if (this.maxValues.length !== this.verticesCount ||
            this.minValues.length !== this.verticesCount ||
            this.currentValues.length !== this.verticesCount) {
            console.error("Data array length mismatch with vertices count!");
            return;
        }

        this.graphics.clear();

        const uiTransform = this.node.getComponent(UITransform);
        let width = 0;
        let height = 0;
        if(uiTransform) {
            width = uiTransform.contentSize.width;
            height = uiTransform.contentSize.height;
        }
        // 
        const maxRadius = Math.min(width, height) * 0.5 * this.maxRadiusRatio;

        // 
        // this.drawBackground(maxRadius);

        // 
        this.graphics.fillColor = this.fillColor;
        this.graphics.strokeColor = this.lineColor;
        this.graphics.lineWidth = this.lineWidth;

        this.graphics.moveTo(0, 0);

        // 
        const points: Vec2[] = [];
        for (let i = 0; i < this.verticesCount; i++) {
            // 
            const startAngle = -Math.PI / 2; // 12
            const angleStep = (Math.PI * 2) / this.verticesCount;
            
            // 
            const angle = startAngle - angleStep * i; // 
            
            // 
            const ratio = math.clamp01(
                (this.currentValues[i] - this.minValues[i]) / 
                (this.maxValues[i] - this.minValues[i])
            );
            const radius = ratio * maxRadius;
            
            // Y
            points.push(new Vec2(
                radius * Math.cos(angle),
                -radius * Math.sin(angle) // YCocos
            ));
        }

        // 
        this.graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.graphics.lineTo(points[i].x, points[i].y);
        }
        this.graphics.lineTo(points[0].x, points[0].y); // 

        // 
        this.graphics.close();
        this.graphics.stroke();
        this.graphics.fill();
    }

    private drawBackground(maxRadius: number) {
        if (!this.graphics) return;

        // 
        this.graphics.strokeColor = new Color(200, 200, 200, 100);
        this.graphics.lineWidth = 1;
        
        for (let i = 0; i < this.verticesCount; i++) {
            const angle = (Math.PI * 2 * i) / this.verticesCount - Math.PI / 2;
            const x = maxRadius * Math.cos(angle);
            const y = maxRadius * Math.sin(angle);
            
            this.graphics.moveTo(0, 0);
            this.graphics.lineTo(x, y);
            this.graphics.stroke();
        }

        // 
        this.graphics.strokeColor = new Color(150, 150, 150, 200);
        this.graphics.lineWidth = 2;
        
        this.graphics.moveTo(maxRadius, 0);
        for (let i = 1; i <= this.verticesCount; i++) {
            const angle = (Math.PI * 2 * i) / this.verticesCount - Math.PI / 2;
            const x = maxRadius * Math.cos(angle);
            const y = maxRadius * Math.sin(angle);
            this.graphics.lineTo(x, y);
        }
        this.graphics.stroke();
    }

    // 
    public updateValues(newValues: number[]) {
        if (newValues.length !== this.verticesCount) {
            console.error("Invalid values length");
            return;
        }
        this.currentValues = newValues;
        this.drawRadar();
    }

    public updateDrawRadar(){
        this.drawRadar();
    }

    setOneVal(idx: number, value: number) {
        if(idx < 0 || idx >= this.currentValues.length) {
            return;
        }
        this.currentValues[idx] = value;
    }
    /**
     * 
     * @param idx 
     * @returns 
     */
    public getValue(idx: number) : number {
        if(idx < 0 || idx >= this.currentValues.length) {
            return 0;
        }
        return this.currentValues[idx];
    }
}
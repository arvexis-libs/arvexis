import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TextTypingEffect')
export class TextTypingEffect extends Component {
    @property(Label)
    textLabel: Label | null = null;

    @property({ type: String, tooltip: '' })
    fullText: string = '';

    @property({ type: Number, tooltip: '' })
    totalTime: number = 5;

    private currentIndex: number = 0;
    private timer: any = null;
    private interval: number = 0;

    start() {
        if (this.textLabel) {
            this.textLabel.string = '';
            this.calculateInterval();
            this.startTyping();
        }
    }

    calculateInterval() {
        if (this.fullText.length > 0) {
            this.interval = this.totalTime / this.fullText.length;
        }
    }

    startTyping() {
        this.timer = setInterval(() => {
            if (this.currentIndex < this.fullText.length) {
                this.textLabel!.string += this.fullText.charAt(this.currentIndex);
                this.currentIndex++;
            } else {
                clearInterval(this.timer);
            }
        }, this.interval * 1000);
    }

    stopTyping() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    onDestroy() {
        this.stopTyping();
    }
}    
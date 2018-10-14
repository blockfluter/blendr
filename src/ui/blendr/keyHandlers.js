import circleCursor from "./circlecursor";
import { softenAlpha } from "../../render/soften";
import { Brush, Alphaedit, Distort, Render } from "../../render/paint";
import brushParameters from "./brushparameters";
import { AlphaIndexFromRGB } from './alphaIndexFromRGB';
import Lerp from './lerp';

export default class KeyHandlers {
    constructor() {
        this.painter = null;
        this.context = null;
        this.imageData = null;
        this.softKey = null;
        this.alphaMap = null;
        this.theBrush = null;
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        this.modifyAlpha = this.modifyAlpha.bind(this);
        this.mapAlpha = this.mapAlpha.bind(this);
        this.useSoftAlpha = this.useSoftAlpha.bind(this);
        this.process = null;
        this.postProcess = null;
        this.targetValue = 1;
    }
    soften() {
        this.softKey = softenAlpha(this.imageData, 5);
    }

    applyAlpha() {
        const n = this.imageData.data.length;
        const d = this.imageData.data;
        for (var i = 0; i < n; i += 4) {
            d[i + 3] = this.alphaMap[
                AlphaIndexFromRGB(d[i + 0], d[i + 1], d[i + 2])
            ];
        }
        const context = this.canvas.getContext("2d");
        context.putImageData(
            this.imageData,
            0,
            0,
            0,
            0,
            this.imageData.width,
            this.imageData.height
        );
    }
    modifyAlpha(s, index, alpha) {
        s[index + 3] = Math.floor(
            Lerp(s[index + 3], this.targetValue, alpha) + Math.random()
        );
    }
    useSoftAlpha(s, index, alpha) {
        const ra = (255 - this.softKey[index >> 2]) / 255;
        s[index + 3] = Math.floor(
            Lerp(s[index + 3], 0, ra * alpha) + Math.random()
        );
    }
    mapAlpha(s, index, alpha) {
        var ai = AlphaIndexFromRGB(s[index + 0], s[index + 1], s[index + 2]);
        var v = Lerp(this.alphaMap[ai], this.targetValue, alpha);
        this.alphaMap[ai] = Math.floor(v + Math.random());
        s[index + 3] = v;
    }
    mouseMoveHandler(event) {
        if (this.painter === null) return false;

        Alphaedit(
            this.imageData,
            this.theBrush,
            event.offsetX,
            event.offsetY,
            this.process
        );

        const context = this.canvas.getContext("2d");
        const xx = event.offsetX - this.theBrush.size / 2;
        const yy = event.offsetY - this.theBrush.size / 2;
        context.putImageData(
            this.imageData,
            0,
            0,
            xx,
            yy,
            this.theBrush.size,
            this.theBrush.size
        );
    }
    mouseDownHandler(event) {
        this.painter = this.canvas;
    }
    mouseUpHandler(event) {
        this.painter = null;
        if (this.postProcess !== null) this.postProcess();
    }
    RemoveEventListener(container, canvas) {
        canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        canvas.removeEventListener("mousedown", this.mouseDownHandler);
        canvas.removeEventListener("mouseup", this.mouseUpHandler);
        canvas.style["pointer-events"] = "none";
    }

    Setup(container, canvas, imageData, mode, hard) {
        if (hard) {
            this.alphaMap = Array(Math.pow(2, 3 * 6)).fill(255);
            this.imageData = null;
        }
        const modeChange = this.mode !== mode;
        this.mode = mode;
        this.canvas = canvas;
        this.imageData = imageData;
        let armHandler = false;
        switch (mode) {
            case "alpha-":
                this.process = this.modifyAlpha;
                this.targetValue = 0;
                this.postProcess = null;
                armHandler = true;
                break;
            case "alpha+":
                this.process = this.modifyAlpha;
                this.targetValue = 255;
                this.postProcess = null;
                armHandler = true;
                break;
            case "key-":
                this.process = this.mapAlpha;
                this.targetValue = 0;
                this.postProcess = this.applyAlpha;
                armHandler = true;
                break;
            case "key+":
                this.process = this.mapAlpha;
                this.targetValue = 255;
                this.postProcess = this.applyAlpha;
                armHandler = true;
                break;
            case "feather":
                modeChange && this.soften();
                this.process = this.useSoftAlpha;
                this.targetValue = 255;
                this.postProcess = null;
                armHandler = true;
                break;
        }
        this.theBrush = new Brush(
            brushParameters[mode].s,
            brushParameters[mode].m
        );
        if (armHandler) {
            canvas.addEventListener("mousemove", this.mouseMoveHandler);
            canvas.addEventListener("mousedown", this.mouseDownHandler);
            canvas.addEventListener("mouseup", this.mouseUpHandler);
            canvas.style.cursor = circleCursor(this.theBrush.size);
            canvas.style["pointer-events"] = "all";
        }
    }
}

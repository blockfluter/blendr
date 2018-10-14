import circleCursor from "./circlecursor";
import { Brush, Alphaedit, Distort, Render } from "../../render/paint";
import { Point } from "../../render/point";
import dataMap from './datamap';
import brushParameters from "./brushparameters";

export default class DistortHandlers {
    constructor() {
        this.painter = null;
        this.context = null;
        this.theBrush = null;
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
    }
    mouseMoveHandler(event) {
        if (this.painter === null) return false;

        const xx = event.offsetX;
        const yy = event.offsetY;
        const vector = new Point(
            event.offsetX - this.org.x,
            event.offsetY - this.org.y
        );
        const hb = new Point(
            xx - this.theBrush.size / 2,
            yy - this.theBrush.size / 2
        );
        const imageDataDst = dataMap.get(this.canvas.id, "imageDataDst");
        const imageDataSrc = dataMap.get(this.canvas.id, "imageDataSrc");
        const distortionX = dataMap.get(this.canvas.id, "distortionX");
        const distortionY = dataMap.get(this.canvas.id, "distortionY");

        Distort(
            imageDataSrc.width,
            imageDataSrc.height,
            this.theBrush,
            distortionX,
            distortionY,
            this.org,
            vector,
            this.mode
        );
        Render(
            imageDataDst,
            imageDataSrc,
            distortionX,
            distortionY,
            hb,
            new Point(this.theBrush.size, this.theBrush.size)
        );

        this.org = new Point(xx, yy);
        const context = this.canvas.getContext("2d");
        context.putImageData(
            imageDataDst,
            0,
            0,
            hb.x,
            hb.y,
            this.theBrush.size,
            this.theBrush.size
        );
    }
    mouseDownHandler(event) {
        const xx = event.offsetX;
        const yy = event.offsetY;
        this.org = new Point(xx, yy);
        this.painter = this.canvas;
    }
    mouseUpHandler(event) {
        this.painter = null;
        const imageDataDst = dataMap.get(this.canvas.id, "imageDataDst");
        const imageDataSrc = dataMap.get(this.canvas.id, "imageDataSrc");
        const distortionX = dataMap.get(this.canvas.id, "distortionX");
        const distortionY = dataMap.get(this.canvas.id, "distortionY");

        Render(
            imageDataDst,
            imageDataSrc,
            distortionX,
            distortionY,
            null,
            null
        );
        const context = this.canvas.getContext("2d");
        context.putImageData(imageDataDst, 0, 0);
    }
    RemoveEventListener(container, canvas) {
        canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        canvas.removeEventListener("mousedown", this.mouseDownHandler);
        canvas.removeEventListener("mouseup", this.mouseUpHandler);
        canvas.style["pointer-events"] = "none";
    }

    Setup(container, canvas, imageDataSrc, mode, hard) {
        if (hard) {
            dataMap.set(
                canvas.id,
                "distortionX",
                Array(imageDataSrc.width * imageDataSrc.height).fill(0)
            );
            dataMap.set(
                canvas.id,
                "distortionY",
                Array(imageDataSrc.width * imageDataSrc.height).fill(0)
            );
            dataMap.set(
                canvas.id,
                "imageDataDst",
                new ImageData(imageDataSrc.width, imageDataSrc.height)
            );
        }
        this.mode = mode;
        this.canvas = canvas;

        let armHandler = false;
        switch (mode) {
            case "normal":
                this.postProcess = null;
                armHandler = true;
                break;
            case "push":
                armHandler = true;
                break;
            case "grow":
                armHandler = true;
                break;
            case "shrink":
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

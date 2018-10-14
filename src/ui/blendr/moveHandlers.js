export default class MoveHandlers {
	constructor() {
	    this.mover = null;
	    this.offsetX = 0;
	    this.offsetY = 0;
	    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
	    this.mouseDownHandler = this.mouseDownHandler.bind(this);
	    this.mouseUpHandler = this.mouseUpHandler.bind(this);
	}
	mouseMoveHandler(event) {
	    if (this.mover === null) return false;
	    this.mover.style.transform = `translate(${event.pageX -
		  this.offsetX}px, ${event.pageY - this.offsetY}px)`;
	}
	mouseDownHandler(event) {
	    this.mover = this.canvas;
	    let rect = this.canvas.parentElement.getBoundingClientRect();
	    this.offsetX = event.offsetX + rect.left;
	    this.offsetY = event.offsetY + rect.top;
	}
	mouseUpHandler(event) {
	    this.mover = null;
	}
	RemoveEventListener(container, canvas) {
	    canvas.removeEventListener("mousemove", this.mouseMoveHandler);
	    canvas.removeEventListener("mousedown", this.mouseDownHandler);
	    canvas.removeEventListener("mouseup", this.mouseUpHandler);
	    canvas.style["pointer-events"] = "none";
	}
	Setup(container, canvas, imageData, mode) {
	    this.canvas = canvas;
	    this.container = container;
	    if (mode === "move") {
		  canvas.addEventListener("mousemove", this.mouseMoveHandler);
		  canvas.addEventListener("mousedown", this.mouseDownHandler);
		  canvas.addEventListener("mouseup", this.mouseUpHandler);
		  canvas.style.cursor = "move";
		  canvas.style["pointer-events"] = "all";
	    }
	}
  }
  
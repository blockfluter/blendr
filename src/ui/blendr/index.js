import React from "react";
import styles from "../../style/styles.scss";
import classnames from "classnames";
import InputPanel from "../components/inputpanel";
import Crop from "../components/crop";
import { softenAlpha } from "../../render/soften";
import { Brush, Alphaedit, Distort, Render } from "../../render/paint";
import { Point } from "../../render/point";
import jQuery from "jquery";
import dataMap from "./datamap";
import brushParameters from "./brushparameters";
import circleCursor from "./circlecursor";
import Lerp from './lerp';
import { AlphaIndexFromRGB } from './alphaIndexFromRGB';
import MoveHandlers from './moveHandlers';
import KeyHandlers from './keyHandlers';
import DistortHandlers from './distortHandlers';
import installCutout from './installCutout';
import DropTarget from '../components/dropTarget'
import saveCanvas from './saveCanvas'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.keyHandlers = new KeyHandlers();
        this.distortHandlers = new DistortHandlers();
        this.moveHandlers = new MoveHandlers();
        this.setImageUrl = this.setImageUrl.bind(this);
        this.allowFilefetch = this.allowFilefetch.bind(this);
        this.allowFiledrop = this.allowFiledrop.bind(this);
        this.cancelFiledrop = this.cancelFiledrop.bind(this);
        this.loadFile = this.loadFile.bind(this);
        this.keyboardListener = this.keyboardListener.bind(this);
        this.saveCutout = this.saveCutout.bind(this);
        this.reRender = this.reRender.bind(this);
        this._handleCancel = this._handleCancel.bind(this);
        this.state = {
            mode: "move",
            brushsize: 1,
            overlay: 0,
            xparstyle: false,
            toolGroup: 1,
            crop: {
                top: 200,
                left: 300,
                width: 250,
                height: 150
            },
            filename: "saved.png",
            imageUrl: "http://randallwiggins.com/images/sample.jpg",
            scale: "1"
        };
        this.selectionIndex = 0;
        jQuery(document).bind("drop dragover", e => {
            e.preventDefault();
        });
        window.addEventListener("beforeunload",  e => {
          var confirmationMessage = "\o/";
        
          e.returnValue = "Unsaved work will be lost";     // Gecko, Trident, Chrome 34+
          return confirmationMessage;              // Gecko, WebKit, Chrome <34
        });
    }
    reRender(toolGroup) {
        const canvases = Array.from(
            this.container.getElementsByTagName("canvas")
        );
        canvases.forEach(c => {
            const context = c.getContext("2d");
            const imageDataDst = dataMap.get(c.id, "imageDataDst");
            const imageDataSrc = dataMap.get(c.id, "imageDataSrc");
            const distortionX = dataMap.get(c.id, "distortionX");
            const distortionY = dataMap.get(c.id, "distortionY");
            if (toolGroup && imageDataDst) {
                Render(
                    imageDataDst,
                    imageDataSrc,
                    distortionX,
                    distortionY,
                    null,
                    null
                );
                context.putImageData(imageDataDst, 0, 0);
            } else {
                context.putImageData(imageDataSrc, 0, 0);
            }
        });
    }
    updateMode(mode, hard) {
        console.log("updateMode", this.state.toolGroup, mode, hard);
        const canvases = Array.from(
            this.container.getElementsByTagName("canvas")
        );
        canvases.forEach(c => {
            this.moveHandlers.RemoveEventListener(this.container, c);
            this.keyHandlers.RemoveEventListener(this.container, c);
            this.distortHandlers.RemoveEventListener(this.container, c);
        });

        const canvas = canvases[this.selectionIndex];
        if (canvas) {
            const imageData = dataMap.get(canvas.id, "imageDataSrc");

            this.moveHandlers.Setup(
                this.container,
                canvas,
                imageData,
                mode,
                hard
            );
            this.keyHandlers.Setup(
                this.container,
                canvas,
                imageData,
                mode,
                hard
            );
            this.distortHandlers.Setup(
                this.container,
                canvas,
                imageData,
                mode,
                hard
            );
            this.setState({
                mode
            });
        }
    }
    keyboardListener(event) {
        const modeCmd = this.props.tools[this.state.toolGroup].tools.filter(
            item => {
                return item.shortcut === event.key;
            }
        );
        if (modeCmd.length) {
            this.updateMode(modeCmd[0].id, false);
        } else if (!jQuery(":focus")[0]) {
            const canvases = Array.from(
                this.container.getElementsByTagName("canvas")
            );
            const d = canvases.length;
            switch (event.key) {
                case "f":
                    this.setState({ fullScreen: !this.state.fullScreen });
                    break;
                case "a":
                    this.setState(
                        {
                            toolGroup: 1 - this.state.toolGroup
                        },
                        () => {
                            this.updateMode(
                                this.props.tools[this.state.toolGroup].tools[0]
                                    .id,
                                false
                            );
                            this.reRender(this.state.toolGroup);
                        }
                    );
                    break;
                case "q":
                    brushParameters[this.state.mode].s = Math.max(
                        brushParameters[this.state.mode].s - 10,
                        10
                    );
                    break;
                case "w":
                    brushParameters[this.state.mode].s = Math.min(
                        brushParameters[this.state.mode].s + 10,
                        500
                    );
                    break;
                case "Backspace":
                    jQuery("canvas", this.container)[
                        this.selectionIndex
                    ].remove();
                    this.selectionIndex =
                        jQuery("canvas", this.container).length - 1;
                    this.reRender(this.state.toolGroup);
                    break;
                case "z":
                    this.setState({
                        xparstyle: !this.state.xparstyle
                    });
                    break;
                case "ArrowUp":
                    jQuery("canvas", this.container).remove();
                    const ele1 = canvases[this.selectionIndex];
                    const ele2 = canvases[this.selectionIndex + 1];
                    if (ele2) {
                        canvases[this.selectionIndex + 1] = ele1;
                        canvases[this.selectionIndex] = ele2;
                        this.selectionIndex = this.selectionIndex + 1;
                    }
                    canvases.forEach(ele => {
                        this.container.appendChild(ele);
                    });
                    break;
                case "ArrowDown":
                    jQuery("canvas", this.container).remove();
                    const dele1 = canvases[this.selectionIndex];
                    const dele2 = canvases[this.selectionIndex - 1];
                    if (dele2) {
                        canvases[this.selectionIndex - 1] = dele1;
                        canvases[this.selectionIndex] = dele2;
                        this.selectionIndex = this.selectionIndex - 1;
                    }
                    canvases.forEach(ele => {
                        this.container.appendChild(ele);
                    });

                    break;

                case "ArrowRight":
                    this.selectionIndex = ++this.selectionIndex % d;
                    break;
                case "ArrowLeft":
                    this.selectionIndex = (--this.selectionIndex + d) % d;
                    break;
            }
            this.updateMode(this.state.mode, false);
        }
    }
    changePage(event, page) {
        this.removeMenu(event);
        this.setState(
            {
                toolGroup: page,
                mode: "move"
            },
            () => {
                this.reRender(this.state.toolGroup);
                this.updateMode(this.state.mode, false);
            }
        );
    }
    removeMenu(event) {
        const node = event.target.parentElement.parentElement;
        node.style.display = "none";
        setTimeout(() => {
            node.style.display = "";
        }, 300);
    }
    clickHandler(event, mode) {
        this.removeMenu(event);
        this.updateMode(mode, false);
    }
    componentDidMount() {
        document.addEventListener("keyup", this.keyboardListener);
    }
    makeImage(canvas) {
        this.container.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        dataMap.set(
            canvas.id,
            "imageDataSrc",
            ctx.getImageData(0, 0, canvas.width, canvas.height)
        );
        this.selectionIndex =
            Array.from(this.container.getElementsByTagName("canvas")).length -
            1;
    }
    setImageUrl(url) {
        installCutout(
            `../services/proxy.php?url=${url}`,
            this.state.scale,
            canvas => {
                this.makeImage(canvas);
                this.updateMode("move", true);
                this.setState({
                    overlay: 0,
                    imageUrl: url
                });
            }
        );
    }

    loadFile(result) {
        installCutout(result, this.state.scale, canvas => {
            this.makeImage(canvas);
            this.updateMode("move", true);
            this.setState({
                overlay: 0
            });
        });
    }

    saveCutout(event) {
        this.removeMenu(event);
        this.setState({
            overlay: 2
        });
        // const canvas = jQuery('canvas', this.container)[this.selectionIndex];
        // saveCanvas(canvas, 'cutout');
    }
    allowFilefetch(event) {
        this.removeMenu(event);
        this.setState({
            overlay: 3
        });
    }
    allowFiledrop(event) {
        this.removeMenu(event);
        this.setState({
            overlay: 1
        });
    }
    cancelFiledrop() {
        this.setState({
            overlay: 0
        });
    }
    _handleCancel(evt) {
        this.setState({
            overlay: 0
        });
    }
    _handleSave() {
        const canvas = document.createElement("canvas");
        canvas.width = this.state.crop.width;
        canvas.height = this.state.crop.height;
        const saveContext = canvas.getContext("2d");
        const canvases = Array.from(
            this.container.getElementsByTagName("canvas")
        );

        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = this.state.crop.width;
        offscreenCanvas.height = this.state.crop.height;
        const offscreenContext = offscreenCanvas.getContext("2d");

        canvases.forEach(c => {
            const context = c.getContext("2d");
            const imageDataDst = dataMap.get(c.id, "imageDataDst");
            const imageDataSrc = dataMap.get(c.id, "imageDataSrc");
            const distortionX = dataMap.get(c.id, "distortionX");
            const distortionY = dataMap.get(c.id, "distortionY");
            const prect = c.parentElement.getBoundingClientRect();
            const rect = c.getBoundingClientRect();
            const uly = rect.top - prect.top;
            const ulx = rect.left - prect.left;
            offscreenContext.clearRect(
                0,
                0,
                offscreenCanvas.width,
                offscreenCanvas.height
            );
            if (this.state.toolGroup && imageDataDst) {
                Render(
                    imageDataDst,
                    imageDataSrc,
                    distortionX,
                    distortionY,
                    null,
                    null
                );
                offscreenContext.putImageData(
                    imageDataDst,
                    ulx - this.state.crop.left,
                    uly - this.state.crop.top
                );
            } else {
                offscreenContext.putImageData(
                    imageDataSrc,
                    ulx - this.state.crop.left,
                    uly - this.state.crop.top
                );
            }
            saveContext.drawImage(offscreenCanvas, 0, 0);
        });
        saveCanvas(canvas, this.state.filename);
        this.setState({
            overlay: 0
        });
    }

    _handleFilenameChange(evt) {
        this.setState({
            filename: evt.target.value
        });
    }
    _updateCropWindow(crop) {
        this.setState({
            crop
        });
    }
    _currentModeName() {
        let m = this.props.tools[this.state.toolGroup].tools.filter(item => {
            return item.id === this.state.mode;
        });
        return m && m[0] ? m[0].label : "";
    }
    _brushSize() {
        return brushParameters[this.state.mode].s
            ? brushParameters[this.state.mode].s
            : "";
    }
    _toolReport() {
        return this._currentModeName() + " " + this._brushSize();
    }
    render() {
        const canvasCount = this.container
            ? this.container.getElementsByTagName("canvas").length
            : 0;
        const buttonActions = this.props.tools[this.state.toolGroup].tools.map(
            (item, index) => {
                return (
                    <li
                        key={index}
                        onClick={event => this.clickHandler(event, item.id)}>
                        <a
                            key={`b${index}`}
                            className={classnames(
                                {
                                    ["disabled"]: canvasCount === 0,
                                    [styles.selected]:
                                        item.id === this.state.mode
                                },
                                styles.margin
                            )}>
                            {item.label}
                        </a>
                    </li>
                );
            }
        );
        const fileActions = (
            <ul>
                <li onClick={this.allowFiledrop}>
                    <a> Load Local Image</a>
                </li>
                <li onClick={this.allowFilefetch}>
                    <a> Load URL </a>
                </li>
                <li onClick={this.saveCutout}>
                    <a> Save </a>
                </li>
            </ul>
        );
        const overlays = [
            <div
                key="o1"
                ref={container => {
                    this.container = container;
                }}
                className={classnames(
                    styles.container,
                    this.state.xparstyle ? styles.solid : styles.checks
                )}>
                {this.state.overlay === 2 && (
                    <Crop
                        key="o3"
                        {...this.props}
                        updateCropWindow={this._updateCropWindow.bind(this)}
                        crop={this.state.crop}
                        saveWindow={this._handleSave.bind(this)}
                    />
                )}
                <DropTarget
                    key="o2"
                    scale={this.state.scale}
                    setScale={scale => {
                        this.setState({ scale });
                    }}
                    visible={this.state.overlay === 1}
                    loadFile={this.loadFile}
                    cancel={this.cancelFiledrop}
                />
            </div>
        ];

        const pages = () => {
            const items = this.props.tools.map((item, index) => {
                return (
                    <li
                        key={index}
                        onClick={event => {
                            this.changePage(event, index);
                        }}>
                        <a key={`k${index}`}>{item.label}</a>
                    </li>
                );
            });
            return <ul> {items} </ul>;
        };
        let menu = null;
        switch (this.state.overlay) {
            default:
                break;
            case 2:
                menu = (
                    <div>
                        <div className={styles.menubar}>
                            <input
                                type="text"
                                onChange={this._handleFilenameChange.bind(this)}
                                value={this.state.filename}
                            />
                            <a onClick={this._handleSave.bind(this)}>Save</a>
                            <a onClick={this._handleCancel.bind(this)}>
                                Cancel
                            </a>
                        </div>
                    </div>
                );
                break;
            case 3:
                menu = (
                    <div className={styles.menubar}>
                        <InputPanel
                            scale={this.state.scale}
                            setScale={scale => {
                                this.setState({ scale });
                            }}
                            cancel={this._handleCancel}
                            setImageUrl={this.setImageUrl}
                            imageUrl={this.state.imageUrl}
                        />
                    </div>
                );
                break;
            case 0:
                menu = (
                    <div className={styles.navWrapper}>
                        <span>
                            <nav>
                                <ul>
                                    <li>bl?endR</li>
                                    <li className={styles.dropmenu}>
                                        File {fileActions}
                                    </li>
                                    <li
                                        className={classnames(
                                            {
                                                [styles.hidden]:
                                                    canvasCount === 0
                                            },
                                            styles.dropmenu
                                        )}>
                                        {
                                            this.props.tools[
                                                this.state.toolGroup
                                            ].label
                                        }
                                        {pages()}
                                    </li>
                                    <li
                                        className={classnames(
                                            {
                                                [styles.hidden]:
                                                    canvasCount === 0
                                            },
                                            styles.dropmenu
                                        )}>
                                        {this._toolReport() + "..."}
                                        <ul> {buttonActions} </ul>
                                    </li>
                                </ul>
                            </nav>
                        </span>
                    </div>
                );
        }
        return (
            <div
                className={classnames(styles.wrapper, {
                    [styles.fullscreen]: this.state.fullScreen
                })}>
                {menu}
                {overlays.map(item => {
                    return item;
                })}
            </div>
        );
    }
}


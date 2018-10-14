import React from "react";
import classnames from "classnames";
import styles from "../../../style/styles.scss";

export default class DropTarget extends React.Component {
    constructor() {
        super();
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleFileSelect = this.handleFileSelect.bind(this);
    }
    handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = event.target.files;
        if (!files) files = evt.dataTransfer.files; // FileList object.
        const self = this;
        if (files[0]) {
            var reader = new FileReader();

            reader.onload = theFile => {
                self.props.loadFile(reader.result);
            };
            reader.readAsDataURL(files[0]);
        }
    }

    handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
    }

    componentDidMount() {
        this.dropTarget.addEventListener(
            "dragover",
            this.handleDragOver,
            false
        );
        this.dropTarget.addEventListener("drop", this.handleFileSelect, false);
        this.fileInput.addEventListener("change", this.handleFileSelect, false);
    }
    render() {
        return (
            <div
                className={classnames(styles.fs, {
                    [styles.hidden]: !this.props.visible
                })}>
                <div
                    ref={e => (this.dropTarget = e)}
                    className={classnames(styles.dropTarget, styles.centered)}>
                    Drop Image
                </div>

                <div className={classnames(styles.centered)}>
                    <a className={styles.button} onClick={this.props.cancel}>
                        Cancel
                    </a>
                    <label className={styles.button} htmlFor="file">
                        Add Image
                    </label>
                    <input
                        ref={e => (this.fileInput = e)}
                        type="file"
                        id="file"
                        name="file"
                    />
                    <label>
                        Scale{" "}
                        <input
                            style={{ width: "5em" }}
                            value={this.props.scale}
                            onChange={e => this.props.setScale(e.target.value)}
                        />
                    </label>
                </div>
            </div>
        );
    }
}

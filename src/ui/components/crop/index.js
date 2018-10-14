import React from 'react';
import classnames from 'classnames';
import styles from './control.scss';

const LEFTBIT = 1 << 1;
const TOPBIT = 1 << 2;
const RIGHTBIT = 1 << 3;
const BOTTOMBIT = 1 << 4;

export default class extends React.Component {
    constructor() {
        super();
        this.state = {
            capture: false,
            mask: 0,
            filename: ''
        }
    }
    componentWillMount(props) {
        this.setState({ filename: this.props.savedFilename, crop:this.props.crop });
    }
    _handleMouseDown(evt) {
        var mask = 0;

        if (!evt.target.className.match(styles.crop)) {
            const x = evt.nativeEvent.offsetX;
            const y = evt.nativeEvent.offsetY;

            if (x < this.props.crop.left)
                mask |= LEFTBIT;
            if (y < this.props.crop.top)
                mask |= TOPBIT;
            if (x > this.props.crop.left + this.props.crop.width)
                mask |= RIGHTBIT;
            if (y > this.props.crop.top + this.props.crop.height)
                mask |= BOTTOMBIT;
        }
        this.setState({ capture: true, mask })
    }
    _handleMouseMove(evt) {
        if (this.state.capture) {
            let left = this.state.mask & LEFTBIT
                ? this.state.crop.left + evt.nativeEvent.movementX : this.state.crop.left;
            const width = this.state.mask & RIGHTBIT
                ? this.state.crop.width + evt.nativeEvent.movementX : this.state.crop.width;
            let top = this.state.mask & TOPBIT
                ? this.state.crop.top + evt.nativeEvent.movementY : this.state.crop.top;
            const height = this.state.mask & BOTTOMBIT
                ? this.state.crop.height + evt.nativeEvent.movementY : this.state.crop.height;

            const addWidth = this.state.mask & LEFTBIT
                ? -evt.nativeEvent.movementX : 0;
            const addHeight = this.state.mask & TOPBIT
                ? -evt.nativeEvent.movementY : 0;
            if (!this.state.mask) {
                top = this.state.crop.top + evt.nativeEvent.movementY;
                left = this.state.crop.left + evt.nativeEvent.movementX;
            }
            this.setState({
                crop: {
                    width: width + addWidth,
                    height: height + addHeight,
                    top,
                    left
                }
            });
        }
    }
    _handleMouseUp(evt) {
        this.setState({ capture: false });
        this.props.updateCropWindow(this.state.crop);
    }
    render() {
        return (
            <div
                onMouseDown={this._handleMouseDown.bind(this)}
                onMouseMove={this._handleMouseMove.bind(this)}
                onMouseUp={this._handleMouseUp.bind(this)}
                className={styles.mask}>

                <div className={styles.crop} style={{
                    left: this.state.crop.left + 'px',
                    top: this.state.crop.top + 'px',
                    width: this.state.crop.width + 'px',
                    height: this.state.crop.height + 'px'
                }} />
            </div>);
    }
}

/*
    <div>
                <div className={classnames('menu', styles.formwindow)}>
                    <input type="text" onChange={this._handleFilenameChange.bind(this)} value={this.state.filename} />
                    <input className={styles.number} type="text" disabled="disabled" value={this.props.crop.width} />
                    <input className={styles.number} type="text" disabled="disabled" value={this.props.crop.height} />
                    <button className="button secondary" onClick={this._handleCancel.bind(this)}>Cancel</button>
                    <button className="button primary" onClick={this._handleSave.bind(this)}>Save</button>
                </div>
        */
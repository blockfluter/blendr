import React from "react";
import classnames from "classnames";
import styles from "./control.scss";

export default class extends React.Component {
    constructor() {
        super();
    }
    componentDidMount() {
        this.textInput.value = this.props.imageUrl;
    }
    submit(event) {
        this.props.setImageUrl(this.textInput.value);
    }
    render() {
        return (
            <span className={styles.panel}>
                <input
                    ref={input => {
                        this.textInput = input;
                    }}
                    type="search"
                    placeholder="Image URL"
                />
                <label>Scale{' '}<input
                    onChange={e => {
                        this.props.setScale(e.target.value);
                    }}
                    value={this.props.scale}
                    style={{ width: "5em" }}
                    size="8"
                /></label>
                <a onClick={this.submit.bind(this)}>Load URL</a>
                <a onClick={this.props.cancel}>Cancel</a>
            </span>
        );
    }
}

/*
<div className={styles.frame}> 
                <input
                    onKeyDown={this.keyDown.bind(this)}
                    onKeyUp={this.keyUp.bind(this)}
                    onKeyPress={this.submit.bind(this)}
                    onChange={this.inputValueChange.bind(this)}
                    value={this.state.inputValue} />
            </div>    
*/

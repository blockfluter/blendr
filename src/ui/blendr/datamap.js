class DataMap {
    constructor() {
        this.hash = {};
    }
    set(cid, token, value) {
        if (undefined === this.hash[cid]) {
            this.hash[cid] = {};
        }
        this.hash[cid][token] = value;
    }
    get(cid, token) {
        let value = null;
        if (this.hash[cid] && this.hash[cid]) {
            value = this.hash[cid][token];
        }
        return value;
    }
}
export default new DataMap();


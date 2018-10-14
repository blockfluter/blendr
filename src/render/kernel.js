export class Kernel {
	constructor(radius) {
		this.radius = radius;
		this.m = [];
		this.d = 2 * radius + 1;
		for (let i = 0; i < 256; ++i) {
			this.m[i] = i / this.d;
		}
		this.a = [];
		this.v = 0;
	}
	push(n) {
		let result = undefined;
		if (this.a.length === this.d) {
			result = Math.floor(this.v);
			this.v -= this.a.shift();
		}
		const v = Math.floor(this.m[n]);
		this.v += v;
		this.a.push(v);
		return result;
	}
}

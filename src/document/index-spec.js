import { Kernel } from '.';

/*global expect*/
describe('Kernel', () => {

	it('should return undefined until FIFO is full ', () => {
		let radius = 3;
		let kernel = new Kernel(radius);
		let w = 2 * radius + 1;

		for (let i = 0; i < w; ++i) {
			let sum = kernel.push(0);
			expect(sum).toBeUndefined();
		}
		expect(kernel.push(0)).toBeDefined();
	});
	it('output should match consistent inputs', () => {
		let radius = 3;
		let kernel = new Kernel(radius);
		for (let i = 0; i < 1000; ++i) {
			kernel.push(255);
		}
		expect(kernel.push(255)).toBe(255);
	});
	it('output should increase if input increases', () => {
		let radius = 11;
		let kernel = new Kernel(radius);
		for (let i = 0; i < 100; ++i) {
			kernel.push(0);
		}
		kernel.push(255);
		expect(kernel.push(255)).toBeGreaterThan(0);
	});

});
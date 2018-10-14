import { Kernel } from './kernel';

export function softenAlpha(imageData, radius) {
	if (!radius)
		return imageData;
	const alpha = extractAlpha(imageData);
	const halpha = softenAlphaH(alpha, imageData.width, imageData.height, radius);
	return softenAlphaV(halpha, imageData.width, imageData.height, radius);
}

function extractAlpha(imageData) {
	return imageData.data.filter((p, i) => {
		return i % 4 === 3;
	})
}

function putAlpha(imageData, dst) {
	const total = imageData.width * imageData.height;
	let j = 3;
	for (let i = 0; i < total; ++i) {
		imageData.data[j] = dst[i];
		j += 4;
	}
	return imageData;
}

function softenAlphaV(a, width, height, radius) {
	for (let x = 0; x < width; ++x) {
		let k = new Kernel(radius);
		var si = x;

		for (let i= 0; i < radius; ++i){
			k.push(a[si]);
		}
		for (let i= 0; i < radius; ++i){
			k.push(a[si]);
			si += width;
		}
		let di = x;
		for (let i = 0; i < height; ++i) {
			a[di] = k.push(a[si]);
			si += width;
			di += width;
		}
	}
	return a;
}

function softenAlphaH(a, width, height, radius) {
	for (let y = 0; y < height; ++y) {
		let k = new Kernel(radius);
		var si = y*width;

		for (let i= 0; i < radius; ++i){
			k.push(a[si]);
		}
		for (let i= 0; i < radius; ++i){
			k.push(a[si]);
			si++;
		}
		let di = y*width;
		for (let i = 0; i < width; ++i) {
			a[di] = k.push(a[si]);
			si++;
			di++;
		}
	}
	return a;
}

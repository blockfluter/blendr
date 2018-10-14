
import { renderCutout } from './save-image';
export function loadCutouts() {
	const ret = localStorage.getItem('cutouts');
	return ret ? JSON.parse(ret) : [];
}

export function saveCutouts(props) {
	const a = props.cutouts.map(cutout => {
		return { url: cutout.img.src, transform: cutout.transform };
	});
	localStorage.setItem('cutouts', JSON.stringify(a));
}

export function currentEditCutout(props) {
	return props.cutouts.filter((c) => {
		return c.cutoutId === props.activeIndex;
	})[0];
}

export function circleCursor(tool, diameter) {
	if (tool.match(/^move$/))
		return 'move';	
	if (tool.match(/^size$/))
		return 'pointer';	
	const radius = diameter / 2;
	const canvas = document.createElement('canvas');
	canvas.width = diameter;
	canvas.height = diameter;
	const context = canvas.getContext('2d');
	context.beginPath();
	context.arc(radius, radius, radius, 0, 2 * Math.PI, true);
	context.closePath();
	context.fillStyle = 'rgba(255,255,230,.5)'
	context.fill();
	return `url(${canvas.toDataURL('image/png')}) ${radius} ${radius}, auto`;
}



let cutoutId = 0;

const margin = 80, margin2 = margin * 2;

export function imageToPixelArray(img, scale) {
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(img.width * scale) + margin2;
	canvas.height = Math.round(img.height * scale) + margin2;
	const context = canvas.getContext('2d');
//	console.log(img, scale);
	context.drawImage(img, margin, margin, canvas.width - margin2, canvas.height - margin2);
	const result = context.getImageData(0, 0, canvas.width, canvas.height);

	return result;
}
export function makeCutoutTransform(url) {
	return { url, transform: { x: 0, y: 0, scale: 1 } };
}

export function rescaleCutout(cutout, factor) {
	++cutoutId;
	const desiredWidth = Math.round(cutout.pa.width * factor);
	const scale = desiredWidth / (cutout.img.width+margin2);
	//console.log(factor, cutout.pa.width, cutout.img.width, desiredWidth, scale);
	const pa = imageToPixelArray(cutout.img, scale);
	const result = { ...cutout,
		pa,
		dst: imageToPixelArray(cutout.img, scale),
		distortionx: new Array(pa.width * pa.height).fill(0),
		distortiony: new Array(pa.width * pa.height).fill(0),
		cutoutId
	};
//	console.log(result, pa);
	return result;  
}

export function replaceCutout(cutout) {
//	console.log(cutout);
	++cutoutId;
	return { ...renderCutout(cutout), cutoutId };
}

export function makeCutout(cutout, index) {
	++cutoutId;
	const nextId = (typeof index === 'undefined') ? cutoutId : index;
	const pa = imageToPixelArray(cutout.img, cutout.transform.scale);
	('makecutout');
	const result = {
		pa,
		dst: imageToPixelArray(cutout.img, cutout.transform.scale),
		transform: cutout.transform,
		img: cutout.img,
		opacityIndex: 0,
		cutoutId: nextId,
		alphaMap: Array(Math.pow(2, 3 * 6)).fill(255),
		distortionx: new Array(pa.width * pa.height).fill(0),
		distortiony: new Array(pa.width * pa.height).fill(0),
		feather: 0
	};
	return result;
}

export function updateCutoutTransform(cutout, transform) {
	const preScale = ((typeof cutout.transform.tw === 'undefined') ? cutout.img.width : cutout.transform.tw) / cutout.img.width;

	const newScale = transform.scale * preScale;
	const resize = cutout.transform.scale * preScale !== newScale;
	if (resize) {
		const newTransform = { ...transform, scale: newScale, tw: cutout.img.width * newScale };
		const newCutout = makeCutout({ ...cutout, transform: newTransform });
		return { ...newCutout, transform: { ...newTransform, scale: 1 } };
	}
	return { ...cutout, transform };
}

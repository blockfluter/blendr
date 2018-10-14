import { softenAlpha } from '../render/soften';
import { imageToPixelArray } from './index';
import * as Paint from '../rubber/paint';


export function saveImageFile(props) {
	debugger;
	try {
		const frame = document.getElementById(props.frameId);
		const canvas = document.createElement('canvas');
		canvas.width = props.crop.width;
		canvas.height = props.crop.height;
		const context = canvas.getContext('2d');
		props.cutouts.map(cutout => {
			const soft = softenAlpha(cutout.dst, cutout.feather);
			const oc = document.createElement('canvas');
			oc.width = soft.width;
			oc.height = soft.height;
			const octx = oc.getContext('2d');
			octx.putImageData(soft, 0, 0);
			context.drawImage(oc, Math.round(cutout.transform.x-props.crop.left), Math.round(cutout.transform.y-props.crop.top));
		});
		var link = document.createElement('a');
		link.download = props.savedFilename;
		link.href = canvas.toDataURL();
		link.click();
	}
	catch (err) {
		alert(err);
	}
}

export function renderCutout(cutout) {
	const soft = softenAlpha(cutout.dst, cutout.feather);
	const oc = document.createElement('canvas');
	oc.width = soft.width;
	oc.height = soft.height;
	const octx = oc.getContext('2d');
	octx.putImageData(soft, 0, 0);
	octx.drawImage(oc, 0, 0);
	const img = new Image();
	img.src = oc.toDataURL();
	img.width = cutout.img.width;
	img.height = cutout.img.height;
	
	  
//	console.log(cutout);
	const result= {
		...cutout,
		img,
		dst: imageToPixelArray(img, 1),
		pa: imageToPixelArray(img, 1),
		alphaMap: Array(Math.pow(2, 3 * 6)).fill(255),
		distortionx: new Array(soft.width, soft.height).fill(0),
		distortiony: new Array(soft.width, soft.height).fill(0),
		feather: 1
	};
	            const render = Paint.Render(result);
            const soften = softenAlpha(render, result.feather);
		return result;
}



export function flattenCutouts(props, opts) {
	const frame = document.getElementById(props.frameId);
	const canvas = document.createElement('canvas');
	canvas.width = frame.clientWidth;
	canvas.height = frame.clientHeight;
	const context = canvas.getContext('2d');
	context.fillStyle = 'rgba(255, 0, 0, 255)';
	context.clearRect(0, 0, canvas.width, canvas.height);
	// props.cutouts.map(cutout => {
	// 	console.log('flatten', cutout);
	// 	context.drawImage(convertImageDataToImageElement(softenAlpha(cutout.dst, cutout.feather)), cutout.transform.x, cutout.transform.y);
	// });
	return canvas;
}

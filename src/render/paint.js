import { Point } from './point';

export class Brush {
	constructor(size, maxAlpha) {
		this.size = size;
		this.maxAlpha = maxAlpha;
		this.generate();
	}
	smaller() {
		this.size = Math.max(this.size-10,20);
		this.generate();
	}
	larger() {
		this.size = Math.max(this.size-10,500);
		this.generate();
	}
	generate() {
		const hbsize = this.size >> 1, alf = [];
		let i = 0;

		for (let y = 0; y < this.size; ++y) {
			for (let x = 0; x < this.size; ++x) {
				const
					ddx = x - hbsize,
					ddy = y - hbsize;
				let dc = Math.sqrt(ddx * ddx + ddy * ddy) / hbsize;
				alf[i] = this.maxAlpha * Math.max(0, 1 - (dc * dc));
				++i;
			}
		}
		this.alf = alf;		
	}
	xshrink(x, dx) {
		const hbsize = Math.round(this.size / 2);
		return -(x - hbsize) / hbsize;
	}
	yshrink(y, dy) {
		const hbsize = Math.round(this.size / 2);
		return -(y - hbsize) / hbsize;
	}
	xgrow(x, dx) {
		const hbsize = Math.round(this.size / 2);
		return (x - hbsize) / hbsize;
	}
	ygrow(y, dy) {
		const hbsize = Math.round(this.size / 2);
		return (y - hbsize) / hbsize;
	}
	xpush(x, dx) {
		return dx;
	}
	ypush(y, dy) {
		return dy;
	}
}


export function Alphaedit(imageData, brush, px, py, fn) {
	var
		width = imageData.width,
		height = imageData.height,
		i = 0,
		bsize = brush.size,
		hbsize = brush.size >> 1,
		s = imageData.data,
		alpha = brush.alf;

	for (var y = 0; y < bsize; ++y) {
		for (var x = 0; x < bsize; ++x) {
			var
				sy = py + y - hbsize,
				sx = px + x - hbsize;

			if (sy >= 0 && sy < height && sx >= 0 && sx < width) {
				const index = Math.floor(4 * (sy * width + sx));
				fn(s, index, alpha[i]);
			}
			++i;
		}
	}
}


function clampX(x, w, h) {
	if (x < 0)
		return { x: 0, clamped: true };
	if (x >= w)
		return { x: w - 1, clamped: true };
	return { x: x, clamped: false };
}

function clampY(y, w, h) {
	if (y < 0)
		return { y: 0, clamped: true };
	if (y >= h)
		return { y: h - 1, clamped: true };
	return { y: y, clamped: false };
}

export function Distort(width, height, brush, distortionX, distortionY, org, vector, op) {
	var
		i = 0,
		bsize = brush.size,
		hbsize = brush.size >> 1,
		alpha = brush.alf,
		dx = distortionX,
		dy = distortionY,
		xfunc, yfunc;

	switch (op) {
		case 'push':
			xfunc = brush.xpush.bind(brush);
			yfunc = brush.ypush.bind(brush);
			break;
		case 'shrink':
			xfunc = brush.xshrink.bind(brush);
			yfunc = brush.yshrink.bind(brush);
			break;
		case 'grow':
			xfunc = brush.xgrow.bind(brush);
			yfunc = brush.ygrow.bind(brush);
			break;
	}
	for (var y = 0; y < bsize; ++y) {
		for (var x = 0; x < bsize; ++x) {
			const
				sy = org.y + y - hbsize,
				sx = org.x + x - hbsize,
				index = Math.round((sy) * width) + Math.round(sx),
				ddx = x - hbsize,
				ddy = y - hbsize;

			if (sy >= 0 && sy < height && sx >= 0 && sx < width) {
				const a = alpha[i];
				if (op === 'normal') {
					dx[index] = Lerp(dx[index], 0, a);
					dy[index] = Lerp(dy[index], 0, a);
				} else {
					dx[index] -= a * xfunc(x, vector.x);
					dy[index] -= a * yfunc(y, vector.y);
				}
			}
			++i;
		}
	}
}



function BiLinear(ul, ur, ll, lr, xf, yf) {
	var
		xt = ul + xf * (ur - ul),
		xb = ll + xf * (lr - ll),
		mix = xt + yf * (xb - xt);
	return Math.round(mix);

}


export function Render(imageDataDst, imageDataSrc, distortionX, distortionY, ul, wh) {
	var
		s = imageDataSrc.data,
		d = imageDataDst.data,
		width = imageDataSrc.width,
		height = imageDataSrc.height,
		dx = distortionX,
		dy = distortionY,
		pitch = width * 4,
		blend = BiLinear;
	ul || (ul = new Point(0, 0));
	wh || (wh = new Point(width, height));
	if (ul.x < 0) {
		wh.x += ul.x;
		ul.x = 0;
	}
	if (ul.y < 0) {
		wh.y += ul.y;
		ul.y = 0;
	}
	var xe = ul.x + wh.x;
	if (xe >= width) {
		wh.x -= (xe - width);
	}
	var ye = ul.y + wh.y;
	if (ye >= height) {
		wh.y -= (ye - height);
	}
	for (var y = ul.y; y < ul.y + wh.y; ++y) {
		var
			si = y * width + ul.x,
			i = si * 4;
		for (var x = ul.x; x < ul.x + wh.x; ++x) {
			var
				sx = clampX(x + dx[si], width, height),
				sy = clampY(y + dy[si], width, height),
				ix = Math.floor(sx.x),
				iy = Math.floor(sy.y),
				xfraction = sx.x - ix,
				yfraction = sy.y - iy;

			let ss = (ix + (iy * width)) << 2;
			++si;
			d[i++] = blend(s[ss], s[ss + 4], s[ss + pitch], s[ss + 4 + pitch], xfraction, yfraction);
			d[i++] = blend(s[ss + 1], s[ss + 5], s[ss + 1 + pitch], s[ss + 5 + pitch], xfraction, yfraction);
			d[i++] = blend(s[ss + 2], s[ss + 6], s[ss + 2 + pitch], s[ss + 6 + pitch], xfraction, yfraction);
			d[i++] = blend(s[ss + 3], s[ss + 7], s[ss + 3 + pitch], s[ss + 7 + pitch], xfraction, yfraction);
			ss += 4;
		}
	}
}

function Lerp(v1, v2, a) {
	var result = v1 + (v2 - v1) * a;
	return result;
  }
  
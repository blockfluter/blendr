export function AlphaIndexFromRGB(r, g, b) {
	r >>= 2;
	g >>= 2;
	b >>= 2;
	var result = r | (g << 6) | (b << 12);
	return result;
}
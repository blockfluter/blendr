export default function Lerp(v1, v2, a) {
	var result = v1 + (v2 - v1) * a;
	return result;
  }
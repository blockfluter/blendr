export default function circleCursor(diameter) {
	const radius = diameter / 2;
	const canvas = document.createElement("canvas");
	canvas.width = diameter;
	canvas.height = diameter;
	const context = canvas.getContext("2d");
	context.beginPath();
	context.arc(radius, radius, radius, 0, 2 * Math.PI, true);
	context.closePath();
	context.fillStyle = "rgba(200,190,195,.5)";
	context.fill();
	return `url(${canvas.toDataURL("image/png")}) ${radius} ${radius}, auto`;
  }
  
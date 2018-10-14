/*
 * 
 * 
 * 
 */
export function Point(x,y){
	var self= this;
	self.x= Math.round(x);
	self.y= Math.round(y);
}
Point.prototype= {
	x: 0, y: 0,
};
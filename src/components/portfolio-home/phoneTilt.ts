/** Relative screen-space tilt, including phones held in landscape. */
export function screenTilt(beta:number,gamma:number,angle:number) {
  const radians=angle*Math.PI/180;
  return {x:gamma*Math.cos(radians)+beta*Math.sin(radians),y:beta*Math.cos(radians)-gamma*Math.sin(radians)};
}

export function relativeTilt(value:number,neutral:number,range:number) {
  const difference=((value-neutral+540)%360)-180;
  return Math.max(-1,Math.min(1,difference/range));
}

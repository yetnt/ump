const ump = require("./../dist/index");

const a = new ump.Point(2, 6);
const b = new ump.Point(8, 6);
const c = new ump.Point(8, 2);
const d = new ump.Point(2, 2);

const l1 = new ump.Line(a, b);
const l2 = new ump.Line(b, c);
const l3 = new ump.Line(c, d);
const l4 = new ump.Line(d, a);

const quad = new ump.Quad(l1, l2, l3, l4);
console.log(l4);

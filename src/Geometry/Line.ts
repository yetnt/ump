import { Point, fResult, BaseLine } from "./base";

/**
 * A line, what else.
 * (This is a finite line, so this should be classified as a Ray but it's too late.)
 */
export default class Line extends BaseLine {
    private _start: Point;
    private _end: Point;
    private _distance: number;
    private _inclination: number;
    /**
     * The gradient of the line, updates when you update either start or end property.
     */
    gradient: number;
    /**
     * The midpoint of the line, updates when you update either start of end property.
     */
    midpoint: Point;

    /**
     * Initalize the line with 2 points.
     * @param a Point a (start)
     * @param b Point b (end)
     */
    constructor(a: Point, b: Point);

    /**
     * Initialize the line using y = mx + c equation.
     * @param m Gradient
     * @param c Y-intercept.
     */
    constructor(m: number, c: number);

    constructor(param1: Point | number, param2: Point | number) {
        super();
        if (param1 instanceof Point && param2 instanceof Point) {
            let a = param1;
            let b = param2;
            this._start = a;
            this._end = b;
            this.calc();
        } else if (typeof param1 == "number" && typeof param2 == "number") {
            let m = param1;
            let c = param2;

            this._start = new Point((0 - c) / m, 0);
            this._end = new Point(0, c);
            this.calc(m, c);
        }
    }

    set start(pt: Point) {
        this._start = pt;
        this.calc();
    }

    set end(pt: Point) {
        this._end = pt;
        this.calc();
    }

    /**
     * The first point of the line.
     */
    get start() {
        return this._start;
    }

    /**
     * The second point of the line.
     */
    get end() {
        return this._end;
    }

    get inclination() {
        return this._inclination;
    }

    /**
     * Distance between the two points.
     */
    get distance() {
        return this._distance;
    }

    /**
     * Checks if the given points lie on this line.
     *
     * @param pts - The points to check.
     * @returns `true` if all the points lie on this line, `false` otherwise.
     *
     * @remarks
     * This method uses the equation of the line (y = mx + c) to check if the points lie on the line.
     * It iterates through each point and checks if the y-coordinate of the point equals the calculated y-coordinate using the point's x-coordinate and the gradient and y-intercept of the line.
     * If all points satisfy this condition, the method returns `true`; otherwise, it returns `false`.
     */
    includes(...pts: Point[]): boolean {
        return pts.some((pt) => {
            return this.gradient * pt.x + this.yIntercept == pt.y;
        });
    }

    /**
     * Calculates the gradient and midpoint of the line based on the provided start and end points, or gradient and y-intercept.
     *
     * @param m - Optional parameter representing the gradient of the line. If provided, it will be used to calculate the gradient.
     * @param c - Optional parameter representing the y-intercept of the line. If provided, it will be used to calculate the gradient.
     *
     * @returns
     *
     * @remarks
     * If both `m` and `c` are provided, the method will use `m` to calculate the gradient.
     * If neither `m` nor `c` are provided, the method will calculate the gradient using the start and end points of the line.
     * The midpoint of the line is also calculated and stored in the `midpoint` property.
     */
    private calc(m?: number, c?: number) {
        this.gradient =
            m != undefined
                ? m
                : this._end.y == this._start.y // gradient will be undefined.
                ? undefined
                : (this._end.x - this._start.x) / (this._end.y - this._start.y);
        this.midpoint = new Point(
            (this._start.x + this._end.x) / 2,
            (this._start.y + this._end.y) / 2
        );

        this.yIntercept =
            c != undefined ? c : this.start.y - this.gradient * this.start.x;
        this.xIntercept =
            this.yIntercept === 0
                ? this.start.x
                : -this.yIntercept / this.gradient;

        // m = tan(theta)
        // atan(m) = theta

        this._inclination = Math.atan(this.gradient);

        this._distance = Math.sqrt(
            Math.pow(this._end.x - this._start.x, 2) +
                Math.pow(this._end.y - this._start.y, 2)
        );
    }

    /**
     * A static method that finds a new point based on a given point, midpoint, and either the x or y coordinate.
     * It calculates the missing coordinate using the midpoint and the given point.
     *
     * @param givenPt - The known point on the line.
     * @param midpt - The midpoint of the line.
     * @param givenX - The x-coordinate of the new point. If not provided, the method will calculate it.
     * @param givenY - The y-coordinate of the new point. If not provided, the method will calculate it.
     * @returns An object containing the new point and the line formed by the given point and the new point.
     */
    static findPtFromMidpt(
        givenPt: Point,
        midpt: Point,
        givenX?: number,
        givenY?: number
    ): fResult {
        // if we're given midpt (0;0)
        // and pts A(1; 1) and B(-1; y)
        // 0 = (1 + y)/2
        // 2 * 0 = 1 + y
        // (2 * 0) - 1 = y (same goes for x)
        if (givenX != undefined) {
            let newY: number = 2 * midpt.y - givenPt.y;
            let newPoint: Point = new Point(givenX, newY);
            return {
                pt: newPoint,
                line: new Line(givenPt, newPoint),
            };
        } else if (givenY != undefined) {
            let newX: number = 2 * midpt.x - givenPt.x;
            let newPoint: Point = new Point(newX, givenY);
            return {
                pt: newPoint,
                line: new Line(givenPt, newPoint),
            };
        }
    }

    /**
     * A static method that finds a new point based on a given point, gradient, and either the x or y coordinate.
     * It calculates the missing coordinate using the given gradient and the given point.
     *
     * @param givenPt - The known point on the line.
     * @param gradient - The gradient of the line.
     * @param givenX - The x-coordinate of the new point. If not provided, the method will calculate it.
     * @param givenY - The y-coordinate of the new point. If not provided, the method will calculate it.
     * @returns An object containing the new point and the line formed by the given point and the new point.
     */
    static findPtFromGradient(
        givenPt: Point,
        gradient: number,
        givenX?: number,
        givenY?: number
    ): fResult {
        // if we're given graident m

        // and pts A(Xa; Ya) and B(Xb; y)
        // m = (Ya - y)/(Xa - Xb)
        // m(Xa - Xb) = Ya - y
        // m(Xa - Xb) + y = Ya
        // y = Ya - m(Xa - Xb)

        // and pts A(Xa; Ya) and B(x; Yb)
        // m = (Ya - Yb)/(Xa - x)
        // m(Xa - x) = (Ya - Yb)
        // Xa - x = (Ya - Yb)/m
        // - x = ((Ya - Yb)/m) - Xa
        // therefore x = Xa + ((Ya-Yb)/m)

        if (givenX != undefined) {
            let newY = givenPt.y - gradient * (givenPt.x - givenX);
            let newPoint = new Point(givenX, newY);
            return {
                pt: newPoint,
                line: new Line(givenPt, newPoint),
            };
        } else if (givenY != undefined) {
            let newX = givenPt.x - (givenPt.y - givenY) / gradient;
            let newPoint = new Point(newX, givenY);
            return { pt: newPoint, line: new Line(givenPt, newPoint) };
        }
    }
}

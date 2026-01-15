import { isParallel, isPerpendicular } from "./funcs";
import Line from "./Line";

export type QuadTypes =
    | "Trapezium"
    | "IsoTrapezium"
    | "Parallelogram"
    | "Rectangle"
    | "Square"
    | "Kite"
    | "Rhombus"
    | null;

export class Quad<QuadType extends QuadTypes = null> {
    type: QuadType;
    lines: [Line, Line, Line, Line];
    _area: number;
    _perimeter: number;

    // public orderLines() {
    //     // if type is null, we probs just init the class for the first time.
    //     if (this.type !== null) return;
    //     const otherLines = [...this.lines]; // Copy the lines to avoid mutating the original
    //     const newLines: Line[] = [otherLines.shift()!]; // Start with the first line

    //     for (let num = 0; num !== 5; num++) {
    //         // 5 attempts to order this.
    //         const currentLine = otherLines.shift();
    //         loop: for (const line of otherLines) {
    //             if (
    //                 currentLine.end.x === line.start.x &&
    //                 currentLine.end.y === line.start.y
    //             ) {
    //                 // Add it to the ordered lines and remove it from the remaining ones
    //                 newLines.push(line);
    //                 otherLines.splice(otherLines.indexOf(line), 1);
    //                 break loop;
    //             }
    //         }
    //     }

    //     if (newLines.length !== 4)
    //         throw new Error(
    //             "Lines either do not form a closed quadrilateral or don't form a quadrilateral at all."
    //         );

    //     // this.lines = newLines as never as [Line, Line, Line, Line]; // Assign the newly ordered lines
    //     console.log(newLines);
    // }

    /**
     * Initializes the quadrilateral. Ensure that the lines provided are
     * connected in sequence (or reverse sequence), meaning `l1` connects to `l2`,
     * `l2` connects to `l3`, and so on, with the last line (`l4`) connecting back
     * to the first (`l1`). The lines must not be parallel to ensure a valid quadrilateral.
     *
     * @param l1 First line of the quadrilateral.
     * @param l2 Second line of the quadrilateral.
     * @param l3 Third line of the quadrilateral.
     * @param l4 Fourth line of the quadrilateral.
     */
    constructor(l1: Line, l2: Line, l3: Line, l4: Line, type: QuadType = null) {
        this.lines = [l1, l2, l3, l4];
        this.type = type;
    }

    private allDistancesEqual(): boolean {
        return (
            this.lines[0].distance === this.lines[1].distance &&
            this.lines[1].distance === this.lines[2].distance &&
            this.lines[2].distance === this.lines[3].distance
        );
    }

    private allAnglesPerpendicular(): boolean {
        // due to the nature of this method. it will be called when classiying between the hierachy
        // of a parm to a rect or a rhombus to a rect.
        // since both a parm and rhombus have opposite angles are equal
        // all we need to check is if both the 2 adjacent angles are 90 degrees.
        // laws of math do the rest of the heavy lifting for us yay
        return (
            isPerpendicular(this.lines[0], this.lines[1]) &&
            isPerpendicular(this.lines[1], this.lines[2])
        );
    }

    private isSquare(allDistEqual: boolean = false): false | Quad<"Square"> {
        const distEqual = allDistEqual || this.allDistancesEqual();
        const isSquare = distEqual && this.allAnglesPerpendicular();
        if (!isSquare) return false;

        return new Quad(...this.lines, "Square");
    }

    private isRhombus(): false | Quad<"Rhombus" | "Square"> {
        const isRhombus = this.allDistancesEqual();
        if (!isRhombus) return false;

        const isSquare = this.isSquare(true);

        return isSquare || new Quad(...this.lines, "Rhombus");
    }

    public classify(): Quad<QuadTypes> {
        /**
         * Are the opposite lines parallel?
         */
        let oppLinesParallel: [boolean, boolean] = [
            isParallel(this.lines[0], this.lines[2]),
            isParallel(this.lines[1], this.lines[3]),
        ];
        /**
         * Are the opposite lines equal?
         */
        let oppLinesEqual: [boolean, boolean] = [
            this.lines[0].distance === this.lines[2].distance,
            this.lines[1].distance === this.lines[3].distance,
        ];

        if (oppLinesParallel[0] && oppLinesParallel[1]) {
            // Two pairs of opposite parallel sides. Seems like a parm.
            if (this.allAnglesPerpendicular()) {
                // probs a rectnagle
                return this.isSquare() || new Quad(...this.lines, "Rectangle");
            }
            // if all angles are NOT perpendicular, then lets check if its a rhombus
            return this.isRhombus() || new Quad(...this.lines, "Parallelogram");
        } else if (oppLinesParallel[0] || oppLinesParallel[1]) {
            // Only 1 side is parallel, def a trapezium

            // if one of the pair of lines are parallel AND the OTHER pair of lines are equal, it's an isosceles trapezium.
            // lambda function checks for this
            return (oppLinesParallel[0] && oppLinesEqual[1]) ||
                (oppLinesParallel[1] && oppLinesEqual[0])
                ? new Quad(...this.lines, "IsoTrapezium")
                : new Quad(...this.lines, "Trapezium");
        } else {
            // possibly a kite
            // [0, 1, 2, 3]
            if (
                (this.lines[0].distance == this.lines[1].distance &&
                    this.lines[2].distance == this.lines[3].distance) ||
                (this.lines[3].distance == this.lines[0].distance &&
                    this.lines[2].distance == this.lines[1].distance)
            )
                // long as fucking if but its def a kite then
                return this.isRhombus() || new Quad(...this.lines, "Kite");
        }

        return new Quad(...this.lines, null); // if none of the above conditions are met, then its just a random quadrilateral
    }
}

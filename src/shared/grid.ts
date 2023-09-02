import { string } from "fp-ts";
import { Eq, contramap } from "fp-ts/lib/Eq";
import { Functor1 } from "fp-ts/lib/Functor";
import { Monoid } from "fp-ts/lib/Monoid";
import { isEqual } from "lodash";

export type Matrix<T> = T[][]
export type Point = { x: number; y: number };


export type Region = Point[]


export const point
    : { Eq: Eq<Point> }
    = { Eq: { equals: isEqual } }


export const URI = 'Matrix'
export type URI = typeof URI

declare module 'fp-ts/HKT' {
    interface URItoKind<A> {
        readonly Matrix: Matrix<A>
    }
}

export const Matrix
    : { Functor: Functor1<"Matrix"> }
    = {
    Functor: {
        URI,
        map: (fa, f) => fa.map(row => row.map(f))
    },

}



export type Value = {
    value: string,
    candidates: string[],
    notes: string[]
}

export const Value
    : { Eq: Eq<Value>, Monoid: Monoid<Value> }
    = {
    Eq: contramap<string, Value>(v => v.value)(string.Eq),
    Monoid: {
        empty: { value: "", candidates: [], notes: [] },
        concat: (a, b) => ({
            value: a.value + b.value,
            candidates: a.candidates.concat(b.candidates),
            notes: a.notes.concat(b.notes)
        })

    }
}

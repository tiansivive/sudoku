import { Eq } from "fp-ts/lib/Eq";
import { isEqual } from "lodash";

export type Matrix<T> = T[][]
export type Point = { x: number; y: number };


export type Region = Point[]


export const point: {
    Eq: Eq<Point>,
} = {
    Eq: { equals: isEqual }
}
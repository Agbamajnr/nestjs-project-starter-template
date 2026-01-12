
import * as R from 'ramda';
import { PromisePool } from '@supercharge/promise-pool/dist';

export const getRandomItem = <T>(list: T[]) => {
    const randomIndex = Math.floor(Math.random() * R.length(list));
    return R.nth(randomIndex, list);
};

export function prettyPrintArray<T>(arr: T[]) {
    return arr.length > 1
        ? arr
            .map((a) => (typeof a === 'object' ? JSON.stringify(a) : a))
            .slice(0, arr.length - 1)
            .join(', ') +
        ' and ' +
        arr[arr.length - 1]
        : arr[0];
}
export function roundToNearestDecimal(value: number, decimals: number): number {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}

export function roundToNearestHalf(value: number): number {
    return Math.round(value * 2) / 2;
}

export async function runConcurrently<T>(
    data: T[],
    concurrentCount: number,
    process: (each: T) => any,
) {
    return await new PromisePool(data)
        .withConcurrency(concurrentCount)
        .process(process);
}

export function cleanObject(obj: any): any {
    // Handle arrays by recursively cleaning each element
    if (Array.isArray(obj)) {
        return obj.map(item => cleanObject(item));
    }

    // Handle objects by removing undefined/null values
    if (obj && typeof obj === 'object') {
        const cleaned = Object.entries(obj).reduce((acc, [key, val]) => {
            if (val && typeof val === 'object') {
                val = cleanObject(val);
            }
            if (val !== undefined && val !== null) {
                acc[key] = val;
            }
            return acc;
        }, {});
        return cleaned;
    }

    // Return primitive values as is
    return obj;
}


export function createReactiveVariablesInObject(property: string, objectToModify: any = exports, reactiveFn: () => any): any {
    Object.defineProperty(objectToModify, property, {
        get: reactiveFn,
        enumerable: true,
    });
}
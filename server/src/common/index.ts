import * as Express from 'express';

/** Http Errors */
export class BadRequestError extends Error {
    public httpCode = 400;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

export class UnauthorizedError extends Error {
    public httpCode = 401;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class ForbiddenError extends Error {
    public httpCode = 403;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

export class NotFoundError extends Error {
    public httpCode = 404;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ConflictError extends Error {
    public httpCode = 409;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export let HttpErrors = [BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError];

/** Other errors */
export class AlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, AlreadyExistsError.prototype);
    }
}

//export type Request = (Express.Request | FreshSocketIO.Request) & MazenetRequest;
// export type Request = (Express.Request | FreshSocketIO.Request) & MazenetRequest;
// export type Response = Express.Response | FreshSocketIO.Response;
export type Request = Express.Request;
export type Response = Express.Response;

export function mapToObject<T, V, M extends Map<string, T>>(map: M, transform?: (t: T) => V): {[id: string]: V} {
    if(!transform) {
        transform = (t: T) => <V><any>t;
    }
    const obj: {[key: string]: V} = {};
    for (const [key, value] of map) {
        obj[key] = transform(value);
    }
    return obj;
}

export function objectToMap<T, V>(obj: {[key: string]: T}, transform?: (t: T) => V): Map<string, V> {
    if(!transform) {
        transform = (t: T) => <V><any>t;
    }
    return Object.keys(obj).reduce((map: Map<string, V>, key: string) => {
        map.set(key, transform!(obj[key]));
        return map;
    }, new Map<string, V>());
}

//TODO: use this instead of checking in each route handler. come up with a better name
/** Method Decorator for middlewares that throws an error ifthe user is not authenticated */
/*
export function authenticated(target: any, propertyKey: string, descriptor: any) {
	let originalMethod = descriptor.value;
	descriptor.value = function(...args: any[]) {
		if(!args[0].user) {
			return args[2](new UnauthorizedError('User must be authenticated'));
		}
		return originalMethod.apply(this, args);
	};

	return descriptor;
}
*/

/** PhraseMaze API v1 */
/**
 * NOTE: sometimes we want to use a model as a response, but aliasing classes doesn't fully work
 * we work around this limitation by extending the class we want to alias
 *        export class Response201 extends Models.User {};
 * see issue: https://github.com/Microsoft/TypeScript/issues/2559
 */
import * as Validator from '../util/validator';

export class ErrorResponse {
    /** HTTP status code */
    @Validator.validate()
    code!: number;
    /** A short message describing the error */
    @Validator.validate()
    message!: string;

    data?: Error.Data;
}

export namespace Error {
    export type Data = any;
}

export namespace Models {
}

export namespace Routes {
}

// export namespace Events {
// }

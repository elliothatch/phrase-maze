/**
 * PhraseMaze app. Controls the REST and socket.io APIs
 */

import * as Express from 'express';
import FreshSocketIO = require('fresh-socketio-router');
import * as SocketIO from 'socket.io';

import { Pool } from 'pg';

import { GlobalLogger } from './util/logger';
import { ErrorHandler, RequestLogger } from './util/middleware';

export namespace PhraseMaze {
    export interface Options {
        postgresPool?: Pool;
    }
}

class PhraseMaze {
    public static readonly defaultOptions = {};

    public options: PhraseMaze.Options;
    public expressApp: Express.Router;
    public socketServer: SocketIO.Server;

    constructor(expressApp: Express.Router, socketServer: SocketIO.Server, options?: Partial<PhraseMaze.Options>) {
        this.options = Object.assign({}, PhraseMaze.defaultOptions, options);
        this.expressApp = expressApp;
        this.socketServer = socketServer;
        this.Init();
    }

    protected Init() {
        GlobalLogger.trace('Initializing phrase maze');

        const mazenetIo = this.socketServer.of('/phrase-maze');

        //TODO: will need express middleware to convert GET query params to req.body object
        const router = FreshSocketIO.Router();
        const requestLogger = new RequestLogger();
        router.use(requestLogger.middleware);

        // router.use(userMiddleware.router); // must be used first, to authenticate user

        const errorHandler = new ErrorHandler();
        router.use(errorHandler.middleware);

        this.expressApp.use(router);
        // mazenetIo.use(userMiddleware.socketMiddleware);
        mazenetIo.use(FreshSocketIO(router, {
            // ignoreList: ['/rooms/active-users/desktop/cursor-moved']
        }));
    }
}

export default PhraseMaze;

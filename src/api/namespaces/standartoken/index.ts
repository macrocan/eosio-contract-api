import * as express from 'express';
import { HTTPServer } from '../../server';

import { ApiNamespace } from '../interfaces';
import { ActionHandlerContext } from '../../actionhandler';
import ApiNotificationReceiver from '../../notification';


export type StandarTokenNamespaceArgs = {
    connected_reader: string;

    standartoken_account: string;
}

export type StandarTokenContext = ActionHandlerContext<StandarTokenNamespaceArgs>;

export class StandarTokenNamespace extends ApiNamespace {
    static namespaceName = 'standartoken';

    declare args: StandarTokenNamespaceArgs;

    async init(): Promise<void> {
        if (typeof this.args.standartoken_account !== 'string') {
            throw new Error('Argument missing in standartoken api namespace: standartoken_account');
        }
    }

    async router(server: HTTPServer): Promise<express.Router> {
        const router = express.Router();

        // TODO swagger ui doc

        if (server.web.limiter) {
            server.web.express.use(this.path, server.web.limiter);
        }

        return router
    }

    async socket(server: HTTPServer): Promise<void> {
        const notification = new ApiNotificationReceiver(this.connection, this.args.connected_reader);

        
    }
}

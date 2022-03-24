import * as express from 'express';

import { StandarTokenContext, StandarTokenNamespace } from '../index';
import { getRawTransfersAction } from "../handlers/transfers"

import { HTTPServer } from '../../../server';
import { RequestValues } from '../../utils';

import ApiNotificationReceiver from '../../../notification';


export class TransferApi {
    constructor(
        readonly core: StandarTokenNamespace,
        readonly server: HTTPServer,
        readonly schema: string
    ) { }

    getTransfersAction = async (params: RequestValues, ctx: StandarTokenContext): Promise<any> => {
        const result = await getRawTransfersAction(params, ctx);

        return await fillTransfers(
            this.server, this.core.args.standartoken_account,
            result.rows.map(this.transferFormatter),
            this.assetFormatter, this.assetView, this.fillerHook
        );
    }

    endpoints(router: express.Router): any {
        const {caching, returnAsJSON} = this.server.web;

        router.all('/v1/transfers', caching(), returnAsJSON(this.getTransfersAction, this.core));
    }

    sockets(notification: ApiNotificationReceiver): void {
        // TODO
    }
}
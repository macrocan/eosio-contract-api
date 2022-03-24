import { buildBoundaryFilter, RequestValues } from '../../utils';
import { StandarTokenContext } from "../index";
import QueryBuilder from '../../../builder';
import { filterQueryArgs } from '../../validation';

export async function getRawTransfersAction(params: RequestValues, ctx: StandarTokenContext): Promise<any> {
    const args = filterQueryArgs(params, {
        contract: {type: 'string', min: 1},
        symbol: {type: 'string', min: 1},
        senders: {type: 'string', min: 1},
        receivers: {type: 'string', min: 1},

        startTime: {type: 'int', min: 1},
        endTime: {type: 'int', min: 1},
    });

    const query = new QueryBuilder('SELECT * FROM standartoken_transfers'); 
    query.equal('contract', args.contract);

    if (args.senders) {
        query.equalMany('from', args.sender.split(','));
    }

    if (args.receivers) {
        query.equalMany('to', args.recipient.split(','));
    }
}
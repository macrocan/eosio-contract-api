import * as fs from 'fs';
import Filler  from '../../filler';
import { PoolClient } from 'pg';
import ApiNotificationSender from '../../notifier';
import DataProcessor from '../../processor';
import logger from '../../../utils/winston';


import { ContractHandler } from '../interfaces';
import { tokenProcessor } from './processors/tokens';

export const STANDARTOKEN_BASE_PRIORITY = 0;

export enum StandarTokenUpdatePriority {
    TABLE_BALANCES = STANDARTOKEN_BASE_PRIORITY + 10,
    TABLE_TRANSFER_TX = STANDARTOKEN_BASE_PRIORITY + 10,
}

export type StandarTokenReaderArgs = {
    standartoken_account: string,
    store_transfers: boolean,
    store_logs: boolean
};

export default class StandarTokenHandler extends ContractHandler {
    static handlerName = 'standartoken';

    declare readonly args: StandarTokenReaderArgs;

    constructor(filler: Filler, args: {[key: string]: any}) {
        super(filler, args);

        if (typeof args.standartoken_account !== 'string') {
            throw new Error('StandarToken: Argument missing in standartoken handler: standartoken_account');
        }

        if (!this.args.store_logs) {
            logger.warn('StandarToken: disabled store_logs');
        }

        if (!this.args.store_transfers) {
            logger.warn('StandarToken: disabled store_transfers');
        }
    }

    static async setup(client: PoolClient): Promise<boolean> {
        const existsQuery = await client.query(
            'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2)',
            ['public', 'standartoken_balances']
        );

        if (!existsQuery.rows[0].exists) {
            logger.info('Could not find StandarToken tables. Create them now...');
            await client.query(fs.readFileSync('./definitions/tables/standartoken_tables.sql', {
                encoding: 'utf8'
            }));
    
            logger.info('StandarToken tables successfully created');
    
            return true;
        }

        return false;
    }

    async init(transaction: PoolClient): Promise<void> {

    }

    async deleteDB(transaction: PoolClient): Promise<void> {

    }

    async register(processor: DataProcessor, notifier: ApiNotificationSender): Promise<() => any> {
        const destructors: Array<() => any> = [];

        destructors.push(tokenProcessor(this, processor));
        return (): any => destructors.map(fn => fn());
    }
}
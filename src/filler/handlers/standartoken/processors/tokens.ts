import StandarTokenHandler, { StandarTokenUpdatePriority } from '../index';
import DataProcessor from '../../../processor';
import { ContractDBTransaction } from '../../../database';
import { EosioContractRow } from '../../../../types/eosio';
import { ShipBlock } from '../../../../types/ship';
import { eosioTimestampToDate, splitEosioToken } from '../../../../utils/eosio';
import { BalancesTableRow, TokenStatTableRow } from '../types/tables';
import { LogTransferActionData, LogRetireActionData } from '../types/actions'
import { EosioActionTrace, EosioTransaction } from '../../../../types/eosio';
import logger from '../../../../utils/winston';

export function tokenProcessor(core: StandarTokenHandler, processor: DataProcessor): () => any {
    const destructors: Array<() => any> = [];
    const contract = core.args.standartoken_account;
    // log accounts table delta
    destructors.push(processor.onContractRow(
        contract, 'accounts',
        async (db: ContractDBTransaction, block: ShipBlock, delta: EosioContractRow<BalancesTableRow>): Promise<void> => {
            // balance maybe not valid asset
            var token = null
            try {
                token = splitEosioToken(delta.value.balance);
            } catch (error) {
                logger.warn("contract " + delta.code + " is not standar token contract")
            }

            if (token && delta.present) {
                await db.delete('standartoken_balances', {
                    str: 'contract = $1 AND owner = $2',
                    values: [delta.code, delta.scope]
                });

                await db.insert('standartoken_balances', {
                    contract: delta.code,
                    owner: delta.scope,
                    token_symbol: token.token_symbol,
                    amount: token.amount,
                    updated_at_block: block.block_num,
                    updated_at_time: eosioTimestampToDate(block.timestamp).getTime(),
                }, ['contract', 'owner']);
            }
        }, StandarTokenUpdatePriority.TABLE_BALANCES.valueOf()
    ));
    // log stat table delta
    destructors.push(processor.onContractRow(
        contract, 'stat',
        async (db: ContractDBTransaction, block: ShipBlock, delta: EosioContractRow<TokenStatTableRow>): Promise<void> => {            
            // max_supply maybe not valid asset
            var max_supply = null
            try {
                max_supply = splitEosioToken(delta.value.max_supply);
            } catch (error) {
                logger.warn("contract " + delta.code + " is not standar token contract")
            }

            // supply may be 0 when create
            var supply = '0'
            try {
                supply = splitEosioToken(delta.value.max_supply).amount;
            } catch (error) {
                logger.warn("contract " + delta.code + " is not standar token contract")
            }

            if (max_supply && delta.present) {
                await db.delete('standartoken_stats', {
                    str: 'contract = $1 AND token_symbol = $2',
                    values: [delta.code, max_supply.token_symbol]
                });

                await db.insert('standartoken_stats', {
                    contract: delta.code,
                    token_symbol: max_supply.token_symbol,
                    token_precision: max_supply.token_precision,
                    supply: supply,
                    max_supply: max_supply.amount,
                    issuer: delta.value.issuer,
                    updated_at_block: block.block_num,
                    updated_at_time: eosioTimestampToDate(block.timestamp).getTime(),
                }, ['contract', 'token_symbol']);
            }
        }, StandarTokenUpdatePriority.TABLE_STATS.valueOf()
    ));
    // log transfer action
    destructors.push(processor.onActionTrace(
        contract, 'transfer',
        async (db: ContractDBTransaction, block: ShipBlock, tx: EosioTransaction, trace: EosioActionTrace<LogTransferActionData>): Promise<void> => {
            if (core.args.store_transfers) {

                // balance maybe not valid asset
                var token = null
                try {
                    token = splitEosioToken(trace.act.data.quantity);
                } catch (error) {
                    logger.warn("contract " + trace.act.account + " is not standar token contract")
                }

                if (token) {
                    await db.insert('standartoken_transfers', {
                        contract: trace.act.account,
                        transfer_id: trace.global_sequence,
                        from: trace.act.data.from,
                        to: trace.act.data.to,
                        token_symbol: token.token_symbol,
                        amount: token.amount,
                        memo: String(trace.act.data.memo).substr(0, 256),
                        txid: Buffer.from(tx.id, 'hex'),
                        created_at_block: block.block_num,
                        created_at_time: eosioTimestampToDate(block.timestamp).getTime()
                    }, ['contract', 'transfer_id']);
                }
            }
        }, StandarTokenUpdatePriority.TABLE_TRANSFER_TX.valueOf()
    ));
    // log retire action
    destructors.push(processor.onActionTrace(
        contract, 'retire',
        async (db: ContractDBTransaction, block: ShipBlock, tx: EosioTransaction, trace: EosioActionTrace<LogRetireActionData>): Promise<void> => {
            if (core.args.store_transfers) {

                // balance maybe not valid asset
                var token = null
                try {
                    token = splitEosioToken(trace.act.data.quantity);
                } catch (error) {
                    logger.warn("contract " + trace.act.account + " is not standar token contract")
                }

                if (token) {
                    await db.insert('standartoken_retired', {
                        contract: trace.act.account,
                        transfer_id: trace.global_sequence,
                        token_symbol: token.token_symbol,
                        amount: token.amount,
                        memo: String(trace.act.data.memo).substr(0, 256),
                        txid: Buffer.from(tx.id, 'hex'),
                        created_at_block: block.block_num,
                        created_at_time: eosioTimestampToDate(block.timestamp).getTime()
                    }, ['contract', 'transfer_id']);
                }
            }
        }, StandarTokenUpdatePriority.TABLE_TETIRE_TX.valueOf()
    ));

    return (): any => destructors.map(fn => fn());
}
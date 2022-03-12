import StandarTokenHandler, { StandarTokenUpdatePriority } from '../index';
import DataProcessor from '../../../processor';
import { ContractDBTransaction } from '../../../database';
import { EosioContractRow } from '../../../../types/eosio';
import { ShipBlock } from '../../../../types/ship';
import { eosioTimestampToDate, splitEosioToken } from '../../../../utils/eosio';
import { BalancesTableRow, LogTransferActionData } from '../types/tables';
import { EosioActionTrace, EosioTransaction } from '../../../../types/eosio';

export function balanceProcessor(core: StandarTokenHandler, processor: DataProcessor): () => any {
    const destructors: Array<() => any> = [];
    const contract = core.args.standartoken_account;

    destructors.push(processor.onContractRow(
        contract, 'accounts',
        async (db: ContractDBTransaction, block: ShipBlock, delta: EosioContractRow<BalancesTableRow>): Promise<void> => {
            await db.delete('standartoken_balances', {
                str: 'contract = $1 AND owner = $2',
                values: [contract, delta.scope]
            });

            // TODO quantity maybe not valid asset
            const token = splitEosioToken(delta.value.balance);

            if (delta.present) {
                await db.insert('standartoken_balances', {
                        contract: contract,
                        owner: delta.scope,
                        token_symbol: token.token_symbol,
                        token_precision: token.token_precision,
                        amount: token.amount,
                        updated_at_block: block.block_num,
                        updated_at_time: eosioTimestampToDate(block.timestamp).getTime(),
                }, ['contract', 'owner']);
            }
        }, StandarTokenUpdatePriority.TABLE_BALANCES.valueOf()
    ));


    destructors.push(processor.onActionTrace(
        contract, 'transfer',
        async (db: ContractDBTransaction, block: ShipBlock, tx: EosioTransaction, trace: EosioActionTrace<LogTransferActionData>): Promise<void> => {
            if (core.args.store_transfers) {
                const token = splitEosioToken(trace.act.data.quantity);

                await db.insert('standartoken_transfers', {
                    contract: contract,
                    transfer_id: trace.global_sequence,
                    from: trace.act.data.from,
                    to: trace.act.data.to,
                    token_symbol: token.token_symbol,
                    token_precision: token.token_precision,
                    amount: token.amount,
                    memo: String(trace.act.data.memo).substr(0, 256),
                    txid: Buffer.from(tx.id, 'hex'),
                    created_at_block: block.block_num,
                    created_at_time: eosioTimestampToDate(block.timestamp).getTime()
                }, ['contract', 'transfer_id']);
            }
        }, StandarTokenUpdatePriority.TABLE_TRANSFER_TX.valueOf()
    ));

    return (): any => destructors.map(fn => fn());
}
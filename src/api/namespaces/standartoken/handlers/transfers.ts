import { buildBoundaryFilter, RequestValues } from '../../utils';
import { StandarTokenContext } from "../index";
import { filterQueryArgs } from '../../validation';
import QueryBuilder from '../../../builder';

export async function getTransfersAction(params: RequestValues, ctx: StandarTokenContext): Promise<any> {
  // const maxLimit = ctx.coreArgs.limits?.transfers || 100;
  const args = filterQueryArgs(params, {
    senders: { type: 'string' },
    receivers: { type: 'string' },
    block_height_min: { type: 'int', min: 1 },
    block_height_max: { type: 'int', min: 1 },
    // sort
    order: { type: 'string', allowedValues: ['asc', 'desc'], default: 'desc' },
    sort: { type: 'string', allowedValues: ['created', 'amount', 'block'], default: 'created' },
    // pagination
    page: { type: 'int', min: 1, default: 1 },
    size: { type: 'int', min: 1 },
  });

  const query = new QueryBuilder('SELECT created_at_time,token_symbol, amount, created_at_block FROM standartoken_transfers');
  if (args.senders) {
    query.equal('"from"', args.senders)
  }
  if (args.receivers) {
    query.equal('"to"', args.receivers)
  }

  if (args.block_height_min) {
    query.addCondition(query.addVariable(args.block_height_min) + ' <= created_at_block');
  }
  if (args.block_height_max) {
    query.addCondition(query.addVariable(args.block_height_max) + ' >= created_at_block');
  }

  // sort
  const sortColumnMapping: { [key: string]: string } = {
    created: 'created_at_time',
    block: 'created_at_block',
    amount: 'amount'
  };
  query.append('ORDER BY ' + sortColumnMapping[args.sort] + ' ' + args.order);

  // pagination
  if (args.size) {
    query.paginate(args.page, args.size);
  }
  // console.log('query========', query.buildString(), query.buildValues());
  const collectionResult = await ctx.db.query(query.buildString(), query.buildValues());

  const list = collectionResult.rows.map(row => row);

  return {
    code: 200,
    list,
    // total: list.length
  };
}

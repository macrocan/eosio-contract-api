import { buildBoundaryFilter, RequestValues } from '../../utils';
import { StandarTokenContext } from "../index";


export async function getRawTransfersAction(params: RequestValues, ctx: StandarTokenContext): Promise<any> {
    const args = filterQueryArgs(params, {
        contract: {type: 'string', min: 1},
        symbol: {type: 'string', min: 1},
        owner: {type: 'string', min: 1},
        
    })
}
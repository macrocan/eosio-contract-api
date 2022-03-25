import * as express from 'express';

import { StandarTokenNamespace } from '../index';
import { HTTPServer } from '../../../server';
import {
    // actionGreylistParameters,
    dateBoundaryParameters,
    getOpenAPI3Responses,
    paginationParameters,
    primaryBoundaryParameters
} from '../../../docs';
import {
    getTransfersAction,
} from '../handlers/transfers';


export function transfersEndpoints(core: StandarTokenNamespace, server: HTTPServer, router: express.Router): any {
    const {caching, returnAsJSON} = server.web;

    router.all('/v1/transfers', caching(), returnAsJSON(getTransfersAction, core));

    return {
        tag: {
            name: 'transfers',
            description: 'Transfers'
        },
        paths: {
            '/v1/transfers': {
                get: {
                    tags: ['transfers'],
                    summary: 'Fetch transfers',
                    parameters: [
                        {
                            name: 'senders',
                            in: 'query',
                            description: 'Get transfers by from',
                            required: false,
                            schema: { type: 'string' }
                        },
                        {
                            name: 'receivers',
                            in: 'query',
                            description: 'Get transfers by to',
                            required: false,
                            schema: { type: 'string' }
                        },
                        {
                            name: 'block_height_min',
                            in: 'query',
                            description: 'Filter for transfers which the block_height >= block_height_min',
                            required: false,
                            schema: {type: 'string'}
                        },
                        {
                            name: 'block_height_max',
                            in: 'query',
                            description: 'Filter for transfers which the block_height <= block_height_max',
                            required: false,
                            schema: {type: 'string'}
                        },
                        // ...greylistFilterParameters,
                        ...primaryBoundaryParameters,
                        ...dateBoundaryParameters,
                        ...paginationParameters,
                        // 排序参数
                        {
                            name: 'sort',
                            in: 'query',
                            description: 'Column to sort',
                            required: false,
                            schema: {
                                type: 'string',
                                enum: ['created'],
                                default: 'created'
                            }
                        }
                    ],
                    // 通过code码返回对应的responses信息
                    responses: getOpenAPI3Responses([200, 500], {type: 'array', items: {'$ref': '#/components/schemas/Transfers'}})
                }
            },
        },
        definitions: {}
    };
}

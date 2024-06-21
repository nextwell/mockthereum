/*
 * SPDX-FileCopyrightText: 2022 Tim Perry <tim@httptoolkit.tech>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Mockttp from 'mockttp';
import * as ethers from 'ethers';

export class RpcCallMatcher extends Mockttp.matchers.JsonBodyFlexibleMatcher {

    constructor(
        method: string,
        params: Array<unknown> = []
    ) {
        super({
            jsonrpc: "2.0",
            method,
            params
        });
    }

    async matches(request: any): Promise<boolean> {
        const receivedBody = await (request.body.asJson().catch(() => undefined));

        if (receivedBody === undefined) return false;

        const tx = ethers.utils.parseTransaction(receivedBody.params[0]);

        if (tx) request.params[0] = tx;

        return super.matches(request);
    }

}

export class RpcResponseHandler extends Mockttp.requestHandlerDefinitions.CallbackHandlerDefinition {

    constructor(result: unknown) {
        super(async (req) => ({
            headers: { 'transfer-encoding': 'chunked', 'connection': 'keep-alive' },
            json: {
                jsonrpc: "2.0",
                id: (await req.body.getJson() as { id: number }).id,
                result
            }
        }));
    }

}

export interface RpcErrorProperties {
    code?: number;
    name?: string;
    data?: `0x${string}`;
}

export class RpcErrorResponseHandler extends Mockttp.requestHandlerDefinitions.CallbackHandlerDefinition {

    constructor(message: string, options: RpcErrorProperties = {}) {
        super(async (req) => ({
            headers: { 'transfer-encoding': 'chunked', 'connection': 'keep-alive' },
            json: {
                jsonrpc: "2.0",
                id: (await req.body.getJson() as { id: number }).id,
                error: {
                    message,
                    data: options.data ?? '0x',
                    code: options.code ?? -32099,
                    name: options.name ?? undefined,
                }
            }
        }));
    }

}
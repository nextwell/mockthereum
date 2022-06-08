/*
 * SPDX-FileCopyrightText: 2022 Tim Perry <tim@httptoolkit.tech>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Mockttp from 'mockttp';
import { RpcCallMatcher, RpcErrorResponseHandler, RpcResponseHandler } from '../jsonrpc';

export class BalanceRuleBuilder {

    constructor(
        address: string | undefined,
        private addRuleCallback: (...rules: Mockttp.RequestRuleData[]) => Promise<Mockttp.MockedEndpoint[]>
    ) {
        if (address) {
            this.matchers.push(new RpcCallMatcher('eth_getBalance', [address]));
        } else {
            this.matchers.push(new RpcCallMatcher('eth_getBalance'));
        }
    }

    private matchers: Mockttp.matchers.RequestMatcher[] = [];

    thenReturn(value: number) {
        return this.addRuleCallback({
            matchers: this.matchers,
            handler: new RpcResponseHandler(`0x${value.toString(16)}`)
        });
    }

    thenError(message: string) {
        return this.addRuleCallback({
            matchers: this.matchers,
            handler: new RpcErrorResponseHandler(message)
        });
    }

    thenTimeout() {
        return this.addRuleCallback({
            matchers: this.matchers,
            handler: new Mockttp.requestHandlerDefinitions.TimeoutHandlerDefinition()
        });
    }

    thenCloseConnection() {
        return this.addRuleCallback({
            matchers: this.matchers,
            handler: new Mockttp.requestHandlerDefinitions.CloseConnectionHandlerDefinition()
        });
    }

}
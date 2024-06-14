/*
 * SPDX-FileCopyrightText: 2022 Tim Perry <tim@httptoolkit.tech>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Mockttp from 'mockttp';
import { CallRuleBuilder, TransactionRuleBuilder } from './contract-rule-builder';
import { RpcCallMatcher, RpcErrorResponseHandler, RpcResponseHandler } from './jsonrpc';
import { BalanceRuleBuilder, BlockNumberRuleBuilder, GasPriceRuleBuilder, ChainIdRuleBuilder } from './single-value-rule-builders';

export interface MockthereumOptions {
    /**
     * Specify the behaviour of unmatched requests.
     *
     * By default this is set to `stub`, in which case default responses will be
     * returned, emulating a constantly available but empty node: all queries
     * will return no data or zeros, and transactions to all unmocked addresses
     * will fail.
     *
     * Alternatively, this can be set to an object including a `proxyTo` property,
     * defining the URL of an Ethereum RPC node to which unmatched requests should be
     * forwarded. In this case all default behaviours will be disabled, and all
     * unmatched requests will receive real responses from that upstream node.
     */
    unmatchedRequests?:
    | 'stub'
    | { proxyTo: string }
}

/**
 * A Mockthereum node provides default behaviours and allows defining custom behaviour
 * rules to simulate interactions with the Ethereum network without requiring a full
 * node, access to the real Ethereum network, or real transactions with the delays and
 * costs that might involve.
 *
 * This should not be created directly: instead, call then `getLocal()` or `getRemote()`
 * methods exported from this module.
 *
 * Once you have a Mockthereum node, you can start defining rules using any of the
 * `forX()` methods. Each method returns a rule builder, allowing you to add extra
 * matching constraints, followed by a `thenX()` final method which enables the rule,
 * returning a promise that resolves once the rule is constructed and active.
 */
export class MockthereumNode {

    constructor(
        private mockttpServer: Mockttp.Mockttp,
        private options: MockthereumOptions = {}
    ) { }

    private seenRequests: Mockttp.CompletedRequest[] = [];

    /**
     * The node must be started before use. Starting the node resets it, removing any
     * rules that may have been added previously and configuring default behaviours
     * for unmatched requests.
     *
     * This method returns a promise, which you should wait for to ensure the node
     * is fully started before using it.
     */
    async start(port: number) {
        this.reset();
        await this.mockttpServer.start(port);
        await this.addBaseRules();
    }

    /**
     * Stop the node when you're finished with it to close down the underlying server and
     * any remaining connections.
     *
     * This method returns a promise, which you should wait for to ensure the node
     * is fully stopped, especially if you intend to start it again later.
     */
    stop() {
        return this.mockttpServer.stop();
    }

    reset() {
        this.seenRequests = [];
        this.mockttpServer.reset();
    }

    /**
     * Get the URL for this Mockthereum node. You can pass this directly to libraries like
     * Web3 as your Ethereum RPC endpoint to intercept all Web3 Ethereum interactions.
     */
    get url() {
        return this.mockttpServer.url;
    }

    private async addBaseRules() {
        await Promise.all([
            this.mockttpServer.on('request', this.onRequest),

            ...(!this.options.unmatchedRequests || this.options.unmatchedRequests === 'stub'
                ? [
                    // this.mockttpServer.addRequestRule({
                    //     matchers: [new RpcCallMatcher('eth_getTransactionCount')],
                    //     priority: Mockttp.RulePriority.FALLBACK,
                    //     handler: new RpcResponseHandler("0x0")
                    // }),
                    // this.mockttpServer.addRequestRule({
                    //     matchers: [new RpcCallMatcher('eth_getCode')],
                    //     priority: Mockttp.RulePriority.FALLBACK,
                    //     handler: new RpcResponseHandler("0x")
                    // }),
                    this.mockttpServer.addRequestRule({
                        matchers: [new RpcCallMatcher('eth_sendTransaction')],
                        priority: Mockttp.RulePriority.FALLBACK,
                        handler: new RpcErrorResponseHandler(
                            "No Mockthereum rules found matching Ethereum transaction"
                        )
                    }),
                    this.mockttpServer.addRequestRule({
                        matchers: [new RpcCallMatcher('eth_sendRawTransaction')],
                        priority: Mockttp.RulePriority.FALLBACK,
                        handler: new RpcErrorResponseHandler(
                            "No Mockthereum rules found matching Ethereum transaction"
                        )
                    }),
                    this.mockttpServer.addRequestRule({
                        matchers: [new RpcCallMatcher('eth_getTransactionReceipt')],
                        priority: Mockttp.RulePriority.FALLBACK,
                        handler: new RpcResponseHandler(null)
                    }),
                    // this.mockttpServer.addRequestRule({
                    //     matchers: [new RpcCallMatcher('eth_getBalance')],
                    //     priority: Mockttp.RulePriority.FALLBACK,
                    //     handler: new RpcResponseHandler("0x0")
                    // }),
                    // this.mockttpServer.addRequestRule({
                    //     matchers: [new RpcCallMatcher('eth_blockNumber')],
                    //     priority: Mockttp.RulePriority.FALLBACK,
                    //     handler: new RpcResponseHandler("0x1")
                    // }),
                    // this.mockttpServer.addRequestRule({
                    //     matchers: [new RpcCallMatcher('eth_getBlockByNumber')],
                    //     priority: Mockttp.RulePriority.FALLBACK,
                    //     handler: new RpcResponseHandler(null)
                    // }),
                    // this.mockttpServer.addRequestRule({
                    //     matchers: [new RpcCallMatcher('eth_gasPrice')],
                    //     priority: Mockttp.RulePriority.FALLBACK,
                    //     handler: new RpcResponseHandler(`0x${(1000).toString(16)}`)
                    // })
                ]
                : [
                    this.mockttpServer.forUnmatchedRequest()
                        .thenForwardTo(this.options.unmatchedRequests.proxyTo)
                ])
        ]);
    }

    private onRequest = (request: Mockttp.CompletedRequest) => {
        this.seenRequests.push(request);
    };

    /**
     * Mock all wallet balance queries, either for all addresses (by default) or for
     * one specific wallet address, if specified.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forBalance(address?: `0x${string}`) {
        return new BalanceRuleBuilder(address, this.mockttpServer.addRequestRule);
    }

    /**
     * Mock all contract calls, either for all contracts (by default) or for
     * one specific contract address, if specified.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forCall(address?: `0x${string}`) {
        return new CallRuleBuilder(address, this.mockttpServer.addRequestRule);
    }

    /**
     * Mock all sent transactions.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forSendTransaction() {
        return new TransactionRuleBuilder(
            undefined,
            this.mockttpServer.addRequestRule,
            this.addReceipt.bind(this)
        );
    }

    /**
     * Mock all transactions sent to a specific address.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forSendTransactionTo(address: `0x${string}`) {
        return new TransactionRuleBuilder(
            address,
            this.mockttpServer.addRequestRule,
            this.addReceipt.bind(this)
        );
    }

    private async addReceipt(id: string, receipt: Partial<RawTransactionReceipt>) {
        await this.mockttpServer.addRequestRule({
            matchers: [new RpcCallMatcher('eth_getTransactionReceipt', [id])],
            handler: new RpcResponseHandler({
                "blockHash": "0x163d315a76c93946df46d2ef94880447edc0dd15ec5279a408b88d1b6cbfe2cb",
                "blockNumber": "0x2b33d17",
                "contractAddress": null,
                "cumulativeGasUsed": "0xcbb4b6",
                "effectiveGasPrice": "0x18523b0032",
                "from": "0xd5ed26d93129a8b51ac54b40477327f6511824b6",
                "gasUsed": "0x21cc9",
                "logs": [],
                "logsBloom": "0x00200000000000000000000080000000000800000008000000000000000000000000000000000000000000100000000000008000000000000000004000000000000000080000480000000008000000a00000040000800000000100008000020000200000000000000020000000000000000000000000000180000490200000000001000000000000000000000000000000000001000000080000004000000000200000000000000000000000000004004040000000000000000000000000004008000002000000000021000000000000000000000000801000108000000000000040008000200000000400000000000000000000000000400000000008100800",
                "status": "0x1",
                "to": "0x1111111254eeb25477b68fb85ed929f73a960582",
                "transactionHash": id,
                "transactionIndex": "0x53",
                "type": "0x2",
                ...receipt
            })
        });
    }

    /**
     * Mock all block number queries.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forBlockNumber() {
        return new BlockNumberRuleBuilder(this.mockttpServer.addRequestRule);
    }

    /**
     * Mock all chain id queries.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forChainId() {
        return new ChainIdRuleBuilder(this.mockttpServer.addRequestRule);
    }

    /**
     * Mock all gas price queries.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forGasPrice() {
        return new GasPriceRuleBuilder(this.mockttpServer.addRequestRule);
    }

    /**
     * Query the list of requests seen by this node. This returns a promise, resolving
     * to an array of objects containing `method` (the Ethereum method called),
     * `parameters` (the method parameters) and `rawRequest` (the full raw HTTP request data).
     */
    getSeenRequests(): Promise<Array<{
        rawRequest: Mockttp.CompletedRequest;
        method?: string;
        params?: any[];
    }>> {
        return Promise.all(this.seenRequests.map(async (request) => {
            return {
                rawRequest: request,
                ...(await request.body.getJson())
            };
        }));
    }

    /**
     * Query the list of requests seen by this node for a specific method.
     *
     * This returns a promise, resolving to an array of objects containing `method` (the Ethereum
     * method called), `parameters` (the method parameters) and `rawRequest` (the full raw HTTP
     * request data).
     */
    async getSeenMethodCalls(methodName: string) {
        return (await this.getSeenRequests())
            .filter(({ method }) => method === methodName);
    }

}

/**
 * The type of the raw JSON response for a transaction receipt.
 *
 * Note that unlike Web3-Core's TransactionReceipt and similar, this is the raw data, so
 * does not include processed formats (e.g. numbers, instead of hex strings) etc.
 */
export interface RawTransactionReceipt {
    status: string;
    type: string;
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string;
    contractAddress?: string;
    cumulativeGasUsed: string;
    gasUsed: number;
    effectiveGasPrice: string;
    logs: never[]; // Not supported, for now
}
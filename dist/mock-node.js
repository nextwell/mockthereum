"use strict";
/*
 * SPDX-FileCopyrightText: 2022 Tim Perry <tim@httptoolkit.tech>
 * SPDX-License-Identifier: Apache-2.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockthereumNode = void 0;
const Mockttp = __importStar(require("mockttp"));
const contract_rule_builder_1 = require("./contract-rule-builder");
const jsonrpc_1 = require("./jsonrpc");
const single_value_rule_builders_1 = require("./single-value-rule-builders");
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
class MockthereumNode {
    constructor(mockttpServer, options = {}) {
        this.mockttpServer = mockttpServer;
        this.options = options;
        this.seenRequests = [];
        this.onRequest = (request) => {
            this.seenRequests.push(request);
        };
    }
    /**
     * The node must be started before use. Starting the node resets it, removing any
     * rules that may have been added previously and configuring default behaviours
     * for unmatched requests.
     *
     * This method returns a promise, which you should wait for to ensure the node
     * is fully started before using it.
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.reset();
            yield this.mockttpServer.start();
            yield this.addBaseRules();
        });
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
    addBaseRules() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                this.mockttpServer.on('request', this.onRequest),
                ...(!this.options.unmatchedRequests || this.options.unmatchedRequests === 'stub'
                    ? [
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_chainId')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcResponseHandler("0x1")
                        }),
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_getTransactionCount')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcResponseHandler("0x1")
                        }),
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_getCode')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcResponseHandler("0x")
                        }),
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_blockNumber')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcResponseHandler("0x132332e")
                        }),
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_call')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcErrorResponseHandler("No Mockthereum rules found matching Ethereum contract call")
                        }),
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_sendTransaction')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcErrorResponseHandler("No Mockthereum rules found matching Ethereum transaction")
                        }),
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_sendRawTransaction')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcErrorResponseHandler("No Mockthereum rules found matching Ethereum transaction")
                        }),
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_getTransactionReceipt')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcResponseHandler(null)
                        }),
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_getBalance')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcResponseHandler("0x0")
                        }),
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_blockNumber')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcResponseHandler("0x1")
                        }),
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_getBlockByNumber')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcResponseHandler(null)
                        }),
                        this.mockttpServer.addRequestRule({
                            matchers: [new jsonrpc_1.RpcCallMatcher('eth_gasPrice')],
                            priority: Mockttp.RulePriority.FALLBACK,
                            handler: new jsonrpc_1.RpcResponseHandler(`0x${(1000).toString(16)}`)
                        })
                    ]
                    : [
                        this.mockttpServer.forUnmatchedRequest()
                            .thenForwardTo(this.options.unmatchedRequests.proxyTo)
                    ])
            ]);
        });
    }
    /**
     * Mock all wallet balance queries, either for all addresses (by default) or for
     * one specific wallet address, if specified.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forBalance(address) {
        return new single_value_rule_builders_1.BalanceRuleBuilder(address, this.mockttpServer.addRequestRule);
    }
    /**
     * Mock all contract calls, either for all contracts (by default) or for
     * one specific contract address, if specified.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forCall(address) {
        return new contract_rule_builder_1.CallRuleBuilder(address, this.mockttpServer.addRequestRule);
    }
    /**
     * Mock all sent transactions.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forSendTransaction() {
        return new contract_rule_builder_1.TransactionRuleBuilder(undefined, this.mockttpServer.addRequestRule, this.addReceipt.bind(this));
    }
    /**
     * Mock all transactions sent to a specific address.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forSendTransactionTo(address) {
        return new contract_rule_builder_1.TransactionRuleBuilder(address, this.mockttpServer.addRequestRule, this.addReceipt.bind(this));
    }
    addReceipt(id, receipt) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mockttpServer.addRequestRule({
                matchers: [new jsonrpc_1.RpcCallMatcher('eth_getTransactionReceipt', [id])],
                handler: new jsonrpc_1.RpcResponseHandler(Object.assign({ status: '0x1', transactionHash: id, blockNumber: '0x100', blockHash: '0x1', from: '0x0', to: '0x0', cumulativeGasUsed: '0x1', gasUsed: '0x1', effectiveGasPrice: '0x0', contractAddress: null, logs: [], logsBloom: '0x0', type: '0x0' }, receipt))
            });
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
        return new single_value_rule_builders_1.BlockNumberRuleBuilder(this.mockttpServer.addRequestRule);
    }
    /**
     * Mock all chain id queries.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forChainId() {
        return new single_value_rule_builders_1.ChainIdRuleBuilder(this.mockttpServer.addRequestRule);
    }
    /**
     * Mock all gas price queries.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forGasPrice() {
        return new single_value_rule_builders_1.GasPriceRuleBuilder(this.mockttpServer.addRequestRule);
    }
    /**
     * Query the list of requests seen by this node. This returns a promise, resolving
     * to an array of objects containing `method` (the Ethereum method called),
     * `parameters` (the method parameters) and `rawRequest` (the full raw HTTP request data).
     */
    getSeenRequests() {
        return Promise.all(this.seenRequests.map((request) => __awaiter(this, void 0, void 0, function* () {
            return Object.assign({ rawRequest: request }, (yield request.body.getJson()));
        })));
    }
    /**
     * Query the list of requests seen by this node for a specific method.
     *
     * This returns a promise, resolving to an array of objects containing `method` (the Ethereum
     * method called), `parameters` (the method parameters) and `rawRequest` (the full raw HTTP
     * request data).
     */
    getSeenMethodCalls(methodName) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getSeenRequests())
                .filter(({ method }) => method === methodName);
        });
    }
}
exports.MockthereumNode = MockthereumNode;
//# sourceMappingURL=mock-node.js.map
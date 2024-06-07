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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainIdRuleBuilder = exports.GasPriceRuleBuilder = exports.BlockNumberRuleBuilder = exports.BalanceRuleBuilder = void 0;
const Mockttp = __importStar(require("mockttp"));
const jsonrpc_1 = require("./jsonrpc");
class SingleValueRuleBuilder {
    constructor(addRuleCallback, matchers = []) {
        this.addRuleCallback = addRuleCallback;
        this.matchers = matchers;
    }
    /**
     * Successfully return a given value.
     */
    thenReturn(value) {
        return this.addRuleCallback({
            matchers: this.matchers,
            handler: new jsonrpc_1.RpcResponseHandler(`0x${value.toString(16)}`)
        });
    }
    /**
     * Fail and return an error message.
     */
    thenError(message) {
        return this.addRuleCallback({
            matchers: this.matchers,
            handler: new jsonrpc_1.RpcErrorResponseHandler(message)
        });
    }
    /**
     * Timeout, accepting the request but never returning a response.
     *
     * This method completes the rule definition, and returns a promise that resolves once the rule is active.
     */
    thenTimeout() {
        return this.addRuleCallback({
            matchers: this.matchers,
            handler: new Mockttp.requestHandlerDefinitions.TimeoutHandlerDefinition()
        });
    }
    /**
     * Close the connection immediately after receiving the matching request, without sending any response.
     *
     * This method completes the rule definition, and returns a promise that resolves once the rule is active.
     */
    thenCloseConnection() {
        return this.addRuleCallback({
            matchers: this.matchers,
            handler: new Mockttp.requestHandlerDefinitions.CloseConnectionHandlerDefinition()
        });
    }
}
/**
 * A rule builder to allow defining rules that mock an Ethereum wallet balance.
 */
class BalanceRuleBuilder extends SingleValueRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forBalance()` instead.
     */
    constructor(address, addRuleCallback) {
        if (address) {
            super(addRuleCallback, [new jsonrpc_1.RpcCallMatcher('eth_getBalance', [address])]);
        }
        else {
            super(addRuleCallback, [new jsonrpc_1.RpcCallMatcher('eth_getBalance')]);
        }
    }
}
exports.BalanceRuleBuilder = BalanceRuleBuilder;
/**
 * A rule builder to allow defining rules that mock the current block number.
 */
class BlockNumberRuleBuilder extends SingleValueRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forBlockNumber()` instead.
     */
    constructor(addRuleCallback) {
        super(addRuleCallback, [new jsonrpc_1.RpcCallMatcher('eth_blockNumber')]);
    }
}
exports.BlockNumberRuleBuilder = BlockNumberRuleBuilder;
/**
 * A rule builder to allow defining rules that mock the current gas price.
 */
class GasPriceRuleBuilder extends SingleValueRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forGasPrice()` instead.
     */
    constructor(addRuleCallback) {
        super(addRuleCallback, [new jsonrpc_1.RpcCallMatcher('eth_gasPrice')]);
    }
}
exports.GasPriceRuleBuilder = GasPriceRuleBuilder;
/**
 * A rule builder to allow defining rules that mock the current chain id.
 */
class ChainIdRuleBuilder extends SingleValueRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forChainId()` instead.
     */
    constructor(addRuleCallback) {
        super(addRuleCallback, [new jsonrpc_1.RpcCallMatcher('eth_chainId')]);
    }
}
exports.ChainIdRuleBuilder = ChainIdRuleBuilder;
//# sourceMappingURL=single-value-rule-builders.js.map
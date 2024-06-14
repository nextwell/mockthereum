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
exports.TransactionRuleBuilder = exports.CallRuleBuilder = void 0;
const Mockttp = __importStar(require("mockttp"));
const uuid_1 = require("uuid");
const abi_1 = require("./abi");
const jsonrpc_1 = require("./jsonrpc");
const mocked_contract_1 = require("./mocked-contract");
class ContractRuleBuilder {
    constructor(addRuleCallback, matchers = []) {
        this.addRuleCallback = addRuleCallback;
        this.matchers = matchers;
    }
    buildRule(handler) {
        return __awaiter(this, void 0, void 0, function* () {
            const mockedEndpoint = yield this.addRuleCallback({ matchers: this.matchers, handler });
            return new mocked_contract_1.MockedContract(mockedEndpoint, this.paramTypes);
        });
    }
    /**
     * Only match requests for a specific function, provided here as a function signature string.
     */
    forFunction(signature) {
        var _a;
        const func = (0, abi_1.parseFunctionSignature)(signature);
        this.paramTypes = func.inputs.map(i => i.type);
        this.returnTypes = signature.includes(" returns ")
            ? (_a = func.outputs) === null || _a === void 0 ? void 0 : _a.map(i => i.type)
            : undefined; // When returns is missing, outputs is [], so we have to force undefine it
        const encodedSignature = (0, abi_1.encodeFunctionSignature)(func);
        this.matchers.push(new Mockttp.matchers.CallbackMatcher((req) => __awaiter(this, void 0, void 0, function* () {
            const jsonBody = yield req.body.getJson();
            return jsonBody.params[0].data.startsWith(encodedSignature);
        })));
        return this;
    }
    withParams(...args) {
        const [types, params] = (args.length === 1)
            ? [this.paramTypes, args[0]]
            : args;
        if (!types) {
            throw new Error("If no function signature was provided with forFunction, withParams must be called " +
                "with a paramTypes array as the first argument");
        }
        if (types) {
            this.paramTypes = types;
        }
        this.matchers.push(new Mockttp.matchers.CallbackMatcher((req) => __awaiter(this, void 0, void 0, function* () {
            const jsonBody = yield req.body.getJson();
            return jsonBody.params[0].data.slice(10) == (0, abi_1.encodeAbi)(types, params).slice(2);
        })));
        return this;
    }
    /**
     * Timeout, accepting the request but never returning a response.
     *
     * This method completes the rule definition, and returns a promise that resolves to a MockedContract
     * once the rule is active. The MockedContract can be used later to query the seen requests that this
     * rule has matched.
     */
    thenTimeout() {
        return this.buildRule(new Mockttp.requestHandlerDefinitions.TimeoutHandlerDefinition());
    }
    /**
     * Close the connection immediately after receiving the matching request, without sending any response.
     *
     * This method completes the rule definition, and returns a promise that resolves to a MockedContract
     * once the rule is active. The MockedContract can be used later to query the seen requests that this
     * rule has matched.
     */
    thenCloseConnection() {
        return this.buildRule(new Mockttp.requestHandlerDefinitions.CloseConnectionHandlerDefinition());
    }
}
class CallRuleBuilder extends ContractRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forCall()` instead.
     */
    constructor(targetAddress, // A specific to: address
    addRuleCallback) {
        if (targetAddress) {
            super(addRuleCallback, [new jsonrpc_1.RpcCallMatcher('eth_call', [{
                        to: targetAddress
                    }])]);
        }
        else {
            super(addRuleCallback, [new jsonrpc_1.RpcCallMatcher('eth_call')]);
        }
    }
    thenReturn(...args) {
        let types;
        let values;
        if (args.length === 1) {
            if (!this.returnTypes) {
                throw new Error("thenReturn() must be called with an outputTypes array as the first argument, or " +
                    "forFunction() must be called first with a return signature");
            }
            types = this.returnTypes;
            if (Array.isArray(args[0])) {
                values = args[0];
            }
            else {
                values = [args[0]];
            }
        }
        else if (!Array.isArray(args[0])) {
            types = [args[0]];
            values = [args[1]];
        }
        else {
            types = args[0];
            values = args[1];
        }
        return this.buildRule(new jsonrpc_1.RpcResponseHandler((0, abi_1.encodeAbi)(types, values)));
    }
    /**
     * Return an error, rejecting the contract call with the provided error message.
     *
     * This method completes the rule definition, and returns a promise that resolves to a MockedContract
     * once the rule is active. The MockedContract can be used later to query the seen requests that this
     * rule has matched.
     */
    thenRevert(errorMessage) {
        return this.buildRule(new jsonrpc_1.RpcErrorResponseHandler(`VM Exception while processing transaction: revert ${errorMessage}`, {
            name: 'CallError',
            data: `0x08c379a0${ // String type prefix
            (0, abi_1.encodeAbi)(['string'], [errorMessage]).slice(2)}`
        }));
    }
}
exports.CallRuleBuilder = CallRuleBuilder;
class TransactionRuleBuilder extends ContractRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forSendTransaction()` or
     * `mockNode.forSendTransactionTo()` instead.
     */
    constructor(targetAddress, // A specific to: address
    addRuleCallback, addReceiptCallback) {
        if (targetAddress) {
            super(addRuleCallback, [
                new jsonrpc_1.RpcCallMatcher('eth_sendRawTransaction', [{
                        to: targetAddress
                    }])
            ]);
        }
        else {
            super(addRuleCallback, [new jsonrpc_1.RpcCallMatcher('eth_sendRawTransaction')]);
        }
        this.addReceiptCallback = addReceiptCallback;
    }
    /**
     * Return a successful transaction submission, with a random transaction id, and provide the
     * given successfully completed transaction receipt when the transaction status is queried later.
     *
     * The receipt can be any subset of the Ethereum receipt fields, and default values for a successful
     * transaction will be used for any missing fields.
     *
     * This method completes the rule definition, and returns a promise that resolves to a MockedContract
     * once the rule is active. The MockedContract can be used later to query the seen requests that this
     * rule has matched.
     */
    thenSucceed(receipt = {}) {
        return this.buildRule(new Mockttp.requestHandlerDefinitions.CallbackHandlerDefinition((req) => __awaiter(this, void 0, void 0, function* () {
            // 64 char random hex id:
            const transactionId = `0x${(0, uuid_1.v4)().replace(/-/g, '')}${(0, uuid_1.v4)().replace(/-/g, '')}`;
            const body = yield req.body.getJson();
            yield this.addReceiptCallback(transactionId, Object.assign({ status: '0x1', from: body.params[0].from, to: body.params[0].to }, receipt));
            return {
                headers: { 'transfer-encoding': 'chunked', 'connection': 'keep-alive' },
                json: {
                    jsonrpc: "2.0",
                    id: body.id,
                    result: transactionId
                }
            };
        })));
    }
    /**
     * Return a successful transaction submission, with a random transaction id, and provide the
     * given failed & revert transaction receipt when the transaction status is queried later.
     *
     * The receipt can be any subset of the Ethereum receipt fields, and default values for a failed
     * transaction will be used for any missing fields.
     *
     * This method completes the rule definition, and returns a promise that resolves to a MockedContract
     * once the rule is active. The MockedContract can be used later to query the seen requests that this
     * rule has matched.
     */
    thenRevert(receipt = {}) {
        return this.buildRule(new Mockttp.requestHandlerDefinitions.CallbackHandlerDefinition((req) => __awaiter(this, void 0, void 0, function* () {
            // 64 char random hex id:
            const transactionId = `0x${(0, uuid_1.v4)().replace(/-/g, '')}${(0, uuid_1.v4)().replace(/-/g, '')}`;
            const body = yield req.body.getJson();
            yield this.addReceiptCallback(transactionId, Object.assign({ status: '0x', type: '0x2', from: body.params[0].from, to: body.params[0].to }, receipt));
            return {
                headers: { 'transfer-encoding': 'chunked', 'connection': 'keep-alive' },
                json: {
                    jsonrpc: "2.0",
                    id: body.id,
                    result: transactionId
                }
            };
        })));
    }
    /**
     * Reject the transaction submission immediately with the given error message and properties.
     *
     * This method completes the rule definition, and returns a promise that resolves to a MockedContract
     * once the rule is active. The MockedContract can be used later to query the seen requests that this
     * rule has matched.
     */
    thenFailImmediately(errorMessage, errorProperties = {}) {
        return this.buildRule(new jsonrpc_1.RpcErrorResponseHandler(errorMessage, errorProperties));
    }
}
exports.TransactionRuleBuilder = TransactionRuleBuilder;
//# sourceMappingURL=contract-rule-builder.js.map
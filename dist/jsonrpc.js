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
exports.RpcErrorResponseHandler = exports.RpcResponseHandler = exports.RpcCallMatcher = void 0;
const Mockttp = __importStar(require("mockttp"));
const ethers = __importStar(require("ethers"));
class RpcCallMatcher extends Mockttp.matchers.JsonBodyFlexibleMatcher {
    constructor(method, params = []) {
        super({
            jsonrpc: "2.0",
            method,
            params
        });
    }
    matches(request) {
        const _super = Object.create(null, {
            matches: { get: () => super.matches }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const receivedBody = yield (request.body.asJson().catch(() => undefined));
            if (receivedBody === undefined)
                return false;
            const tx = ethers.utils.parseTransaction(receivedBody.params[0]);
            if (tx)
                request.params[0] = tx;
            return _super.matches.call(this, request);
        });
    }
}
exports.RpcCallMatcher = RpcCallMatcher;
class RpcResponseHandler extends Mockttp.requestHandlerDefinitions.CallbackHandlerDefinition {
    constructor(result) {
        super((req) => __awaiter(this, void 0, void 0, function* () {
            return ({
                headers: { 'transfer-encoding': 'chunked', 'connection': 'keep-alive' },
                json: {
                    jsonrpc: "2.0",
                    id: (yield req.body.getJson()).id,
                    result
                }
            });
        }));
    }
}
exports.RpcResponseHandler = RpcResponseHandler;
class RpcErrorResponseHandler extends Mockttp.requestHandlerDefinitions.CallbackHandlerDefinition {
    constructor(message, options = {}) {
        super((req) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            return ({
                headers: { 'transfer-encoding': 'chunked', 'connection': 'keep-alive' },
                json: {
                    jsonrpc: "2.0",
                    id: (yield req.body.getJson()).id,
                    error: {
                        message,
                        data: (_a = options.data) !== null && _a !== void 0 ? _a : '0x',
                        code: (_b = options.code) !== null && _b !== void 0 ? _b : -32099,
                        name: (_c = options.name) !== null && _c !== void 0 ? _c : undefined,
                    }
                }
            });
        }));
    }
}
exports.RpcErrorResponseHandler = RpcErrorResponseHandler;
//# sourceMappingURL=jsonrpc.js.map
"use strict";
/*
 * SPDX-FileCopyrightText: 2022 Tim Perry <tim@httptoolkit.tech>
 * SPDX-License-Identifier: Apache-2.0
 */
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
exports.MockedContract = void 0;
const abi_1 = require("./abi");
/**
 * A mocked contract. This is returned by a rule builder when the rule is created, and can
 * be used to query the requests that have been seen by the mock rule.
 */
class MockedContract {
    constructor(endpoint, paramTypes) {
        this.endpoint = endpoint;
        this.paramTypes = paramTypes;
    }
    /**
     * Returns a promise that resolves to an array of requests seen by the mock rule.
     *
     * For each request, this includes:
     * - `to`: the contract address
     * - `from`: the sender address, if used, or undefined for contract calls
     * - `value`: the value sent, if any, or undefined for contract calls
     * - `params`: the decoded params, if a function signature or param types were provided
     *   using `forFunction` or `withParams` methods when creating the rule.
     * - `rawRequest` - the raw HTTP request sent to the node
     */
    getRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            const requests = yield this.endpoint.getSeenRequests();
            return Promise.all(requests.map((req) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const jsonBody = (yield req.body.getJson());
                const { data, value, to, from } = (_a = jsonBody === null || jsonBody === void 0 ? void 0 : jsonBody.params[0]) !== null && _a !== void 0 ? _a : {};
                const encodedCallParams = data ? `0x${data.slice(10)}` : undefined;
                return {
                    rawRequest: req,
                    to,
                    from,
                    value,
                    params: (this.paramTypes && encodedCallParams)
                        ? (0, abi_1.decodeAbi)(this.paramTypes, encodedCallParams)
                        : undefined
                };
            })));
        });
    }
}
exports.MockedContract = MockedContract;
//# sourceMappingURL=mocked-contract.js.map
"use strict";
/*
 * SPDX-FileCopyrightText: 2022 Tim Perry <tim@httptoolkit.tech>
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeFunctionSignature = exports.parseFunctionSignature = exports.decodeAbi = exports.encodeAbi = void 0;
const hash_1 = require("@ethersproject/hash");
const abi_1 = require("@ethersproject/abi");
exports.encodeAbi = abi_1.defaultAbiCoder.encode.bind(abi_1.defaultAbiCoder);
exports.decodeAbi = abi_1.defaultAbiCoder.decode.bind(abi_1.defaultAbiCoder);
function parseFunctionSignature(functionDefinition) {
    return abi_1.FunctionFragment.from(functionDefinition.trim().replace(/^function /, '') // Be flexible with input format
    );
}
exports.parseFunctionSignature = parseFunctionSignature;
function encodeFunctionSignature(functionDefinition) {
    if (!(functionDefinition instanceof abi_1.FunctionFragment)) {
        functionDefinition = parseFunctionSignature(functionDefinition);
    }
    return (0, hash_1.id)(functionDefinition.format()).slice(0, 10);
}
exports.encodeFunctionSignature = encodeFunctionSignature;
//# sourceMappingURL=abi.js.map
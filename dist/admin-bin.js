#!/usr/bin/env node
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
const childProcess = require("child_process");
const Mockthereum = require("./main");
handleArgs(process.argv).catch((e) => {
    console.error(e);
    process.exit(1);
});
function handleArgs(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const remainingArgs = args.slice(2);
        let nextArg = remainingArgs.shift();
        while (nextArg) {
            if (nextArg === '-c') {
                yield runCommandWithServer(remainingArgs.join(' '));
                return;
            }
            else {
                break;
            }
        }
        console.log("Usage: mockthereum -c <test command>");
        process.exit(1);
    });
}
function runCommandWithServer(command) {
    return __awaiter(this, void 0, void 0, function* () {
        const server = Mockthereum.getAdminServer();
        yield server.start();
        let realProcess = childProcess.spawn(command, [], {
            shell: true,
            stdio: 'inherit'
        });
        realProcess.on('error', (error) => {
            server.stop().then(function () {
                console.error(error);
                process.exit(1);
            });
        });
        realProcess.on('exit', (code, signal) => {
            server.stop().then(function () {
                if (code == null) {
                    console.error('Executed process exited due to signal: ' + signal);
                    process.exit(1);
                }
                else {
                    process.exit(code);
                }
            });
        });
    });
}
//# sourceMappingURL=admin-bin.js.map
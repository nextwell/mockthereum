import * as Mockttp from 'mockttp';
import { RpcErrorProperties } from './jsonrpc';
import { RawTransactionReceipt } from './mock-node';
import { MockedContract } from './mocked-contract';
declare class ContractRuleBuilder {
    private addRuleCallback;
    protected matchers: Mockttp.matchers.RequestMatcher[];
    constructor(addRuleCallback: (rule: Mockttp.RequestRuleData) => Promise<Mockttp.MockedEndpoint>, matchers?: Mockttp.matchers.RequestMatcher[]);
    private paramTypes;
    protected returnTypes: string[] | undefined;
    protected buildRule(handler: Mockttp.requestHandlerDefinitions.RequestHandlerDefinition): Promise<MockedContract>;
    /**
     * Only match requests for a specific function, provided here as a function signature string.
     */
    forFunction(signature: string): this;
    /**
     * Only match requests that send certain parameters. You must provide both a types
     * and a parameters array, unless you've already called `forFunction()` and
     * provided the function signature there.
     */
    withParams(params: Array<unknown>): this;
    withParams(types: Array<string>, params: Array<unknown>): this;
    /**
     * Timeout, accepting the request but never returning a response.
     *
     * This method completes the rule definition, and returns a promise that resolves to a MockedContract
     * once the rule is active. The MockedContract can be used later to query the seen requests that this
     * rule has matched.
     */
    thenTimeout(): Promise<MockedContract>;
    /**
     * Close the connection immediately after receiving the matching request, without sending any response.
     *
     * This method completes the rule definition, and returns a promise that resolves to a MockedContract
     * once the rule is active. The MockedContract can be used later to query the seen requests that this
     * rule has matched.
     */
    thenCloseConnection(): Promise<MockedContract>;
}
export declare class CallRuleBuilder extends ContractRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forCall()` instead.
     */
    constructor(targetAddress: undefined | `0x${string}`, // A specific to: address
    addRuleCallback: (rule: Mockttp.RequestRuleData) => Promise<Mockttp.MockedEndpoint>);
    /**
     * Return one or more values from the contract call. You must provide both a types and a values array,
     * unless you've already called `forFunction()` and provided a function signature there that
     * includes return types.
     *
     * This method completes the rule definition, and returns a promise that resolves to a MockedContract
     * once the rule is active. The MockedContract can be used later to query the seen requests that this
     * rule has matched.
     */
    thenReturn(outputType: string, value: unknown): Promise<MockedContract>;
    thenReturn(values: Array<unknown>): Promise<MockedContract>;
    thenReturn(value: unknown): Promise<MockedContract>;
    thenReturn(outputTypes: Array<string>, values: Array<unknown>): Promise<MockedContract>;
    /**
     * Return an error, rejecting the contract call with the provided error message.
     *
     * This method completes the rule definition, and returns a promise that resolves to a MockedContract
     * once the rule is active. The MockedContract can be used later to query the seen requests that this
     * rule has matched.
     */
    thenRevert(errorMessage: string): Promise<MockedContract>;
}
export declare class TransactionRuleBuilder extends ContractRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forSendTransaction()` or
     * `mockNode.forSendTransactionTo()` instead.
     */
    constructor(params: undefined | object, // A specific params
    addRuleCallback: (rule: Mockttp.RequestRuleData) => Promise<Mockttp.MockedEndpoint>, addReceiptCallback: (id: string, receipt: Partial<RawTransactionReceipt>) => Promise<void>);
    private addReceiptCallback;
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
    thenSucceed(receipt?: Partial<RawTransactionReceipt>): Promise<MockedContract>;
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
    thenRevert(receipt?: Partial<RawTransactionReceipt>): Promise<MockedContract>;
    /**
     * Reject the transaction submission immediately with the given error message and properties.
     *
     * This method completes the rule definition, and returns a promise that resolves to a MockedContract
     * once the rule is active. The MockedContract can be used later to query the seen requests that this
     * rule has matched.
     */
    thenFailImmediately(errorMessage: string, errorProperties?: RpcErrorProperties): Promise<MockedContract>;
}
export {};

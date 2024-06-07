import * as Mockttp from 'mockttp';
declare class SingleValueRuleBuilder {
    private addRuleCallback;
    private matchers;
    constructor(addRuleCallback: (rule: Mockttp.RequestRuleData) => Promise<Mockttp.MockedEndpoint>, matchers?: Mockttp.matchers.RequestMatcher[]);
    /**
     * Successfully return a given value.
     */
    thenReturn(value: number): Promise<Mockttp.MockedEndpoint>;
    /**
     * Fail and return an error message.
     */
    thenError(message: string): Promise<Mockttp.MockedEndpoint>;
    /**
     * Timeout, accepting the request but never returning a response.
     *
     * This method completes the rule definition, and returns a promise that resolves once the rule is active.
     */
    thenTimeout(): Promise<Mockttp.MockedEndpoint>;
    /**
     * Close the connection immediately after receiving the matching request, without sending any response.
     *
     * This method completes the rule definition, and returns a promise that resolves once the rule is active.
     */
    thenCloseConnection(): Promise<Mockttp.MockedEndpoint>;
}
/**
 * A rule builder to allow defining rules that mock an Ethereum wallet balance.
 */
export declare class BalanceRuleBuilder extends SingleValueRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forBalance()` instead.
     */
    constructor(address: string | undefined, addRuleCallback: (rule: Mockttp.RequestRuleData) => Promise<Mockttp.MockedEndpoint>);
}
/**
 * A rule builder to allow defining rules that mock the current block number.
 */
export declare class BlockNumberRuleBuilder extends SingleValueRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forBlockNumber()` instead.
     */
    constructor(addRuleCallback: (rule: Mockttp.RequestRuleData) => Promise<Mockttp.MockedEndpoint>);
}
/**
 * A rule builder to allow defining rules that mock the current gas price.
 */
export declare class GasPriceRuleBuilder extends SingleValueRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forGasPrice()` instead.
     */
    constructor(addRuleCallback: (rule: Mockttp.RequestRuleData) => Promise<Mockttp.MockedEndpoint>);
}
/**
 * A rule builder to allow defining rules that mock the current chain id.
 */
export declare class ChainIdRuleBuilder extends SingleValueRuleBuilder {
    /**
     * This builder should not be constructed directly. Call `mockNode.forChainId()` instead.
     */
    constructor(addRuleCallback: (rule: Mockttp.RequestRuleData) => Promise<Mockttp.MockedEndpoint>);
}
export {};

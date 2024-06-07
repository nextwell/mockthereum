import * as Mockttp from 'mockttp';
import { CallRuleBuilder, TransactionRuleBuilder } from './contract-rule-builder';
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
    unmatchedRequests?: 'stub' | {
        proxyTo: string;
    };
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
export declare class MockthereumNode {
    private mockttpServer;
    private options;
    constructor(mockttpServer: Mockttp.Mockttp, options?: MockthereumOptions);
    private seenRequests;
    /**
     * The node must be started before use. Starting the node resets it, removing any
     * rules that may have been added previously and configuring default behaviours
     * for unmatched requests.
     *
     * This method returns a promise, which you should wait for to ensure the node
     * is fully started before using it.
     */
    start(): Promise<void>;
    /**
     * Stop the node when you're finished with it to close down the underlying server and
     * any remaining connections.
     *
     * This method returns a promise, which you should wait for to ensure the node
     * is fully stopped, especially if you intend to start it again later.
     */
    stop(): Promise<void>;
    reset(): void;
    /**
     * Get the URL for this Mockthereum node. You can pass this directly to libraries like
     * Web3 as your Ethereum RPC endpoint to intercept all Web3 Ethereum interactions.
     */
    get url(): string;
    private addBaseRules;
    private onRequest;
    /**
     * Mock all wallet balance queries, either for all addresses (by default) or for
     * one specific wallet address, if specified.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forBalance(address?: `0x${string}`): BalanceRuleBuilder;
    /**
     * Mock all contract calls, either for all contracts (by default) or for
     * one specific contract address, if specified.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forCall(address?: `0x${string}`): CallRuleBuilder;
    /**
     * Mock all sent transactions.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forSendTransaction(): TransactionRuleBuilder;
    /**
     * Mock all transactions sent to a specific address.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forSendTransactionTo(address: `0x${string}`): TransactionRuleBuilder;
    private addReceipt;
    /**
     * Mock all block number queries.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forBlockNumber(): BlockNumberRuleBuilder;
    /**
     * Mock all chain id queries.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forChainId(): ChainIdRuleBuilder;
    /**
     * Mock all gas price queries.
     *
     * This returns a rule builder that you can use to configure the rule. Call a
     * `thenX()` method and wait for the returned promise to complete the rule and
     * activate it.
     */
    forGasPrice(): GasPriceRuleBuilder;
    /**
     * Query the list of requests seen by this node. This returns a promise, resolving
     * to an array of objects containing `method` (the Ethereum method called),
     * `parameters` (the method parameters) and `rawRequest` (the full raw HTTP request data).
     */
    getSeenRequests(): Promise<Array<{
        rawRequest: Mockttp.CompletedRequest;
        method?: string;
        params?: any[];
    }>>;
    /**
     * Query the list of requests seen by this node for a specific method.
     *
     * This returns a promise, resolving to an array of objects containing `method` (the Ethereum
     * method called), `parameters` (the method parameters) and `rawRequest` (the full raw HTTP
     * request data).
     */
    getSeenMethodCalls(methodName: string): Promise<{
        rawRequest: Mockttp.CompletedRequest;
        method?: string | undefined;
        params?: any[] | undefined;
    }[]>;
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
    logs: never[];
}

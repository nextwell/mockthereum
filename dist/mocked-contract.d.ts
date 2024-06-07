import * as Mockttp from 'mockttp';
/**
 * A mocked contract. This is returned by a rule builder when the rule is created, and can
 * be used to query the requests that have been seen by the mock rule.
 */
export declare class MockedContract {
    private endpoint;
    private paramTypes?;
    constructor(endpoint: Mockttp.MockedEndpoint, paramTypes?: string[] | undefined);
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
    getRequests(): Promise<{
        rawRequest: Mockttp.CompletedRequest;
        to: any;
        from: any;
        value: any;
        params: import("@ethersproject/abi").Result | undefined;
    }[]>;
}

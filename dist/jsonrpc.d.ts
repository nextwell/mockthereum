import * as Mockttp from 'mockttp';
export declare class RpcCallMatcher extends Mockttp.matchers.JsonBodyFlexibleMatcher {
    constructor(method: string, params?: Array<unknown>);
}
export declare class RpcCallTransactionRawMatcher extends Mockttp.matchers.JsonBodyFlexibleMatcher {
    constructor(method: string, params?: Array<unknown>);
    matches(request: any): Promise<boolean>;
}
export declare class RpcRevertCallTransactionRawMatcher extends Mockttp.matchers.JsonBodyFlexibleMatcher {
    constructor(method: string, params?: Array<unknown>);
    matches(request: any): Promise<boolean>;
}
export declare class RpcResponseHandler extends Mockttp.requestHandlerDefinitions.CallbackHandlerDefinition {
    constructor(result: unknown);
}
export interface RpcErrorProperties {
    code?: number;
    name?: string;
    data?: `0x${string}`;
}
export declare class RpcErrorResponseHandler extends Mockttp.requestHandlerDefinitions.CallbackHandlerDefinition {
    constructor(message: string, options?: RpcErrorProperties);
}

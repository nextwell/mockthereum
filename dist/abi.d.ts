import { FunctionFragment } from '@ethersproject/abi';
export declare const encodeAbi: (types: readonly (string | import("@ethersproject/abi").ParamType)[], values: readonly any[]) => string;
export declare const decodeAbi: (types: readonly (string | import("@ethersproject/abi").ParamType)[], data: import("@ethersproject/bytes").BytesLike, loose?: boolean | undefined) => import("@ethersproject/abi").Result;
export declare function parseFunctionSignature(functionDefinition: string): FunctionFragment;
export declare function encodeFunctionSignature(functionDefinition: string | FunctionFragment): string;

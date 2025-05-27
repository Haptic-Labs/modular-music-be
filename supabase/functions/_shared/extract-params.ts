export type ExtractParamKeys<S extends string> =
  S extends `:${infer Param}/${infer Rest}`
    ? Param | ExtractParamKeys<`/${Rest}`>
    : S extends `:${infer Param}`
    ? Param
    : never;

export type ExtractParams<S extends string> = {
  [K in ExtractParamKeys<S>]: string;
};

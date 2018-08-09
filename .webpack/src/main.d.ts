export declare type ILogStrategies = "after" | "before-after";
/**
 * Builds a set of properties, `IHookProperties`, that are passed into an `out` function. By default the properties
 * are formed into a message using JSON.stringify and `out` to `console.log`.
 *
 * You may override the default `hook` method to format the message output however you like and override
 * the `out` method with any function matching this interface: `(message?: any, ...optionalParams: any[]) => void`.
 *
 * You can also set a logging strategy. By default it logs after function execution. You can set strategy to 'before-after'
 * to make it log before and after function execution.
 *
 * @export
 * @param {ILogOptions} [opts={}]
 * @returns {((target) => void)}
 */
export default function log({hook, out, strategy}?: ILogOptions): ((target) => void);
/**
 * An options interface to override the default logging message builder and output methods.
 *
 * @export
 * @interface ILogOptions
 */
export interface ILogOptions {
    hook?: (logProps: IHookProperties) => string;
    out?: (message?: any, ...optionalParams: any[]) => void;
    strategy?: ILogStrategies;
}
export declare type ILogTime = "before" | "after";
/**
 * The properties that the `hook` method receives to build a message.
 *
 * @export
 * @interface IHookProperties
 */
export interface IHookProperties {
    when: ILogTime;
    timestamp: number;
    className: string;
    methodName: string;
    arguments: {
        [parameterName: string]: any;
    };
    properties: {
        [property: string]: any;
    };
    result: any;
}

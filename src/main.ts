import JSON = require("circular-json");

export interface IHasTsLogClassLogger {
  tsLogClassLogger: (message?: any, ...optionalParams: any[]) => void;
}

export type ILogStrategies = "after" | "before-after"

/**
 * Builds a set of properties, `IHookProperties`, that are passed into an `out` function. By default the properties
 * are formed into a message using JSON.stringify and `out` to `console.log`.
 *
 * You may override the default `hook` method to format the message output however you like and override
 * the `out` method with any function matching this interface: `(message?: any, ...optionalParams: any[]) => void`.
 * 
 * You can implement IHasTsLogClassLogger interface and tsLogClassLogger will be used for logging instead. It overrides `out` property.
 * 
 * You can also set a logging strategy. By default it logs after function execution. You can set strategy to 'before-after'
 * to make it log before and after function execution.
 *
 * @export
 * @param {ILogOptions} [opts={}]
 * @returns {((target) => void)}
 */
export default function log(
  {
    hook = defaultHook,
    out = console.log,
    strategy = "after"
  }: ILogOptions = {}
): ((target) => void) {
  return function (target): void {
    let pt = target.prototype;
    let list: string[] = Object.keys(pt).concat(Object.getOwnPropertyNames(pt)).filter((key, idx, arr) => key !== "constructor" && arr.indexOf(key) === idx);
    list.forEach(key => {
      try {
        const fn = pt[key]
        if (typeof fn === "function") {
          pt[key] = applyMonkeyPatch(target, pt, fn, key, { hook, out, strategy });
        }
      } catch (e) {}
    });
  };
}

/**
 * An options interface to override the default logging message builder and output methods.
 *
 * @export
 * @interface ILogOptions
 */
export interface ILogOptions {
  hook?: (logProps: IHookProperties) => string;
  out?: (message?: any, ...optionalParams: any[]) => void;
  strategy?: ILogStrategies
}

export type ILogTime = "before" | "after"

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
  arguments: any[];
  instance: any;
  result: any;
}

function applyMonkeyPatch(target, prototype, method: Function, methodName: string, opts: ILogOptions): Function {
  return function (...rest): any {
    let instance = this;
    const out = this.tsLogClassLogger || opts.out;
    const doLog = (params: any[], when: ILogTime, val?: any) => {
      out(
        opts.hook({
          when,
          className: instance.constructor.name,
          methodName,
          timestamp: Date.now(),
          arguments: rest,
          instance,
          result: val,
        })
      );
    }
    if (opts.strategy === "before-after") {
      doLog(rest, "before")
    }
    const doLogAfter = (params: any[], result: any) => doLog(params, "after", result)
    try {
      const result = method.apply(instance, rest);
      if (result instanceof Promise) {
        return result.then(val => {
          doLogAfter(rest, val);
          return val;
        }).catch(reason => {
          doLogAfter(rest, reason);
          return Promise.reject(reason);
        });
      }
      doLogAfter(rest, result)
      return result
    } catch (e) {
      doLogAfter(rest, e)
      throw e
    }
  }
}

function defaultHook(props: IHookProperties): string {
  return JSON.stringify(props);
}

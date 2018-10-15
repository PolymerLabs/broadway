const determineScope = () => {
  if ('importScripts' in self) {
    return 'controller';
  } else {
    // TODO(cdata): How do we distinguish a "main" view from a "sub" view?
    return 'view';
  }
};

const $scope = Symbol('scope');

class Logger {
  showScope: boolean = true;
  enabled: boolean = false;
  protected[$scope]: string = determineScope();

  get scope(): string {
    return this[$scope];
  }
}

const scopedMethods = new Set(['log', 'warn', 'error', 'info', 'debug']);

Object.keys(console).forEach(key => {
  const canShowScope = scopedMethods.has(key);

  Object.defineProperty(Logger.prototype, key, {
    value: function(...args: any[]) {
      if (this.enabled) {
        if (this.showScope && canShowScope) {
          args.unshift(`[${this.scope}]`);
        }
        return (console as any)[key](...args);
      }
    }
  });
});

export const logger: any = new Logger();

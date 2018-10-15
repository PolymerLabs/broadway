import {ChannelEvent} from './channel/event.js';
import {Subscription} from './subscription.js';

export type ChannelEventHandler = (event: ChannelEvent) => void;


/**
 * A Channel is a namespace on which events can be directly published or
 * subscribed to.
 */
const $channelEventHandlers = Symbol('channelHandlers');
const $name = Symbol('name');
const $notifyChannelEventHandlers = Symbol('notifyHandlers');
const $dispatchChannelEvent = Symbol('dispatchChannelEvent');

export class Channel {
  protected[$name]: string;
  protected[$channelEventHandlers]: Set<ChannelEventHandler> =
      new Set<ChannelEventHandler>();
  protected[$dispatchChannelEvent]: ChannelEventHandler;

  get name(): string {
    return this[$name];
  }

  constructor(
      name: string,
      $friendNotifyChannelEventHandlers: symbol,
      dispatchChannelEvent: ChannelEventHandler) {
    this[$name] = name;
    this[$dispatchChannelEvent] = dispatchChannelEvent;
    (this as any)[$friendNotifyChannelEventHandlers] = (event: ChannelEvent) =>
        this[$notifyChannelEventHandlers](event);
  }

  dispatch(event: ChannelEvent): void {
    this[$dispatchChannelEvent](event);
  }

  subscribe(handler: ChannelEventHandler): Subscription {
    this[$channelEventHandlers].add(handler);

    return {
      unsubscribe: () => {
        this[$channelEventHandlers].delete(handler);
      }
    };
  }

  [$notifyChannelEventHandlers](event: ChannelEvent) {
    this[$channelEventHandlers].forEach(handler => handler(event));
  }
}

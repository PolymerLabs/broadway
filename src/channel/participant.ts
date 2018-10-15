import {Channel} from '../channel.js';
import {ChannelEvent} from './event.js';


/**
 * ChannelParticipant implements common behavior for classes that publish and/or
 * subscribe to named Channels.
 *
 * A ChannelParticipant must implement the `$propagateChannelEvent` method in
 * order to publish ChannelEvents out to the named Channel.
 *
 * A ChannelParticipant must invoke `$onChannelEvent` to notify local
 * subscribers of an incoming ChannelEvent.
 */
const $channels = Symbol('channels');
const $notifyChannelEventHandlers = Symbol('notifyChannelEventHandlers');
export const $onChannelEvent = Symbol('onChannelEvent');
export const $propagateChannelEvent = Symbol('propagateChannelEvent');

export abstract class ChannelParticipant {
  protected[$channels]: Map<string, Channel> = new Map<string, Channel>();
  protected[$onChannelEvent](channel: string, event: ChannelEvent) {
    if (!this[$channels].has(channel)) {
      return;
    }

    (this[$channels].get(channel) as any)[$notifyChannelEventHandlers](event);
  }

  protected abstract[$propagateChannelEvent](name: string, event: ChannelEvent):
      void;

  /**
   * Join a channel by name.
   *
   * IMPORTANT DESIGN NOTE(cdata): Channels are intended for publishing
   * instantaneous events that should have no direct effect on state (and
   * probably should not have an indirect effect either). If state should change
   * as a result of communication over a channel, try to re-imagine the events
   * as Actions to be dispatched as part of uni-directional state flow.
   */
  joinChannel(name: string): Channel {
    if (!this[$channels].has(name)) {
      this[$channels].set(
          name,
          new Channel(
              name, $notifyChannelEventHandlers, (event: ChannelEvent) => {
                this[$propagateChannelEvent](name, event);
              }));
    }

    return this[$channels].get(name)!;
  }
}

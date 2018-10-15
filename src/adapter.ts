/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {Action} from './action.js';
import {ChannelEvent} from './channel/event.js';
import {$onChannelEvent, $propagateChannelEvent, ChannelParticipant} from './channel/participant.js';
import {ControllerMessage} from './controller/message.js';
import {logger} from './logger.js';
import {MessageBus} from './message-bus.js';
import {ViewMessageBus} from './message-bus/view.js';
import {Message} from './message.js';
import {Subscription} from './subscription.js';


export type StateChangeHandler = (state: any) => void;


/**
 * The Adapter is the API surface that views use to dispatch
 * actions and subscribe to state changes.
 *
 * Adapters communicate with the controller through a dedicated
 * MessageBus.
 */
const $stateChangeHandlers = Symbol('stateChangeHandlers');
const $onStateChanged = Symbol('onStateChanged');
const $messageBus = Symbol('messageBus');
const $subscription = Symbol('subscription');

export const $actions = Symbol('actions');

export class Adapter extends ChannelParticipant {
  protected[$stateChangeHandlers]: Set<StateChangeHandler> =
      new Set<StateChangeHandler>();

  protected[$messageBus]: MessageBus;
  protected[$subscription]: Subscription;

  constructor(controllerUrl: string) {
    super();
    this[$messageBus] = new ViewMessageBus(controllerUrl);
    this[$subscription] = this[$messageBus].subscribe(message => {
      logger.log('Got message from controller', message.type);

      switch (message.type) {
        case ControllerMessage.STATE_INITIALIZED:
          logger.log('Initial state message');
          this[$onStateChanged](message.data);
          break;
        case ControllerMessage.STATE_CHANGED:
          logger.log('State changed message');
          this[$onStateChanged](message.data);
          break;
        case ControllerMessage.CHANNEL_EVENT:
          logger.log('Received channel event');
          this[$onChannelEvent](message.data.channel, message.data.event);
      }
    });
    this[$messageBus].post(new Message(ControllerMessage.VIEW_CONNECTED));
    this[$stateChangeHandlers] = new Set();
  }

  protected[$propagateChannelEvent](name: string, event: ChannelEvent): void {
    this[$messageBus].post(Message.fromChannelEvent(name, event));
  }

  dispatch(action: Action): void {
    this[$messageBus].post(Message.fromAction(action));
  }

  subscribe(stateChangeHandler: StateChangeHandler) {
    this[$stateChangeHandlers].add(stateChangeHandler);

    return {
      unsubscribe: () => this[$stateChangeHandlers].delete(stateChangeHandler)
    };
  }

  protected[$onStateChanged](newState: any) {
    logger.log('New state:', newState);
    this[$stateChangeHandlers].forEach(handler => handler(newState));
  }
}

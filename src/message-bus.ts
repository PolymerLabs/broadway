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

import {Message} from './message.js';
import {Subscription} from './subscription.js';

export type MessageHandler = (message: Message) => void;


/**
 * A MessageBus represents the communication channel between
 * a controller and any number of adapters.
 */
const $handlers = Symbol('handlers');
export const $onMessage = Symbol('onMessage');

export abstract class MessageBus {
  protected[$handlers]: Set<MessageHandler> = new Set<MessageHandler>();

  abstract async post(message: Message|null): Promise<void>;

  subscribe(handler: MessageHandler): Subscription {
    console.log('Adding subscription', self);
    this[$handlers].add(handler);

    return {
      unsubscribe: () => {
        this[$handlers].delete(handler);
      }
    };
  }

  protected[$onMessage](event: MessageEvent) {
    console.log('MessageEvent handler invoked', event);
    const message = Message.fromMessageEvent(event);

    if (message == null) {
      return;
    }

    console.log('Invoking message bus subscribers');
    this[$handlers].forEach(handler => {
      handler(message);
    });
  }
}

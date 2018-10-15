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

import {logger} from '../logger.js';
import {$onMessage, MessageBus} from '../message-bus.js';
import {MessageBusProtocol} from '../message-bus/protocol.js';
import {Message} from '../message.js';


/**
 * The WorkerMessageBus is a specialized MessageBus that broadcasts
 * all messages to all the other MessageBuses that are connected to
 * it.
 */
const $connections = Symbol('connections');
const $acceptConnection = Symbol('acceptConnection');

export class WorkerMessageBus extends MessageBus {
  [$connections]: Set<MessagePort> = new Set<MessagePort>();

  constructor() {
    super();

    self.addEventListener('message', event => {
      logger.log('Worker global message:', event.data);
      if (event.data &&
          event.data === MessageBusProtocol.ESTABLISH_MESSAGE_BUS_CHANNEL &&
          event.ports[0] != null) {
        logger.log('Establishing channel');
        this[$acceptConnection](event.ports[0]);
      }
    });
  }

  private[$acceptConnection](port: MessagePort) {
    this[$connections].add(port);

    try {
      logger.log('Relaying accepted connection to view');
      port.onmessage = (message: MessageEvent) => this[$onMessage](message);
      port.postMessage({type: MessageBusProtocol.CONNECTION_ACCEPTED});
    } catch (error) {
      logger.warn('Unable to accept new connection');
      throw error;
    }
  }

  async post(message: Message|null, connection: MessagePort|null = null):
      Promise<void> {
    logger.log('worker message bus post', message, connection);
    if (message == null) {
      return;
    }

    if (connection != null) {
      connection.postMessage(message!.toJSON());
    } else {
      this[$connections].forEach(port => port.postMessage(message!.toJSON()));
    }
  }
}

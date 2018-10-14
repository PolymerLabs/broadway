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
import {ControllerMessage} from './controller/message.js';
import {MessageBus} from './message-bus.js';
import {WorkerMessageBus} from './message-bus/worker.js';
import {Message} from './message.js';
import {Subscription} from './subscription.js';


export type ActionHandler = (action: Action) => void;


/**
 * The Controller is disseminator of application state and the
 * middleware that converts actions to businessness logic and
 * side-effects.
 *
 * This Controller implementation is assumed to run in a Web Worker.
 * So, it must be bundled with a build step before it can be used
 * (as of this writing, Web Workers cannot be instantiated from
 * module scripts).
 *
 * The Controller listens to inbound Messages on a MessageBus. Some
 * of the Messages are lifecycle related (e.g., "view connected"). Most
 * other messages are expected to represent actions that have been
 * dispatched through Adapters.
 */
const $messageBus = Symbol('messageBus');
const $onMessage = Symbol('onMessage');
const $state = Symbol('state');

const $dispatch = Symbol('dispatch');
const $actionHandlers = Symbol('actionHandlers');

export class Controller {
  protected[$messageBus]: MessageBus = new WorkerMessageBus();
  protected[$actionHandlers]: Set<ActionHandler> = new Set<ActionHandler>();
  protected[$state]: any = null;

  get state() {
    return this[$state];
  }

  constructor() {
    this[$messageBus].subscribe(message => this[$onMessage](message));
  }

  subscribe(handler: ActionHandler): Subscription {
    this[$actionHandlers].add(handler);

    return {
      unsubscribe: () => {
        this[$actionHandlers].delete(handler);
      }
    };
  }

  updateState(newState: any): void {
    console.log('Notifying of new state', newState);
    this[$state] = newState;
    this[$messageBus].post(
        new Message(ControllerMessage.STATE_CHANGED, newState));
  }

  protected[$onMessage](message: Message): void {
    console.log('Got message in controller!', message);
    switch (message.type) {
      case ControllerMessage.VIEW_CONNECTED:
        console.log('View connected to controller!');
        if (this[$state] != null) {
          console.log('Notifying of initial state...');
          this[$messageBus].post(
              new Message(ControllerMessage.STATE_INITIALIZED, this[$state]));
        }
        break;
      case ControllerMessage.ACTION_DISPATCHED:
        const action = message.data;
        this[$dispatch](action);
        break;
      default:
        console.warn(`Unrecognized message in controller: ${message.type}`);
        break;
    }
  }

  protected async[$dispatch](action: Action): Promise<void> {
    this[$actionHandlers].forEach(handler => handler(action));
  }
}

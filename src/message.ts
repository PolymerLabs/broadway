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


/**
 * The Message class wraps all data sent across a MessageBus.
 * Messages can be easily created from plain object Actions
 * and MessageEvents.
 *
 * This class is intended as a stand-in for a protocol
 * normalization layer. Messages may eventually be transmitted
 * over new protocols, so it is useful to have a common
 * target for serialization / deserialization.
 */
const $type = Symbol('type');
const $data = Symbol('data');

export class Message {
  protected[$type]: string;
  protected[$data]?: any;

  static fromAction(action: Action) {
    if (action != null) {
      return new Message(ControllerMessage.ACTION_DISPATCHED, action);
    }

    return null;
  }

  static fromMessageEvent(event: MessageEvent) {
    if (event.data != null && event.data.type != null) {
      const {type, data} = event.data;
      return new Message(type, data);
    }

    return null;
  }

  constructor(type: string, data: any = null) {
    this[$type] = type;
    this[$data] = data;
  }

  get type() {
    return this[$type];
  }
  get data() {
    return this[$data];
  }

  toJSON() {
    const {type, data} = this;
    return {type, data};
  }
}

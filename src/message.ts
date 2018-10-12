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

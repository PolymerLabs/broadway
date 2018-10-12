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
      console.log('Worker global message:', event.data);
      if (event.data &&
          event.data === MessageBusProtocol.ESTABLISH_MESSAGE_BUS_CHANNEL &&
          event.ports[0] != null) {
        console.log('Establishing channel');
        this[$acceptConnection](event.ports[0]);
      }
    });
  }

  private[$acceptConnection](port: MessagePort) {
    this[$connections].add(port);

    try {
      console.log('Relaying accepted connection to view');
      port.onmessage = (message: MessageEvent) => this[$onMessage](message);
      port.postMessage({type: MessageBusProtocol.CONNECTION_ACCEPTED});
    } catch (error) {
      console.error(error);
    }
  }

  async post(message: Message|null, connection: MessagePort|null = null):
      Promise<void> {
    console.log('worker message bus post', message, connection);
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

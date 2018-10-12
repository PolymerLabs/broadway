import {$onMessage, MessageBus} from '../message-bus.js';
import {Message} from '../message.js';
import {getMessageBusClient} from './client.js';


/**
 * The ViewMessageBus is a specialized MessageBus that has a
 * bidrectional channel with a single worker.
 */
const $portPromise = Symbol('portPromise');
const $port = Symbol('port');
const $workerUrl = Symbol('workerUrl');
const $connect = Symbol('connect');

export class ViewMessageBus extends MessageBus {
  [$workerUrl]: string;
  [$port]: MessagePort|null;
  [$portPromise]: Promise<MessagePort>|null;

  constructor(workerUrl: string) {
    super();
    this[$workerUrl] = workerUrl;
    this[$port] = null;
    this[$portPromise] = null;

    this[$connect]();
  }

  async[$connect](): Promise<MessagePort> {
    if (this[$portPromise] == null) {
      console.log('Connecting to', this[$workerUrl]);
      const messageBusClient = getMessageBusClient(this[$workerUrl]);
      this[$portPromise] = messageBusClient.connect();
    }

    if (this[$port] == null) {
      this[$port] = await this[$portPromise];
      console.log('Connected!');
      this[$port]!.addEventListener(
          'message', event => this[$onMessage](event));
    }

    return this[$port]!;
  }

  async post(message: Message|null) {
    if (message == null) {
      console.warn('Attempt to post without a message');
      return;
    }

    const port = await this[$connect]();
    console.log('Posting message', message);
    port.postMessage(message!.toJSON());
  }
}

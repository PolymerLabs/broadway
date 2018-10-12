import {MessageBusProtocol} from '../message-bus/protocol.js';


/**
 * The MessageBusClient mediates communication between a document-bound
 * MessageBus and a worker-bound counterpart. It is the core means of
 * establishing a connection between the controller and all adapters.
 *
 * In this implementation, the MessageBusClient is also responsible for
 * creating the worker if it does not exist. This means that adapters should
 * think of controllers in terms of their canonical URLs.
 *
 * This implementation is a means to an ends. In the future, it may be
 * preferrable to use an appropriate web platform primitive to simplify the
 * means, such as: BroadcastChannel, SharedWorker or similar.
 */
const $getWorker = Symbol('getWorker');
const $dismiss = Symbol('dismiss');
const $worker = Symbol('worker');
const $workerUrl = Symbol('workerUrl');
const $onGlobalMessage = Symbol('onGlobalMessage');

class MessageBusClient {
  [$worker]: Worker|null;
  [$workerUrl]: string;
  [$onGlobalMessage]: (event: MessageEvent) => Promise<void>;

  constructor(workerUrl: string) {
    this[$worker] = null;
    this[$workerUrl] = workerUrl;

    this[$onGlobalMessage] = async (event: MessageEvent) => {
      const worker = await this[$getWorker]();

      if (event.data === MessageBusProtocol.ESTABLISH_MESSAGE_BUS_CHANNEL) {
        const sourcePort = event.ports[0];

        if (sourcePort == null) {
          return;
        }

        worker.postMessage(
            MessageBusProtocol.ESTABLISH_MESSAGE_BUS_CHANNEL, [sourcePort]);
      }
    };

    // Listen for global message events in case a child frame wants to
    // access the worker via the current frame:
    self.addEventListener('message', this[$onGlobalMessage]);
  }

  protected async[$getWorker](): Promise<Worker> {
    if (this[$worker] == null) {
      this[$worker] = new Worker(this[$workerUrl]);
    }

    return this[$worker]!;
  }

  async connect(): Promise<MessagePort> {
    const worker = await this[$getWorker]();

    const messageChannel = new MessageChannel();
    const {port1, port2} = messageChannel;

    // TODO: Maybe add a timeout here
    return await new Promise<MessagePort>(resolve => {
      // TODO: Verify that event type is MessageBusProtocol.CONNECTION_ACCEPTED
      const onMessage = () => {
        console.log('MessageBusClient got initial message on channel');
        port1.removeEventListener('message', onMessage);
        resolve(port1);
      };

      worker.postMessage(
          MessageBusProtocol.ESTABLISH_MESSAGE_BUS_CHANNEL, [port2]);

      port1.addEventListener('message', onMessage);
      port1.start();
    });
  }

  async[$dismiss](): Promise<void> {
    self.removeEventListener('message', this[$onGlobalMessage]);
    const worker = await this[$getWorker]();
    worker.terminate();
  }
}


/**
 * The FrameMessageBusClient is a specialized MessageBusClient for iframes.
 * Pending broader adoption of SharedWorker, it is necessary for frames to
 * negotiate shared access to DedicatedWorkers with the frames that created
 * them. So, iframes negotate access to the worker through their parent frames.
 */
class FrameMessageBusClient extends MessageBusClient {
  async connect(): Promise<MessagePort> {
    console.log('### Frame message bus client');

    const messageChannel = new MessageChannel();
    const {port1, port2} = messageChannel;

    // TODO: Maybe add a timeout here
    return await new Promise<MessagePort>(resolve => {
      // TODO: Verify that event type is
      // MessageBusProtocol.CONNECTION_ACCEPTED
      const onMessage = () => {
        console.log('##### Got port from parent frame');
        port1.removeEventListener('message', onMessage);
        resolve(port1);
      };

      console.log('#### Requesting new channel from parent frame');
      self.parent.postMessage(
          MessageBusProtocol.ESTABLISH_MESSAGE_BUS_CHANNEL, '*', [port2]);

      port1.addEventListener('message', onMessage);
      port1.start();
    });
  }

  async[$dismiss](): Promise<void> {
    // Nothing to clean up in child frames...
  }
}


/**
 * In order to abstract which client is used, and whether the client is created
 * or retrieved from cache, adapters access clients through this the
 * exported `getMessageBusClient` helper.
 */
const primaryFrameRe: RegExp = /__primary_frame__/;
const messageBusClients: Map<string, MessageBusClient> =
    new Map<string, MessageBusClient>();

export const getMessageBusClient = (workerUrl: string): MessageBusClient => {
  const isPrimaryFrame: boolean = self.top === self ||
      (!!self.location && !!self.location.search &&
       primaryFrameRe.test(self.location.search));

  const urlObject = new URL(workerUrl, self.location.toString());
  const fullWorkerUrl = urlObject.toString();

  if (!messageBusClients.has(fullWorkerUrl)) {
    console.log(`Creating new message bus client for ${fullWorkerUrl}!`);
    console.log(`Primary frame? ${isPrimaryFrame}`);
    const messageBusClient: MessageBusClient = isPrimaryFrame ?
        new MessageBusClient(workerUrl) :
        new FrameMessageBusClient(workerUrl);

    messageBusClients.set(fullWorkerUrl, messageBusClient);
  }

  return messageBusClients.get(fullWorkerUrl)!;
};


/**
 * It is sometimes useful for MessageBusClient instances to be cleanly
 * disposed of. Currently, this is only used in tests.
 */
export const dismissMessageBusClient =
    async(workerUrl: string): Promise<void> => {
  const urlObject = new URL(workerUrl, self.location.toString());
  const fullWorkerUrl = urlObject.toString();

  if (messageBusClients.has(fullWorkerUrl)) {
    console.log(`Dismissing message bus client for ${fullWorkerUrl}`);
    const messageBusClient = messageBusClients.get(fullWorkerUrl)!;
    messageBusClients.delete(fullWorkerUrl);
    await messageBusClient[$dismiss]();
  }
};

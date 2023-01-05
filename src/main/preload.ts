import {contextBridge, ipcRenderer, ContextBridge, IpcRenderer} from 'electron';

type ActionContainer = {
  model: string,
  actions: Array<string>
};

type Handler = {
  event: string,
  expose: Function,
  renderFunctionKery: string,
};

class Bridge {

  actionContainers: Array<ActionContainer>;
  handlers: Array<Handler>;

  constructor(actionContainers: Array<ActionContainer>) {
    this.actionContainers = actionContainers;
    this.handlers = [];
  }

  public register(ipcRenderer: IpcRenderer) {
    this.actionContainers.forEach(({ model, actions }) => {

      actions.forEach(action => {

        const event = this.eventKey(model, action);

        this.handlers.push({
          event,
          expose: async (...args: any) => {

            const execute = () => {
              return new Promise((resolve, reject) => {
                ipcRenderer.on(event, function handle (_, response) {

                  ipcRenderer.removeListener(event, handle);

                  return response.success
                    ? resolve(response.content)
                    : reject(response.content);
                });
              });
            }
            
            const promise = execute();

            ipcRenderer.send(event, ...args);

            return promise;
          },
          renderFunctionKery: this.renderFunctionName(model, action),
        });
      });

    });
  }

  public expose(contextBridge: ContextBridge) {
    const api: any = {};

    this.handlers.forEach(({ expose, renderFunctionKery }) => {

      api[renderFunctionKery] = expose;

    });

    contextBridge.exposeInMainWorld('bridge', api);
  }

  private renderFunctionName = (model: string, action: string) => `${action}${this.ucfirst(model)}`;

  private eventKey = (model: string, action: string) => `${model}.${action}`;

  private ucfirst = (arg: string) => `${arg.charAt(0).toUpperCase()}${arg.slice(1)}`;
}

const api = [
  {
    model: 'client',
    actions: [
      'list',
      'update',
      'delete',
      'store',
    ],
  },
  {
    model: 'invoice',
    actions: [
      'preview',
      'previewFromId',
      'store',
      'exchangeRate',
      'list',
      'find',
      'save',
      'delete',
      'progressNum',
    ]
  },
  {
    model: 'config',
    actions: [
      'set',
      'get',
      'getAll',
    ]
  }
]

const bridge = new Bridge(api);

bridge.register(ipcRenderer);
bridge.expose(contextBridge);

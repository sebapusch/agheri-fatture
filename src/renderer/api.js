const client = {
  list: async (options) => await window.bridge.listClient(options),
  delete: async (id) => await window.bridge.deleteClient(id),
  store: async (data) => await window.bridge.storeClient(data),
  update: async (id, data) => await window.bridge.updateClient(id, data),
}

const invoice = {
  preview: async (invoice) => await window.bridge.previewInvoice(invoice),
  previewFromId: async (id) => await window.bridge.previewFromIdInvoice(id),
  store: async (invoice) => await window.bridge.storeInvoice(invoice),
  exchangeRate: async () => await window.bridge.exchangeRateInvoice({}),
  list: async (options) => await window.bridge.listInvoice(options),
  find: async (id) => await window.bridge.findInvoice(id),
  save: async (id) => await window.bridge.saveInvoice(id),
  delete: async (id) => await window.bridge.deleteInvoice(id),
  progressNum: async () => await window.bridge.progressNumInvoice(),
};

const config = {
  set: async (set) => await window.bridge.setConfig(set),
  get: async (key) => await window.bridge.getConfig(key),
  getAll: async () => await window.bridge.getAllConfig(),
};

export {client, invoice, config};
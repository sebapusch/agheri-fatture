<template>

  <div v-if="!openForm" class="card border-light shadow p-3 my-5">
    
    <DataTable 
      :fields="tableDefinition"
      :data="clients"
      :pages="pages"
      :currentPage="table.page"
      @add="setCurrentAction('add')"
      @delete="handleDelete"
      @edit="handleEdit"
      @search="list"
      @page="handlePage"
    ></DataTable> 
  </div>

  <div v-if="openForm" class="card border-light shadow p-3">
    <ClientForm 
      @cancel="resetForm"
      @submit="handleSubmit"
      :client="client"
      :edit="currentAction === 'edit'"
    ></ClientForm>
  </div>

  <Modal 
    modalId="confirm-delete" 
    ref="deleteModal"
    :header="false"
  >
    <template v-slot:body>
      <div class="text-center w-100 py-2">
        Confermi l'eliminazione del cliente {{ deleteClient?.name }}?
      </div>
    </template>

    <template v-slot:footer>
      <button class="btn btn-light" @click="handleDeleteCancel">Annulla</button>
      <button class="btn btn-danger" @click="handleDeleteConfirm">Conferma</button>
    </template>
  </Modal>

</template>
<script>

import { client as clientApi } from '../../api';

import ClientForm from '../forms/ClientForm.vue';
import DataTable from '../DataTable.vue';
import Modal from '../Modal.vue';
import { useToast } from "vue-toastification";

const tableDefinition = [
  {
    name: 'name',
    label: 'Nome',
  },
  {
    name: 'holder',
    label: 'Holder',
  },
  {
    name: 'state',
    label: 'Nazione',
  }
];

export default {
  name: 'ClientsPage',
  components: {
    ClientForm,
    DataTable,
    Modal,
  },

  setup() {
    return { toast: useToast() };
  },

  data() {
    return {
      tableDefinition,
      deleteClient: null,
      clients: [],
      totalClients: 0,
      currentAction: null,
      client: {
        name: '',
        holder: '',
        address: '',
        city: '',
        state: 'DE',
        piva: '',
        zipcode: '',
      },
      editId: null,
      table: {
        limit: 5,
        offset: 0,
        page: 1,
      }
    }
  },

  computed: {
    openForm() {
      return this.currentAction !== null;
    },
    pages() {
      return Math.ceil(this.totalClients / this.table.limit);
    }
  },

  methods: {
    setCurrentAction(action) {
      this.currentAction = action;
    },

    handleSubmit(client) {
      if (this.currentAction === 'add') {
        this.store(client);
      } else if (this.currentAction === 'edit') {
        this.update(this.editId, client);
      }

      this.resetForm();
    },

    handlePage(page) {
      this.table.page = page;
      this.table.offset = (page * this.table.limit) - this.table.limit;
      this.list();
    },

    handleDelete(id) {
      this.deleteClient = this.clients.find((client) => client.id === id);
      this.$refs.deleteModal.show();
    },

    handleDeleteConfirm() {
      this.delete(this.deleteClient.id);
      this.$refs.deleteModal.hide();
    },

    handleDeleteCancel() {
      this.deleteClient = null;
      this.$refs.deleteModal.hide();
    },

    handleEdit(id) {
      this.setCurrentAction('edit');
      this.editId = id;
      this.client = this.clients.find(({ id: clientId }) => id === clientId);
    },

    resetForm() {
      this.setCurrentAction(null);
      this.resetClient();
    },

    resetClient() {
      this.client = {
        name: '',
        holder: '',
        address: '',
        city: '',
        state: 'DE',
        piva: '',
        zipcode: '',
      };

      this.editId = null;
    },

    /** API */
    async list(searchTerm = null) {

      const options = {
        limit: this.table.limit,
        offset: this.table.offset,
      };

      console.log(options);

      if (searchTerm) {
        options.query = searchTerm;
      }

      try {
        const response = await clientApi.list(options);

        this.clients = response.data;
        this.totalClients = response.total;
      } catch (e) {

        this.toast.error(e.message);
      }
    },

    async delete(id) {
      try {
        await clientApi.delete(id);
        this.toast.success('Cliente eliminato con successo');
        this.list();

      } catch (e) {
        this.toast.error(e.message);
      }
    },

    async update(id, data) {
      try {
        await clientApi.update(id, data);
        this.toast.success('Cliente aggiornato con successo');
        this.list();

      } catch (e) {
        this.toast.error(e.message);
      }
    },

    async store(data) {
      try {
        await clientApi.store(data);
        this.toast.success('Cliente inserito con successo');
        this.list();
      } catch (e) {
        this.toast.error(e.message);
      }
    },

    /** /API */
  },

  mounted() {
    this.list();
  }
}
</script>
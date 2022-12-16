<template>
  <div class="card border-light shadow p-3 my-5">
    <DataTable
      :fields="tableDefinition"
      :data="invoices"
      :actions="actions"
      :pages="pages"
      :currentPage="table.page"
      :sort="table.sort"
      @page="handlePage"
      @sort="handleSort"
      @delete="handleDelete"
    >
      <template #rowActionBefore="{ id }">
        <button
          class="icon-btn"
          @click="handlePreview(id)"
        >
          <span class="material-icons align-middle">visibility</span>
        </button>
        <button
          class="icon-btn"
          @click="save(id)"
        >
          <span class="material-icons align-middle">file_download</span>
        </button>

        <button
          class="icon-btn"
          @click="handleAdd(id)"
        >
          <span class="material-icons align-middle">add_circle</span>
        </button>
      </template>
    </DataTable>
  </div>

  <Modal 
    modalId="confirm-invoice-delete" 
    ref="deleteModal"
    :header="false"
  >
    <template v-slot:body>
      <div class="text-center w-100 py-2">
        Confermi l'eliminazione della fattura {{ deleteInvoice?.code }}?
      </div>
    </template>

    <template v-slot:footer>
      <button class="btn btn-light" @click="handleDeleteCancel">Annulla</button>
      <button class="btn btn-danger" @click="handleDeleteConfirm">Conferma</button>
    </template>
  </Modal>


  <div>
      <InvoicePreview
        ref="preview"
        :invoice="invoicePreview"
        :autoRefresh="false"
      ></InvoicePreview>
  </div>
</template>

<script>

import DataTable from '../DataTable.vue';
import InvoicePreview from '../invoice/Preview.vue';
import { invoice as invoiceApi } from '../../api';
import { useToast } from 'vue-toastification';
import { Tooltip } from 'bootstrap';
import Modal from '../Modal.vue';

const tableDefinition = [{
    name: 'code',
    label: 'Codice',
  }, {
    name: 'date',
    label: 'Data',
    sortable: true,
  }, {
    name: 'client',
    label: 'Cliente',
    sortable: true,
    sortkey: 'client.name',
  }, {
    name: 'totalAmount',
    label: 'Totale',
    sortable: true,
}];

export default {

  name: 'InvoiceListPage',
  components: { DataTable, InvoicePreview, Modal },

  setup() {
    return { toast: useToast() };
  },

  data() {
    return {
      invoices: [],
      invoicePreview: null,
      deleteInvoice: null,
      tableDefinition,
      actions: ["delete", "search"],
      table: {
        total: 0,
        limit: 10,
        offset: 0,
        page: 1,
        sort: {
          field: 'date',
          dir: 'DESC',
        },
      },
    };
  },
  
  computed: {
    pages() {
      return Math.ceil(this.table.total / this.table.limit);
    },
  },

  methods: {
    async list(searchTerm) {
      const options = {
        limit: this.table.limit,
        offset: this.table.offset,
      };

      if (searchTerm) {
        options.query = searchTerm;
      }

      if (this.table.sort) {
        const sortField = tableDefinition.find(({ name }) => this.table.sort.field === name);

        options.order = {
          dir: this.table.sort.dir,
          field: sortField.sortkey ?? sortField.name,
        };
      }

      try {
        const response = await invoiceApi.list(options);

        this.invoices = response.data.map(invoice => ({
          ...invoice,
          client: invoice.client.name,
          date: new Date(invoice.date).toLocaleDateString('it-IT'),
          totalAmount: invoice.nation === 'CH'
            ? `${invoice.totalAmount} (CHF)`
            : `${invoice.totalAmount} (€)`,
        }));

        this.table.total = response.total;
      } catch (e) {

        this.toast.error(e.message);
      }

    },

    handleSort(sort) {
      this.table.sort = sort;

      this.list();
    },

    handlePage(page) {
      this.table.page = page;
      this.table.offset = (page * this.table.limit) - this.table.limit;
      this.list();
    },

    async save(id) {
      try {
        await invoiceApi.save(id);
      } catch (e) {
        this.toast.error(e.message);
      }
    },

    async handleAdd(id) {
      const initialInvoice = await invoiceApi.find(id);

      this.$parent.selectPage('invoiceAdd', { initialInvoice });
    },

    handleDelete(deleteId) {
      this.deleteInvoice = this.invoices.find(({ id }) => id === deleteId);
      this.$refs.deleteModal.show();
    },

    handleDeleteCancel() {
      this.$refs.deleteModal.hide();
      this.deleteInvoice = null;
    },

    async handleDeleteConfirm() {
      try {
        await invoiceApi.delete(this.deleteInvoice.id);
        this.list();
        this.toast.success('Fattura eliminata con successo');
      } catch (e) {
        this.toast.error(e.message);
      }
      this.$refs.deleteModal.hide();
    },

    async handlePreview(id) {
      this.invoicePreview = id;

      this.$nextTick(async () => {
        await this.$refs.preview.refresh();
        this.$refs.preview.toggle();
      });
    }
  },

  mounted() {
    this.list();
  }
};

</script>
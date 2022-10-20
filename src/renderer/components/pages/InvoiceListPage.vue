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
  components: { DataTable, InvoicePreview },

  setup() {
    return { toast: useToast() };
  },

  data() {
    return {
      invoices: [],
      invoicePreview: null,
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

    async handleDelete(id) {
      try {
        await invoiceApi.delete(id);
        this.toast.success('Fattura eliminata con successo');
      } catch (e) {
        this.toast.error(e.message);
      }
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
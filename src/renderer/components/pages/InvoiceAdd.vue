<template>
    <div class="btn-group mb-1" role="group">
      <button
        class="btn btn-outline-primary"
        @click="togglePreview"
      >
        <span class="material-icons align-middle">visibility</span>
      </button>
      <button
        class="btn btn-outline-primary"
        @click="handleInvoiceSubmit"
      >
        <span class="material-icons align-middle">save</span>
      </button>
      <button
        class="btn btn-outline-primary"
        @click="handleInvoiceSubmitAndSave"
      >
        <span class="material-icons align-middle">file_download</span>
      </button>
    </div>
    <div class="card border-light shadow p-3 mb-5">
      <InvoiceForm 
        v-model="invoice"
        :client="initialClient"
      ></InvoiceForm>
    </div>

    <InvoicePreview
      ref="preview"
      :invoice="invoice"
      :autoRefresh="false"
    ></InvoicePreview>
</template>

<script>

import { invoice as invoiceApi } from '../../api';
import InvoiceForm from '../forms/InvoiceForm.vue';
import InvoicePreview from '../invoice/Preview.vue';
import { useToast } from 'vue-toastification';

export default {
  name: 'InvoiceAdd',

  components: {
    InvoiceForm,
    InvoicePreview,
  },

  setup() {
    return { toast: useToast() };
  },

  props: {
    initialInvoice: {
      type: Object,
      required: false,
      default: null,
    },
    update: {
      type: Boolean,
      required: false,
      default: false,
    }
  },

  data() {
    let invoice = null;
    let initialClient = null;

    console.log(this.initialInvoice);

    if (this.initialInvoice) {
      initialClient = this.initialInvoice.client;
      invoice =  {
        clientId: initialClient,
        code: this.initialInvoice.code,
        nation: this.initialInvoice.nation,
        displayEuro: this.initialInvoice.displayEuro,
        exchangeRate: this.initialInvoice.exchangeRate,
        sidenote: this.initialInvoice.sidenote,
        date: new Date(this.initialInvoice.date),
        services: this.initialInvoice.services.map(
          ({ type, name, quantity, price }) => ({ type, name, quantity, price })
        ),
      };
    } else {
      initialClient = null;
      invoice = {
        clientId: null,
        code: null,
        nation: 'DE',
        displayEuro: false,
        exchangeRate: null,
        sidenote: false,
        date: new Date(),
        services: [],
      };
    }

    console.log(invoice);

    return { invoice, initialClient };
  },

  computed: {
    invoiceData() {
      const data = JSON.parse(JSON.stringify(this.invoice));

      if (typeof data.clientId === 'object') {
        data.clientId = data.clientId.id;
      }

      return data;
    }
  },

  methods: {
    async handleInvoiceSubmit() {
      try {
        if (this.update) {
          await invoiceApi.update(this.initialInvoice.id, this.invoiceData);
        } else {
          await invoiceApi.store(this.invoiceData);
        }
      } catch(e) {
        console.log(e.message);
        this.toast.error(e.message);
        return;
      }
      
      this.toast.success('Fattura creata con successo');
      this.$parent.selectPage('invoiceList');
    },

    async handleInvoiceSubmitAndSave() {
      try {
        const invoice = await invoiceApi.store(this.invoiceData);
        await invoiceApi.save(invoice.id);
      } catch(e) {
        this.toast.error(e.message);
        return;
      }
      
      this.toast.success('Fattura creata con successo');
      this.$parent.selectPage('invoiceList');
    },

    async togglePreview() {
      await this.$refs.preview.refresh();
      this.$refs.preview.toggle();
    },
  },
}
</script>
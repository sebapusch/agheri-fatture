<template>
  <div class="container">

    <div class="row mb-3">

      <div class="col-12">

        <label for="client" class="ms-2">Cliente</label>
        <Multiselect
          id="client"
          v-model="form.clientId"
          @search-change="handleClientSearch"
          :options="clients"
          label="name"
          trackBy="id"
          selectLabel="Seleziona"
          selectedLabel="Selezionato"
          deselectLabel="Premi invio per rimuovere"
          placeholder="Seleziona opzione"
        >
          <template v-slot:noOptions>Nessuna opzione</template>
          <template v-slot:noResult>Nessun risultato</template>
        </Multiselect>
      </div>

    </div>

    <div class="row my-4">
      <div class="col-6">
        <div class="input-group">
          <FloatingLabel id="code" label="Codice">
            <input 
              type="text" 
              class="form-control" 
              id="code" 
              placeholder="code"
              v-model="form.code"
            >
          </FloatingLabel>
          <button 
            class="btn btn-light border"
            @click="generateCode"
          >
            <span class="material-icons align-middle">autorenew</span>
          </button>
        </div>
      </div>

      <div class="col-6">
        <FloatingLabel id="nation" label="Nazione">
          <select 
            id="nation"
            class="form-select"
            placeholder="nation"
            v-model="form.nation"
          >
            <option 
              v-for="{ label, value } in nations"
              :value="value"
            >
              {{ label }}
            </option>
          </select>
        </FloatingLabel>
      </div>
    </div>

    <div class="row my-4">
      <div class="col-6">
        <FloatingLabel id="date" label="Data">
          <input 
              type="date" 
              class="form-control" 
              id="date" 
              placeholder="date"
              v-model="form.date"
            >
        </FloatingLabel>
      </div>

      <div class="col-3 align-self-center align-middle" v-if="nationIsCh">
        <div class="form-check d-flex justify-content-center">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="display-eur"
            v-model="form.displayEuro"
          >
          <label class="form-check-label ms-2" for="display-eur">
            Mostra euro
          </label>
        </div>
      </div>

      <div class="col-3" v-if="nationIsCh">
        <div class="input-group">
          <FloatingLabel id="exchange-rate" label="Tasso di cambio">
            <input 
              type="number" 
              class="form-control" 
              id="exchange-rate" 
              placeholder="exchange-rate"
              v-model="form.exchangeRate"
            >
          </FloatingLabel>
          <button 
            class="btn btn-light border"
            @click="getExchangeRate"
            :disabled="loading.exchangeRate"
          >
            <span class="material-icons align-middle">currency_exchange</span>
          </button>
        </div>
      </div>
    </div>

    <div class="row">

      <div class="col-12">

        <div class="row mb-1">
          <div class="col align-self-center">
            <label class="ms-2">Servizi</label>
          </div>
          <div class="col text-end">
            <button class="btn btn-primary" @click="handleOpenAddServiceModal">
              <span class="material-icons align-middle">add</span>
            </button>
          </div>
        </div>

        <table class="table table-bordered rounded">
          <thead>
            <tr>
              <th>Nome servizio</th>
              <th>Tipo servizio</th>
              <th>Ore/Righe</th>
              <th>Prezzo (€)</th>
            </tr>
          
          </thead>
          <tbody>
            <tr
              v-for="service in form.services"
            >
              <td class="ps-2"> {{ service.name }} </td>
              <td class="ps-2"> {{ serviceTypeLabel(service.type) }} </td>
              <td class="ps-2"> {{ service.quantity ?? '-' }} </td>
              <td class="ps-2"> {{ service.price }} </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>


  <Modal 
    modalId="add-service" 
    ref="addServiceModal"
    title="Nuovo servizio"
    large
  >
    <template v-slot:body>
      <div class="container">
        <div class="row mb-4">

          <div class="col-6">
            <FloatingLabel id="service-name" label="Nome">
              <input 
                type="text"
                class="form-control" 
                id="service-name" 
                placeholder="Nome Servizio"
                v-model="service.name"
              >
            </FloatingLabel>
          </div>
          <div class="col-6">
            <FloatingLabel id="service-type" label="Tipo">
              <select 
                id="service-type"
                class="form-select"
                placeholder="Tipo"
                v-model="service.type"
              >
                <option 
                  v-for="{ label, value } in serviceTypes"
                  :value="value"
                >
                  {{ label }}
                </option>
              </select>
            </FloatingLabel>
          </div>
        </div>

        <div class="row">

          <div class="col-6">

            <FloatingLabel id="service-price" label="Prezzo">
              <input
                v-model="service.price"
                id="service-price"
                class="form-control"
                type="number"
                placeholder="Prezzo"
              >
            </FloatingLabel>

          </div>

          <div class="col-6">

            <FloatingLabel id="service-quantity" :label="serviceQuantityLabel">
              <input
                v-model="service.quantity"
                id="service-quantity"
                class="form-control"
                type="number"
                placeholder="Quantità"
                :disabled="!serviceQuantityEnabled"
              >
            </FloatingLabel>

            </div>

        </div>

      </div>
    </template>

    <template v-slot:footer>
      <button class="btn btn-light" @click="handleServiceCancel">Annulla</button>
      <button class="btn btn-primary" @click="handleServiceAdd">Conferma</button>
    </template>
  </Modal>
</template>

<script>

import { client as clientApi, invoice as invoiceApi } from '../../api';
import Multiselect from 'vue-multiselect';
import Modal from '../Modal.vue';
import FloatingLabel from '../FloatingLabel.vue';
import { useToast } from 'vue-toastification';

export default {
  name: 'InvoiceForm',

  emits: ['submit', 'update:modelValue'],

  components: {
    Modal,
    Multiselect,
    FloatingLabel,
  },

  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    client: {
      type: Object,
      required: false,
      default: null,
    }
  },

  setup() {
    return { toast: useToast() };
  },

  data() {
    return {
      form: JSON.parse(JSON.stringify(this.modelValue)),
      clients: this.client ? [this.client] : [],
      service: {
        name: null,
        type: 'flat',
        quantity: null,
        price: null,
      },
      serviceTypes: [{
          label: 'Tasso fisso',
          value: 'flat',
        }, {
          label: 'Orario',
          value: 'hour',
        }, {
          label: 'Riga',
          value: 'line',
        }, {
          'label': 'Prezzo minimo',
          'value': 'Min',
      }],
      nations: [{
        label: 'Svizzera',
        value: 'CH',
      }, {
        label: 'Germania',
        value: 'DE',
      }],
      loading: {
        exchangeRate: false,
      }
    };
  },

  watch: {
    form: {
      deep: true,
      handler(value) {

        const invoice = JSON.parse(JSON.stringify(value));

        console.log(invoice);

        if (value.clientId) {
          invoice.clientId = value.clientId.id;
        }
        this.$emit('update:modelValue', invoice);
      },
    },
  },

  methods: {
    async handleClientSearch(term) {
      const clients = await clientApi.list({
        attributes: ['id', 'name'],
        limit: 10,
        offset: 0,
        query: term,
      });

      this.clients = clients.data;
    },

    handleOpenAddServiceModal() {
      this.$refs.addServiceModal.show();
    },

    handleServiceCancel() {
      this.$refs.addServiceModal.hide();
      this.resetServiceForm();
    },

    handleServiceAdd() {
      if (!this.serviceQuantityEnabled) {
        this.service.quantity = null;
      }

      this.form.services.push(this.service);

      this.$refs.addServiceModal.hide();
      this.resetServiceForm();
    },

    resetServiceForm() {
      this.service = {
        name: null,
        type: 'flat',
        quantity: null,
        price: null,
      };
    },

    generateCode() {
      this.form.code = new Date().toLocaleString();
    },

    async getExchangeRate() {
      this.loading.exchangeRate = true;
      try {
        this.form.exchangeRate = await invoiceApi.exchangeRate();
      } catch (e) {
        this.toast.error(e.message);
      }
      this.loading.exchangeRate = false;
    },

    serviceTypeLabel(value) {
      return this.serviceTypes.find(type => type.value === value).label;
    },
  },

  computed: {
    serviceQuantityLabel() {
      switch (this.service.type) {
        case 'hour': return 'Quantità (ore)';
        case 'line': return 'Quantità (righe)';
        default: return 'Quantità';
      }
    },

    serviceQuantityEnabled() {
      return ['line', 'hour'].includes(this.service.type);
    },

    nationIsCh() {
      return this.form.nation === 'CH';
    }
  },
}

</script>
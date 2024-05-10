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
            @click="getProgressNum"
            :disabled="loading.exchangeRate"
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

        <table class="table table-bordered rounded table-fixed">
          <thead>
            <tr>
              <th width="35%">Nome servizio</th>
              <th>Tipo servizio</th>
              <th>Ore/Righe</th>
              <th> {{ servicePriceLabel }} </th>
              <th style="width: 15%;"></th>
            </tr>
          
          </thead>
          <tbody>
            <tr
              v-for="service, i in form.services"
            >
              <td class="ps-2"> {{ service.name }} </td>
              <td class="ps-2"> {{ serviceTypeLabel(service.type) }} </td>
              <td class="ps-2"> {{ service.quantity ?? '-' }} </td>
              <td class="ps-2"> {{ service.price }} </td>
              <td class="text-center">
                <button class="icon-btn icon-btn-success" @click="duplicateService(i)">
                  <span class="material-icons align-middle">repeat</span>
                </button>
                <button class="icon-btn icon-btn-primary" @click="updateService(i)">
                  <span class="material-icons align-middle">edit</span>
                </button>
                <button class="icon-btn icon-btn-danger" @click="removeService(i)">
                  <span class="material-icons align-middle">delete</span>
                </button>
              </td>
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
            <FloatingLabel 
              id="service-name" 
              label="Nome"
              :class="{ 'is-invalid': hasError('serviceName') }"
            >
              <input 
                type="text"
                class="form-control" 
                :class="{ 'is-invalid': hasError('serviceName') }"
                id="service-name" 
                placeholder="Nome Servizio"
                v-model="service.name"
              >
            </FloatingLabel>
            <div class="invalid-feedback">
              {{ errors.serviceName }}
            </div>
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

            <FloatingLabel
              id="service-price"
              :label="servicePriceLabel"
              :class="{ 'is-invalid': hasError('servicePrice') }"
            >
              <input
                v-model="service.price"
                id="service-price"
                class="form-control"
                :class="{ 'is-invalid': hasError('servicePrice') }"
                type="number"
                placeholder="Prezzo"
              >
            </FloatingLabel>
            <div class="invalid-feedback">
              {{ errors.servicePrice }}
            </div>

          </div>

          <div class="col-6">

            <FloatingLabel 
              id="service-quantity" 
              :label="serviceQuantityLabel"
              :class="{ 'is-invalid': hasError('serviceQuantity') }"
            >
              <input
                v-model="service.quantity"
                id="service-quantity"
                class="form-control"
                :class="{ 'is-invalid': hasError('serviceQuantity') }"
                type="number"
                placeholder="Quantità"
                :disabled="!serviceQuantityEnabled"
              >
            </FloatingLabel>
            <div class="invalid-feedback">
              {{ errors.serviceQuantity }}
            </div>

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
import { gt } from '../../validation';
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
    const model = JSON.parse(JSON.stringify(this.modelValue))
    model.date = model.date ? model.date.split('T')[0] : null;
    return {
      form: model,
      clients: this.client ? [this.client] : [],
      updateServiceIndex: null,
      service: {
        name: null,
        type: 'flat',
        quantity: null,
        price: null,
      },
      errors: {
        service: {
          name: '',
          quantity: '',
          price: '',
        }
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
          label: 'Prezzo minimo',
          value: 'min',
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
        progressNum: false,
      }
    };
  },

  watch: {
    clientNation: {
      handler(nation, old) {
        if (nation && nation !== old) {
          this.form.nation = nation;
        }
      },
    },
    form: {
      deep: true,
      handler(value, old) {
        const invoice = JSON.parse(JSON.stringify(value));

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
        attributes: ['id', 'name', 'state'],
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

      if (false === this.validateService()) {
        return;
      }

      if (!this.serviceQuantityEnabled) {
        this.service.quantity = null;
      }
      
      if (this.updateServiceIndex !== null) {
        this.form.services[this.updateServiceIndex] = this.service;
        this.updateServiceIndex = null;
      } else {
        this.form.services.push(this.service);
      }

      this.$refs.addServiceModal.hide();
      this.resetServiceForm();
    },

    validateService() {

      this.resetServiceErrors();
      let errors = false;

      if (['hour', 'line'].includes(this.service.type)) {

        if (false === gt(this.service.quantity, 0)) {
          this.errors.serviceQuantity = 'Inserisci una quantità valida';
          errors = true;
        }
      }

      if (false === gt(this.service.price, 0)) {
        this.errors.servicePrice = 'Inserisci un prezzo valido';
        errors = true;
      }

      if (! this.service.name) {
        this.errors.serviceName = 'Inserisci un nome valido';
        errors = true;
      }

      return false === errors;
    },

    resetServiceErrors() {
      this.errors.serviceQuantity = '';
      this.errors.servicePrice = '';
      this.errors.serviceName = '';
    },

    removeService(index) {
      this.form.services.splice(index, 1);
    },

    duplicateService(index) {
      this.service = JSON.parse(JSON.stringify(this.form.services[index]));
      this.$refs.addServiceModal.show();
    },

    updateService(index) {
      this.service = JSON.parse(JSON.stringify(this.form.services[index]));
      this.updateServiceIndex = index;
      this.$refs.addServiceModal.show();
    },

    resetServiceForm() {
      this.service = {
        name: null,
        type: 'flat',
        quantity: null,
        price: null,
      };
    },

    hasError(field) {
      return !!this.errors[field];
    },

    async getProgressNum() {
      this.loading.progressNum = true;
      try {
        this.form.code = await invoiceApi.progressNum();
      } catch (e) {
        this.toast.error(e.message);
      }
      this.loading.progressNum = false;
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

    clientNation() {
      return this.form.clientId?.state;
    },

    servicePriceLabel() {
      return this.nationIsCh
        ? 'Prezzo (chf)'
        : 'Prezzo (€)';
    },

    serviceQuantityEnabled() {
      return ['line', 'hour'].includes(this.service.type);
    },

    nationIsCh() {
      return this.form.nation === 'CH';
    }
  },

  beforeMount() {
    this.handleClientSearch('');
  }
  
}

</script>

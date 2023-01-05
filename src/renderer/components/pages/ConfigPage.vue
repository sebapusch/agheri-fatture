<template>
  <div class="card border-light shadow p-3">
    <ObjectView v-model="config"/>
  </div>

</template>

<script>

import ObjectView from '../objectView/ObjectView.vue'
import { config as api } from '../../api';

const config = {
  progressNum: 'nu'
};

export default {
  name: 'Config',

  data() {
    return {
      config: {
    "progress_num": 0,
    "profile": {
        "name": "Alessandra Gheri-Pusch",
        "title": "Technical Translations",
        "address": [
            "Via al Castellaccio 101/6",
            "I-16136 Genova (ITALIA)"
        ],
        "piva": "IT 03832170108",
        "billing": {
            "name": "Alessandra Gheri",
            "bank": "UniCredit Spa",
            "iban": "IT26E0301503200000003227183",
            "bic": "FEBIITM1XXX"
        }
    }
},
    }
  },

  watch: {
    config: {
      deep: true,
      handler(value) {
        console.log(value);
      }
    }
  },

  setup() {
    
  },

  components: {
    ObjectView,
  },

  methods: {
    async update(value, key) {
      try {
        await api.set(key, value);
      } catch (e) {
        console.log(e.message);
      }
    }
  },

  async mounted() {
    this.config = await api.getAll();
  },
}
</script>
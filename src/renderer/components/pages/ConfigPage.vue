<template>
  <div class="btn-group mb-1">
    <button
      class="btn btn-outline-primary"
      @click="save"
    >
      <span class="material-icons align-middle">save</span>
    </button>
  </div>

  <div class="card border-light shadow p-3">
    <div class="container">
      <ObjectView v-model="config"/>
    </div>
  </div>

</template>

<script>

import ObjectView from '../objectView/ObjectView.vue'
import { useToast } from 'vue-toastification';
import { config as api } from '../../api';

export default {
  name: 'Config',
  
  components: {
    ObjectView,
  },

  setup() {
    return { toast: useToast() };
  },
  
  data() {
    return {
      config: {},
    }
  },

  methods: {
    async save() {

      const config = JSON.parse(JSON.stringify(this.config));

      try {
        await api.save(config);
        this.toast.success('Impostazioni salvate con successo');
      } catch (e) {
        this.toast.error(e.message);
      }
    }
  },

  async mounted() {
    this.config = await api.getAll();
  },
}
</script>
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
      config: {},
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
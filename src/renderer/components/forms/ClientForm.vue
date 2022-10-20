<template>
  <ContainerDiv>
    
    <div class="row mb-4">
      <div class="col-6">
        <FloatingLabel id="name" label="Nome">
          <input 
            type="text" 
            class="form-control" 
            id="name" 
            placeholder="name"
            v-model="client.name"  
          >
        </FloatingLabel>
        
      </div>

      <div class="col-6">
        <FloatingLabel id="holder" label="Holder">
        <input 
          type="text"
          class="form-control" 
          id="holder" 
          placeholder="holder"
          v-model="client.holder"  
        >
      </FloatingLabel>
      </div>
    </div>

    <div class="row mb-4">

      <div class="col-5">
        <FloatingLabel id="address" label="Indirizzo">
          <input 
            type="text" 
            class="form-control" 
            id="address" 
            placeholder="address"
            v-model="client.address"  
          >
        </FloatingLabel>
      </div>
      
      <div class="col-5">
        <FloatingLabel id="city" label="Città">
          <input 
            type="text" 
            class="form-control" 
            id="city" 
            placeholder="city"
            v-model="client.city"
          >
        </FloatingLabel>
      </div>

      <div class="col-2">
        <FloatingLabel id="zipcode" label="Codice postale">
          <input 
            type="text" 
            class="form-control" 
            id="zipcode" 
            placeholder="zipcode"
            v-model="client.zipcode"
          >
        </FloatingLabel>
      </div>
    </div>

    <div class="row mb-4">

      <div class="col-6">
        <FloatingLabel id="state" label="Nazione">
          <input 
            type="text" 
            class="form-control"
            id="state" 
            placeholder="state"
            v-model="client.state"
          >
        </FloatingLabel>
      </div>

      <div class="col-6">
        <FloatingLabel id="piva" label="Partita Iva" class="col-6">
          <input 
            type="text" 
            class="form-control" 
            id="piva" 
            placeholder="piva"
            v-model="client.piva"
          >
        </FloatingLabel>
      </div>
    </div>

    <div class="row">
      <div class="col-8"></div>
      <div class="col-2">
        <button 
          class="btn btn-light w-100" 
          @click="$emit('cancel')"
        >
          Annulla
        </button>
      </div>
      <div class="col-2">
        <button class="btn btn-primary w-100" @click="submit">
          {{ edit ? 'Modifica' : 'Salva' }}
        </button> 
      </div>
    </div>

  </ContainerDiv>
</template>

<script>

import FloatingLabel from '../FloatingLabel.vue';
import ContainerDiv from '../ContainerDiv.vue';

export default {

  name: 'ClientForm',
  components: {
    FloatingLabel,
    ContainerDiv,
  },

  props: {
    client: {
      type: Object,
      required: true,
    },

    edit: {
      required: false,
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {};
  },

  methods: {
    submit() {
      this.$emit('submit', {...this.client});
    }
  }
}

</script>
<template>

  <div v-if="isBool" class="form-check">
    <input 
      :id="label" 
      :checked="modelValue" 
      @change="updateValue" 
      class="form-check-input my-2" 
      type="checkbox"
    />

    <label :for="label" class="form-check-label">
      {{ label }}
    </label>
  </div>
  
  <FloatingLabel
    v-if="!isBool"
    :id="label"
    :label="label"
    col="12"
    class="my-2"
  >
    <input 
      :id="label"
      :type="inputType"
      :value="modelValue"
      @change="updateValue"
      class="form-control"
    />
  </FloatingLabel>
</template>

<script>

  import FloatingLabel from '../FloatingLabel.vue';

  export default {
    name: 'Primitive',
    
    components: { FloatingLabel },

    props: {
      modelValue: [String, Number, Boolean],
      label: String,
    },

    data() {
      return {
        type: typeof this.modelValue,
      };
    },

    computed: {

      isBool() {
        return this.type === 'boolean';
      },

      inputType() {
        switch(this.type) {
          case 'number': return 'number';
          case 'boolean': return 'checkbox';
          case 'string': return 'text';
        }

        return 'hidden';
      },
    },

    methods: {
      updateValue(event) {  
        this.$emit('update:modelValue', this.cast(event));
      },
      
      cast(event) {
        switch(this.type) {
          case 'number': return Number(event.target.value);
          case 'string': return event.target.value.toString();
          case 'boolean': return event.target.checked;
        }

        return null;
      }
    }
  }
</script>
<template>
  <div>
    <FloatingLabel :id="id" :label="label">
        <input 
          type="text"
          class="form-control"
          v-model="search"          
          :id="id"
          :placeholder="label"
          @input="$emit('search', this.search)"
        >
      </FloatingLabel>
      <select 
        class="form-control"
        v-model="selected"
        @change="handleSelected"
      >
        <option 
          v-for="{ value, label } in options"
          :value="value"
          :selected="selected === value"
        >
          {{ label }}
        </option>
      </select>
  </div>
</template>

<script>

  import FloatingLabel from './FloatingLabel.vue';

  export default {
    name: 'SearchSelect',
    emits: ['search', 'selected', 'input'],

    components: {
      FloatingLabel,
    },

    props: {
      label: {
        required: true,
        type: String,
      },
      id: {
        required: true,
        type: String,
      },
      options: {
        required: true,
        type: Array,
      },
      value: {
        required: false,
        type: [String, Number],
      }
    },
    
    data() {
      return {
        selected: this.value,
        search: '',
      }
    },

    methods: {
      handleSelected() {
        this.$emit('input', this.selected);
        this.$emit('selected', this.selected);
        console.log(this.selected, this.options);
        this.search = this.options.find(({ value }) => value === this.selected).label;
      },
    }
  }
</script>
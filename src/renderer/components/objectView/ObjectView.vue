<template>
  <div>

    <template 
      v-for="(item, key) in object"
    >
        <Primitive 
          v-if="isPrimitive(item)" 
          v-model="object[key]" 
          :label="label(key)"
        />

        <div v-else class="card">
          <div class="card-header">
            {{ label(key) }}
          </div>
          
          <div class="card-body">
            
            <ObjectView 
              v-model="object[key]"
              :modelKey="label(key)"
            />
          
          </div>
        </div>
    </template>
  </div>
</template>

<script>
import Primitive from './Primitive.vue';

export default {
  name: 'ObjectView',
  
  components: { Primitive },
  
  emits: ['update:modelValue'],
  
  props: {
    modelValue: {
      type: [Object, Array],
      required: true,
    },
    modelKey: {
      required: false,
      type: String,
      default: '',
    }
  },

  data() {
    return {
      object: this.modelValue,
      isArray: Array.isArray(this.modelValue),
    };
  },

  watch: {
    object: {
      deep: true,
      handler(value) {
        this.$emit('update:modelValue', value);
      },
    },
    modelValue: {
      deep: true,
      handler(value) {
        this.object = value;
      },
    },
  },
  
  methods: {
    label(key) {
      return this.isArray
        ? `${this.modelKey} - ${key}`
        : key;
    },
    isPrimitive(value) {
      return false === value instanceof Object;
    }
  },
};
</script>
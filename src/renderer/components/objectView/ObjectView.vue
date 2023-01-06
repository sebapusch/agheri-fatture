<template>
  <div>
    <template v-for="(value, key) in object">

      <Primitive 
        v-if="isPrimitive(value)"
        v-model="object[key]"
        :label="key.toString()"
      />

      <div v-else class="card my-3">
        <div class="card-header">{{ key }}</div>
        <div class="card-body">

          <template
            v-if="isArray(value)"
            v-for="(item, index) in value"
          >

            <Primitive 
              v-if="isPrimitive(item)" 
              v-model="object[key][index]" 
              :label="arrayLabel(key, index)"
            />

            <ObjectView 
              v-else-if="!isArray(item)"
              v-model="object[key][index]"
            />

          </template>

          <ObjectView 
            v-else-if="isObject(value)"
            v-model="object[key]"
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
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      object: this.modelValue
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
    isArray(value) {
      return Array.isArray(value);
    },

    isObject(value) {
      return value instanceof Object;
    },

    isPrimitive(value) {
      return false === this.isObject(value);
    },

    arrayLabel(key, index) {
      return `${key} - ${index + 1}`;
    }
  },
};
</script>
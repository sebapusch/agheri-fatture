<template>
  <div class="modal" :id="modalId">
    <div class="modal-dialog modal-dialog-centered" :class="{'modal-lg': large}">
      <div class="modal-content">

        <div class="modal-header" v-if="header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn btn-primary" @click="hide">
            <span class="material-icons align-middle">close</span>
          </button>
        </div>

        <div class="modal-body">

          <slot name="body"></slot>

        </div>

        <div class="modal-footer">

          <slot name="footer"></slot>

        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { Modal } from 'bootstrap';

export default {
  name: 'Modal',
  
  data() {
    return {
      modal: null,
      hidden: this.initialHidden,
    };
  },

  props: {
    modalId: {
      type: String,
      required: true,
    },
    header: {
      type: Boolean,
      required: false,
      default: true,
    },
    footer: {
      type: Boolean,
      required: false,
      default: true,
    },
    title: {
      type: String,
      required: false,
      default: '',
    },
    initialHidden: {
      type: Boolean,
      required: false,
      default: true,
    },
    large: {
      type: Boolean,
      require: false,
      default: false,
    }
  },

  methods: {
    hide() {
      this.$nextTick(() => {
        this.modal.hide();
      });
    },
    show() {
      this.$nextTick(() => {
        this.modal.show();
      });
    }
  },

  mounted() {
    this.modal = new Modal(`#${this.modalId}`, {});

    if (this.initialHidden) {
      this.$nextTick(() => {
        this.modal.hide();
      });
    }
  },

  expose: ['hide', 'show'],
}

</script>

<template>
  <div 
      class="offcanvas top-50 start-50 translate-middle border border-dark" 
      tabindex="-1" 
      id="preview-offcanvas"
      ref="previewOffcanvas"
    >
      <div>
        <div>
          <iframe
            :srcdoc="preview"
          >
          </iframe>
        </div>
      </div>
    </div>

</template>

<script>

import { invoice as invoiceApi } from '../../api';
import { Offcanvas } from 'bootstrap';

export default {
  name: 'InvoicePreview',

  props: {
    invoice: {
      type: [Object, String, null],
      required: true,
      default: null,
    },
    autoRefresh: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  data() {
    return {
      preview: '',
      previewOffCanvas: null,
    };
  },

  methods: {
    async refresh() {
      if (! this.invoice) {
        return;
      }
      const invoice = JSON.parse(JSON.stringify(this.invoice));

      if (typeof invoice === 'string') {
        this.preview = await invoiceApi.previewFromId(this.invoice)
      } else {
        if (invoice.clientId && typeof invoice.clientId === 'object') {
          invoice.clientId = invoice.clientId.id;
        }
        this.preview = await invoiceApi.preview(invoice);
      }
    },
    toggle() {
      this.$nextTick(() => {
        this.previewOffCanvas.toggle()
      });
    },
  },

  watch: {
    invoice: {
      deep: true,
      handler() {
        this.autoRefresh && this.refresh();
      }
    }
  },

  mounted() {
    this.previewOffCanvas = new Offcanvas(`#preview-offcanvas`);
  },

  expose: ['refresh', 'toggle'],
}

</script>

<style>
  iframe {
    width: 21cm;
    height: 29.7cm;
  }

  #preview-offcanvas {
    width: auto;
    height: fit-content;
    max-height: 800px;
    overflow-x: scroll;
    align-self: center;
    transition: none;
  }
</style>
<template>
  <div class="container-fuild d-flex justify-content-between">

    <div class="me-4">
      
      <ul
        class="nav flex-column nav-pills"
      >
        <li
          v-for="({ icon, label, page }) in routes"
          class="nav-item"
        >
          <a
            class="nav-link rounded-0 rounded-end"
            :class="{ active: isActive(page) }"
            @click="selectPage(page)"
          >
            <span class="material-icons align-middle">{{ icon }}</span>
          </a>
        </li>
      </ul>

    </div>

    <div class="flex-fill p-5">
        <component :is="currentPage" v-bind="componentProps"></component>
    </div>
  </div>
</template>

<script>

import ClientsPage from './components/pages/ClientsPage.vue';
import InvoiceAdd from './components/pages/InvoiceAdd.vue';
import InvoiceListPage from './components/pages/InvoiceListPage.vue';

const routes = {
  'invoiceAdd': InvoiceAdd,
  'clients': ClientsPage,
  'invoiceList': InvoiceListPage,
}

export default {
  components: {},

  data() {
    return {
      page: 'clients',
      routes: [{
            label: "Clients",
            icon: "groups",
            page: 'clients',
        }, {
            label: "Fatture",
            icon: "receipt_long",
            page: 'invoiceList',
        }, {
            label: "Nuova fattura",
            icon: "add",
            page: 'invoiceAdd',
      }],
      componentProps: {},
    };
  },

  methods: {
    isActive(page) {
      return page === this.page;
    },
    selectPage(page, props = {}) {
      if (page in routes) {
        this.componentProps = props;
        this.page = page;
      } else {
        throw new Error(`${page} page not found`);
      }
    }
  },

  computed: {
    currentPage() {
      return routes[this.page];
    }
  },

  expose: ['selectPage'],
}
</script>

<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

.nav-item:hover {
  cursor: pointer;
}
</style>

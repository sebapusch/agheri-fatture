<template>
  <div class="row mb-4">

    <div class="col-5">
      <div v-if="hasAction('search')" class="input-group">
        <input 
          v-model="search" 
          type="text"
          class="form-control"
          placeholder="Cerca..."
          @keyup.enter="$emit('search', search)"
        >
          
        <button 
          class="btn btn-outline-primary" 
          type="button"
          @click="$emit('search', search)"
        >
          <span class="material-icons align-middle">search</span>
        </button>
      </div>
    </div>

    <div class="col-5"></div>

    <div class="col-2 text-end">

      <button 
        v-if="hasAction('add')" class="btn btn-primary" 
        @click="$emit('add')"
      >
        <span class="material-icons align-middle">add</span>
      </button>

    </div>
  </div>
  <div class="row">
    <div class="col-12">

      <table class="table">

        <thead>
          <tr>

            <th></th>

            <th 
              v-for="field in fields" 
              :key="field.name"
              :class="{ 'sort-col': field.sortable }"
              @click="field.sortable && handleSort(field.name)"
            >
                {{ field.label }}
                <span
                  v-if="field.sortable && isCurrentSort(field.name)"
                  class="material-icons sort-icon align-middle"
                >
                {{ sortIcon }}
                </span>
            </th>

            <th></th>
          </tr>  
        </thead>

        <tbody>
          <tr v-if="hasResults" v-for="row in data" class="table-light">
            <td></td>
            <td v-for="field in fields">
              {{ row[field.name] }}
            </td>
            <td>
              <slot name="rowActionBefore" v-bind="row"></slot>

              <button
                class="icon-btn icon-btn-primary"
                v-if="hasAction('edit')"
                @click="$emit('edit', row.id)"
              >
                <span class="material-icons align-middle">edit</span>
              </button>

              <button
                class="icon-btn icon-btn-danger"
                v-if="hasAction('delete')" 
                @click="$emit('delete', row.id)"
              >
                <span class="material-icons align-middle">delete</span>
              </button>

              <slot name="rowAction" v-bind="row"></slot>
            </td>
          </tr>
          <tr v-else>
            <td colspan="100" class="text-center">
              Nessun risultato...
            </td>
          </tr>
        </tbody>
        
      </table>

    </div>
    <div class="row">
      <div class="col-12">
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{disabled: !hasPrevious}">
              <a 
                class="page-link"
                @click="changePage(currentPage - 1)"
              >
              <span class="material-icons align-middle nav-icon">navigate_before</span>
              </a>
            </li>
              <li 
                v-for="page in pages"
                class="page-item"
                :class="{ active: pageIsActive(page) }"
              >
                <a 
                  class="page-link"
                  @click="changePage(page)"
                >{{ page }}</a>
              </li>
            <li class="page-item" :class="{disabled: !hasNext}">
              <a 
                class="page-link" 
                @click="changePage(currentPage + 1)"
              >
                <span class="material-icons align-middle nav-icon">navigate_next</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

  </div>
</template>

<script>

export default {
    name: "DataTable",
    emits: ["add", "delete", "search", "edit", "page", 'sort'],
    props: {
        fields: {
            required: true,
            type: Array,
        },
        data: {
            required: true,
            type: Array,
        },
        actions: {
            type: Array,
            required: false,
            default: () => [
                "add",
                "edit",
                "delete",
                "search",
            ],
        },
        currentPage: {
          type: Number,
          require: true,
        },
        pages: {
          type: Number,
          required: true,
        },
        sort: {
          type: Object,
          required: false,
          default: null,
        }
    },
    data() {
      return {
        search: '',
      };
    },
    computed: {
      hasResults() {
        return this.data.length > 0;
      },
      hasPrevious() {
        return this.currentPage !== 1 && this.pages > 1;
      },
      hasNext() {
        return this.currentPage !== this.pages && this.pages > 1;
      },
      sortIcon() {
        return this.sort.dir === 'ASC'
          ? 'expand_less'
          : 'expand_more';
      }
    },
    methods: {
      hasAction(action) {
        return this.actions.includes(action);
      },
      pageIsActive(page) {
        return this.currentPage === page;
      },
      changePage(page) {
        this.$emit('page', page);
      },
      isCurrentSort(field) {
        return this.sort && this.sort.field === field;
      },
      handleSort(field) {
        const dir = this.sort && this.sort.dir === 'DESC'
          ? 'ASC'
          : 'DESC';

        this.$emit('sort', {
          field,
          dir,
        });
      }
    },
    components: { },
}

</script>

<style>
  .page-item:hover {
    cursor: pointer;
  }

  .nav-icon {
    font-size: 21px;
  }

  .action-icon {
    font-size: 18px;
  }

  .sort-icon {
    font-size: 20px;
  }

  .sort-col:hover{
    cursor: pointer;
  }
</style>
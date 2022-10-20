<template>
  <NavBar
    :initialItems="pages"
    vertical
  ></NavBar>
</template>

<script>
import NavBar from '../NavBar.vue';
  
  export default {
    name: "ClientsPage",
    data() {
        return {
            pages: [
                {
                    label: "Clients"
                    icon: "groups"
                },
                {
                    label: "Fatture",
                    icon: "receipt_long",
                },
                {
                    label: "Nuova fattura",
                    icon: "add",
                }
            ]
        };
    },
    components: { NavBar }
}  
</script>
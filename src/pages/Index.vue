<template>
  <q-page class="flex flex-center">
    <vitals_graph></vitals_graph>
    <custom_graph></custom_graph>
  </q-page>
</template>

<script>
import vitals_graph from "components/vitals_graph";
import custom_graph from "components/custom_graph";

export default {
  name: "PageIndex",
  components: {
    vitals_graph,
    custom_graph
  }
};
</script>

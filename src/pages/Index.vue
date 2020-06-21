<template>
  <q-page class="flex flex-center">
    <vitals_graph></vitals_graph>
  </q-page>
</template>

<script>
import vitals_graph from "components/vitals_graph";
import custom_graph from "components/custom_graph";
import ventilator_graph from "components/ventilator_graphs";

export default {
  name: "PageIndex",
  components: {

    vitals_graph
  }
};
</script>

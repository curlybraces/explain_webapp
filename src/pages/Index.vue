<template>
  <q-page>
    <div class="row justify-center">
      <controller></controller>
    </div>
    <div class="row justify-center">
      <vitals_graph></vitals_graph>
    </div>
  </q-page>
</template>

<script>
import vitals_graph from "components/vitals_graph";
import custom_graph from "components/custom_graph";
import ventilator_graph from "components/ventilator_graphs";
import controller from "components/controller";

export default {
  name: "PageIndex",
  components: {
    vitals_graph,
    controller
  }
};
</script>

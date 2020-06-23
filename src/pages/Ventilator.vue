<template>
  <q-page>
    <div class="row justify-center">
      <ventilator_data></ventilator_data>
    </div>

    <div class="row justify-center">
      <ventilator_controls></ventilator_controls>
    </div>
    <div class="row justify-center">
      <ventilator_graph></ventilator_graph>
    </div>
    <div class="row justify-center">
      <ventilation_table></ventilation_table>
    </div>
    <div class="row justify-center">
      <controller></controller>
    </div>
  </q-page>
</template>

<script>
import ventilator_data from "components/ventilator_data";
import ventilator_controls from "components/ventilator_controls";
import vitals_table from "components/vitals_table";
import ventilation_table from "components/ventilation_table";
import ventilator_graph from "components/ventilator_graphs";
import controller from "components/controller";

export default {
  name: "PageIndex",
  components: {
    ventilator_data,
    ventilator_controls,
    ventilation_table,

    ventilator_graph,
    controller
  }
};
</script>

<style>
.custom {
  width: 100%;
}
.control-title {
  font-size: 16px;
}
</style>

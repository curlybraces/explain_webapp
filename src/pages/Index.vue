<template>
  <q-page padding>
    <chart class="row justify-center"></chart>
    <div class="row justify-center">
      <controller></controller>
    </div>
  </q-page>
</template>

<script>
import model_diagram from "components/model_diagram";
import controller from "components/controller";
import chart from "components/timebased_chart";

export default {
  name: "PageIndex",
  components: {
    chart,
    controller
  }
};
</script>

<template>
  <q-page padding>
    <chart></chart>
    <div class="row justify-center">
      <controller></controller>
    </div>
  </q-page>
</template>

<script>
import model_diagram from "components/model_diagram";
import controller from "components/controller";
import chart from "components/chart";

export default {
  name: "PageIndex",
  components: {
    chart,
    controller
  }
};
</script>

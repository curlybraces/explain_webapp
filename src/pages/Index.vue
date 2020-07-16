<template>
  <q-page padding>
    <model_diagram class="row justify-center"></model_diagram>
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
    controller,
    model_diagram
  }
};
</script>

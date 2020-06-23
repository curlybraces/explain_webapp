<template>
  <q-page padding>
    <div class="row justify-center items-start">
      <div class="col-2 text-center"></div>
      <div class="col text-center">
        <model_diagram></model_diagram>
      </div>
      <div class="col-2 text-center"></div>
    </div>
  </q-page>
</template>

<script>
import model_diagram from "components/model_diagram";
import controller from "components/controller";

export default {
  name: "PageIndex",
  components: {
    model_diagram
  }
};
</script>

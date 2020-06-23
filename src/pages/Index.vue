<template>
  <q-page padding>
    <model_diagram></model_diagram>
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

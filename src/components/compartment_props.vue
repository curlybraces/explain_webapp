<template>
  <div class="q-ma-sm">
    <q-card>
      <q-card-section class="q-pa-sm">
        <div class="text-overline text-center">
          component properties
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div v-for="(value, property, index) in component" :key="index">
          <q-toggle
            v-if="typeof component[property] === 'boolean'"
            :label="property"
            left-label
            size="xs"
            v-model="component[property]"
          ></q-toggle>

          <q-input
            v-if="typeof component[property] === 'string'"
            :label="property"
            class="q-ma-sm"
            v-model="component[property]"
            filled
            input-class="text-center"
          >
          </q-input>

          <q-input
            v-if="typeof component[property] === 'number'"
            :label="property"
            class="q-ma-sm"
            v-model="component[property]"
            filled
            type="number"
            input-class="text-center"
          >
          </q-input>
        </div>

        <q-btn
          color="negative"
          size="sm"
          @click="updateComponentProps"
          label="UPDATE"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      event_listener: null,
      component_name: "AA",
      component: {}
    };
  },
  mounted() {
    this.event_listener = this.$model.modelEngine.addEventListener(
      "message",
      _message => {
        if (_message.data.type === "model_state") {
          //console.log(_message.data.data);
          this.processData(_message.data.data);
        }
      }
    );
  },
  methods: {
    getData(comp_name) {
      this.component_name = comp_name;
      this.$model.sendMessageToModelEngine({
        type: "get",
        subtype: "model_state",
        target: null,
        data: null
      });
    },
    updateComponentProps() {},
    processData(model_state) {
      this.component = {};

      // first find the type of the desired component
      switch (model_state[this.component_name].subtype) {
        case "blood_compartment":
          this.processBloodCompartment(model_state[this.component_name]);
          break;
        case "blood_connector":
          this.processBloodConnector(model_state[this.component_name]);
          break;
        case "pump":
          this.processPump(model_state[this.component_name]);
          break;
        case "valve":
          this.processValve(model_state[this.component_name]);
          break;
        case "shunt":
          this.processShunt(model_state[this.component_name]);
          break;
        case "gas_compartment":
          this.processGasCompartment(model_state[this.component_name]);
          break;
        case "gas_connector":
          this.processGasConnector(model_state[this.component_name]);
          break;
        case "container":
          this.processContainer(model_state[this.component_name]);
          break;
        case "exchanger":
          this.processExchanger(model_state[this.component_name]);
          break;
        case "diffusor":
          this.processDiffusor(model_state[this.component_name]);
          break;
      }
    },
    processBloodCompartment(_data) {
      this.$set(this.component, "is_enabled", _data["is_enabled"]);
      this.$set(this.component, "name", _data["name"]);
      this.$set(this.component, "subtype", _data["subtype"]);

      this.$set(
        this.component,
        "vol_current_baseline",
        _data["vol_current_baseline"]
      );
      this.$set(
        this.component,
        "vol_unstressed_baseline",
        _data["vol_unstressed_baseline"]
      );

      this.$set(this.component, "el_baseline", _data["el_baseline"]);
      this.$set(this.component, "el_min_volume", _data["el_min_volume"]);
      this.$set(this.component, "el_max_volume", _data["el_max_volume"]);
      this.$set(this.component, "el_k1", _data["el_k1"]);
      this.$set(this.component, "el_k2", _data["el_k2"]);
      this.$set(this.component, "fvatp", _data["fvatp"]);
    },
    processBloodConnector(_data) {
      this.$set(this.component, "is_enabled", _data["is_enabled"]);
      this.$set(this.component, "no_flow", _data["no_flow"]);
      this.$set(this.component, "no_backflow", _data["no_backflow"]);
      this.$set(this.component, "name", _data["name"]);
      this.$set(this.component, "subtype", _data["subtype"]);
      this.$set(this.component, "comp_from", _data["comp_from"]);
      this.$set(this.component, "comp_to", _data["comp_to"]);
      this.$set(
        this.component,
        "res_forward_baseline",
        _data["res_forward_baseline"]
      );
      this.$set(
        this.component,
        "res_backward_baseline",
        _data["res_backward_baseline"]
      );
      this.$set(this.component, "in_baseline", _data["in_baseline"]);
      this.$set(this.component, "in_k1", _data["in_k1"]);
      this.$set(this.component, "in_k2", _data["in_k2"]);
    },

    processPump(_data) {
      this.$set(this.component, "is_enabled", _data["is_enabled"]);
      this.$set(this.component, "name", _data["name"]);
      this.$set(this.component, "subtype", _data["subtype"]);

      this.$set(
        this.component,
        "vol_current_baseline",
        _data["vol_current_baseline"]
      );
      this.$set(
        this.component,
        "vol_unstressed_baseline",
        _data["vol_unstressed_baseline"]
      );

      this.$set(this.component, "el_baseline", _data["el_baseline"]);
      this.$set(
        this.component,
        "el_contraction_baseline",
        _data["el_contraction_baseline"]
      );
      this.$set(this.component, "el_min_volume", _data["el_min_volume"]);
      this.$set(this.component, "el_max_volume", _data["el_max_volume"]);
      this.$set(this.component, "el_k1", _data["el_k1"]);
      this.$set(this.component, "el_k2", _data["el_k2"]);
      this.$set(this.component, "fvatp", _data["fvatp"]);
    },
    processValve(_data) {
      this.$set(this.component, "is_enabled", _data["is_enabled"]);
      this.$set(this.component, "no_flow", _data["no_flow"]);
      this.$set(this.component, "no_backflow", _data["no_backflow"]);
      this.$set(this.component, "name", _data["name"]);
      this.$set(this.component, "subtype", _data["subtype"]);
      this.$set(this.component, "comp_from", _data["comp_from"]);
      this.$set(this.component, "comp_to", _data["comp_to"]);
      this.$set(
        this.component,
        "res_forward_baseline",
        _data["res_forward_baseline"]
      );
      this.$set(
        this.component,
        "res_backward_baseline",
        _data["res_backward_baseline"]
      );
      this.$set(this.component, "in_baseline", _data["in_baseline"]);
      this.$set(this.component, "in_k1", _data["in_k1"]);
      this.$set(this.component, "in_k2", _data["in_k2"]);
    },
    processShunt(_data) {
      this.$set(this.component, "is_enabled", _data["is_enabled"]);
      this.$set(this.component, "no_flow", _data["no_flow"]);
      this.$set(this.component, "no_backflow", _data["no_backflow"]);
      this.$set(this.component, "name", _data["name"]);
      this.$set(this.component, "subtype", _data["subtype"]);
      this.$set(this.component, "comp_from", _data["comp_from"]);
      this.$set(this.component, "comp_to", _data["comp_to"]);
      this.$set(
        this.component,
        "res_forward_baseline",
        _data["res_forward_baseline"]
      );
      this.$set(
        this.component,
        "res_backward_baseline",
        _data["res_backward_baseline"]
      );
      this.$set(this.component, "in_baseline", _data["in_baseline"]);
      this.$set(this.component, "in_k1", _data["in_k1"]);
      this.$set(this.component, "in_k2", _data["in_k2"]);
    },

    processGasCompartment(_data) {
      this.$set(this.component, "is_enabled", _data["is_enabled"]);
      if (_data["has_fixed_composition"] === 1) {
        this.$set(this.component, "has_fixed_composition", true);
      } else {
        this.$set(this.component, "has_fixed_composition", false);
      }
      this.$set(this.component, "name", _data["name"]);
      this.$set(this.component, "subtype", _data["subtype"]);

      this.$set(
        this.component,
        "vol_current_baseline",
        _data["vol_current_baseline"]
      );
      this.$set(
        this.component,
        "vol_unstressed_baseline",
        _data["vol_unstressed_baseline"]
      );

      this.$set(this.component, "el_baseline", _data["el_baseline"]);
      this.$set(this.component, "el_min_volume", _data["el_min_volume"]);
      this.$set(this.component, "el_max_volume", _data["el_max_volume"]);
      this.$set(this.component, "el_k1", _data["el_k1"]);
      this.$set(this.component, "el_k2", _data["el_k2"]);
      this.$set(this.component, "fo2", _data["fo2"]);
      this.$set(this.component, "fco2", _data["fco2"]);
      this.$set(this.component, "fn2", _data["fn2"]);
      this.$set(this.component, "fother", _data["fother"]);
      this.$set(this.component, "fh2o", _data["fh2o"]);
      this.$set(this.component, "temp", _data["temp"]);
    },

    processGasConnector(_data) {
      this.$set(this.component, "is_enabled", _data["is_enabled"]);
      this.$set(this.component, "no_flow", _data["no_flow"]);
      this.$set(this.component, "no_backflow", _data["no_backflow"]);
      this.$set(this.component, "name", _data["name"]);
      this.$set(this.component, "subtype", _data["subtype"]);
      this.$set(this.component, "comp_from", _data["comp_from"]);
      this.$set(this.component, "comp_to", _data["comp_to"]);
      this.$set(
        this.component,
        "res_forward_baseline",
        _data["res_forward_baseline"]
      );
      this.$set(
        this.component,
        "res_backward_baseline",
        _data["res_backward_baseline"]
      );
      this.$set(this.component, "in_baseline", _data["in_baseline"]);
      this.$set(this.component, "in_k1", _data["in_k1"]);
      this.$set(this.component, "in_k2", _data["in_k2"]);
    },

    processContainer(_data) {
      this.$set(this.component, "is_enabled", _data["is_enabled"]);
      this.$set(this.component, "name", _data["name"]);
      this.$set(this.component, "subtype", _data["subtype"]);
      let comps = "";
      _data["compartments"].forEach(comp => {
        comps += comp + ", ";
      });
      this.$set(this.component, "compartments", comps);

      this.$set(
        this.component,
        "vol_current_baseline",
        _data["vol_current_baseline"]
      );
      this.$set(
        this.component,
        "vol_unstressed_baseline",
        _data["vol_unstressed_baseline"]
      );

      this.$set(this.component, "el_baseline", _data["el_baseline"]);
      this.$set(this.component, "el_min_volume", _data["el_min_volume"]);
      this.$set(this.component, "el_max_volume", _data["el_max_volume"]);
      this.$set(this.component, "el_k1", _data["el_k1"]);
      this.$set(this.component, "el_k2", _data["el_k2"]);
    },
    processExchanger(_data) {
      this.$set(this.component, "is_enabled", _data["is_enabled"]);
      this.$set(this.component, "name", _data["name"]);
      this.$set(this.component, "subtype", _data["subtype"]);
      this.$set(this.component, "comp_blood", _data["comp_blood"]);
      this.$set(this.component, "comp_gas", _data["comp_gas"]);
      this.$set(this.component, "diff_o2", _data["diff_o2"]);
      this.$set(this.component, "diff_co2", _data["diff_co2"]);
      this.$set(this.component, "diff_other", _data["diff_other"]);
    },
    processDiffusor(_data) {
      console.log(_data);
      this.$set(this.component, "is_enabled", _data["is_enabled"]);
      this.$set(this.component, "name", _data["name"]);
      this.$set(this.component, "subtype", _data["subtype"]);
      this.$set(this.component, "comp_1", _data["comp_1"]);
      this.$set(this.component, "comp_2", _data["comp_2"]);
      this.$set(this.component, "medium", _data["medium"]);
      this.$set(this.component, "diff_o2", _data["diff_o2"]);
      this.$set(this.component, "diff_co2", _data["diff_co2"]);
      this.$set(this.component, "diff_other", _data["diff_other"]);
    }
  }
};
</script>

<style></style>

import { ModelInterface } from "src/statics/ExplainEngine/model";

//let model = new ModelInterface("statics/ModelDefinitions/normal_neonate.json")
//let model = new ModelInterface("statics/ModelDefinitions/adult.json");
let model = new ModelInterface("statics/ModelDefinitions/pregnant.json");

export default ({ Vue }) => {
  Vue.prototype.$model = model;
};

export { model };

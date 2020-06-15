import { ModelInterface } from "src/statics/ExplainEngine/model"

let model = new ModelInterface("statics/ModelDefinitions/normal_neonate.json")

export default ( { Vue } ) => {
  Vue.prototype.$model = model 

}

export { model }

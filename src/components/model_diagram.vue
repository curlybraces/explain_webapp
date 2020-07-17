<template>
  <div class="row justify-center items-start">
    <div class="col-2 text-center"><model_props></model_props></div>
    <div class="col text-center">
      <div class="col text-center">
        <div id="stage" />
        <div class="row q-gutter-xs justify-center">
          <q-btn
            color="primary"
            @click="getComponents"
            size="sm"
            label="analyze"
          />
          <q-btn color="primary" size="sm" icon="add" label="COMPARTMENT">
            <q-menu>
              <q-item
                @click="addComponent(0)"
                size="sm"
                clickable
                v-close-popup
              >
                <q-item-section>blood compartment</q-item-section>
              </q-item>
              <q-item @click="addComponent(2)" clickable v-close-popup>
                <q-item-section>gas compartment</q-item-section>
              </q-item>
            </q-menu>
          </q-btn>
          <q-btn color="primary" size="sm" icon="add" label="connector">
            <q-menu>
              <q-item @click="addComponent(1)" clickable v-close-popup>
                <q-item-section>blood connector</q-item-section>
              </q-item>
              <q-item @click="addComponent(4)" clickable v-close-popup>
                <q-item-section>valve</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>shunt</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>gas connector</q-item-section>
              </q-item>
            </q-menu>
          </q-btn>
          <q-btn
            color="primary"
            size="sm"
            icon="add"
            @click="addComponent(3)"
            label="PUMP"
          />
          <q-btn color="primary" size="sm" icon="add" label="CONTAINER" />
          <q-btn
            color="primary"
            @click="addComponent(9)"
            size="sm"
            icon="add"
            label="GASEXCHANGER"
          />
          <q-btn
            color="primary"
            @click="addComponent(10)"
            size="sm"
            icon="add"
            label="DIFFUSOR"
          />
        </div>
      </div>
    </div>
    <div class="col-2 text-center"><component_props></component_props></div>
  </div>
</template>

<script>
import * as PIXI from "pixi.js";
import component_props from "components/component_props";
import model_props from "components/model_props";

var rgbToHex = function(rgb) {
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
};
var fullColorHex = function(r, g, b) {
  var red = rgbToHex(r);
  var green = rgbToHex(g);
  var blue = rgbToHex(b);
  return red + green + blue;
};

export default {
  components: {
    component_props,
    model_props
  },
  data() {
    return {
      adding_type: 0,
      drawing_mode: -1,
      canvas: {
        width: 0,
        height: 0,
        aspect_ratio: 0.7,
        scaling: 25
      },
      current_x: 100,
      current_syl: 30,

      pixi_app: null,
      components: {},
      models: {},
      selectedComponent: null,
      selectedModel: null,
      selectedComponentFrom: null,
      selectedComponentTo: null,
      status: "none",
      selectedComponentSprite: null,
      moveSprite: null,
      turnSprite: null,
      removeSrpite: null,
      resizeSprite: null,
      hideInactive: false
    };
  },

  mounted() {
    this.event_listener = this.$model.modelEngine.addEventListener(
      "message",
      _message => {
        if (_message.data.type === "components") {
          //console.log(_message.data.data);
          this.processData(_message.data.data);
        }
        if (_message.data.type === "state") {
          this.updateData(_message.data.data);
        }
      }
    );

    this.initializeComponent();
  },
  methods: {
    getComponents() {
      this.$model.sendMessageToModelEngine({
        type: "get",
        subtype: "components",
        target: null,
        data: null
      });
    },
    CalculateRadius(volume) {
      let _cubicRadius = volume / ((4.0 / 3.0) * Math.PI);
      let _radius = Math.pow(_cubicRadius, 1.0 / 3.0);
      return _radius;
    },
    CalculateColor(to2) {
      if (to2 > 8) {
        to2 = 8;
      }
      let remap = this.Remap(to2, 0, 8, -2, 1);
      if (remap < 0) remap = 0;
      let red = (remap * 210).toFixed(0);
      let green = (remap * 80).toFixed(0);
      let blue = (80 + remap * 75).toFixed(0);
      let color = "0x" + fullColorHex(red, green, blue);
      return color;
    },
    Remap(value, from1, to1, from2, to2) {
      return ((value - from1) / (to1 - from1)) * (to2 - from2) + from2;
    },
    updateData(_model) {
      //console.log(this.components);
      Object.keys(_model).forEach(key => {
        switch (_model[key].subtype) {
          case "blood_compartment":
            this.updateCompartments(_model[key]);
            break;
          case "blood_connector":
            this.updateFlows(_model[key]);
            break;
          case "valve":
            this.updateFlows(_model[key]);
            break;
          case "shunt":
            this.updateFlows(_model[key]);
            break;
        }
      });
    },
    updateCompartments(_compartment) {
      this.components[_compartment.name].sprite.tint = this.CalculateColor(
        _compartment.to2
      );
    },
    updateFlows(_connector) {
      this.components[_connector.name].current_value1 += _connector.real_flow;
      this.components[_connector.name].current_value2 += _connector.real_flow;

      if (this.components[_connector.name].current_value1 > 1) {
        this.components[_connector.name].current_value1 = 0;
      }
      if (this.components[_connector.name].current_value1 < 0) {
        this.components[_connector.name].current_value1 = 1;
      }

      if (this.components[_connector.name].current_value2 > 1) {
        this.components[_connector.name].current_value2 = 0;
      }
      if (this.components[_connector.name].current_value2 < 0) {
        this.components[_connector.name].current_value2 = 1;
      }

      let pos_start = {
        x: this.components[_connector.comp_from].sprite.x,
        y: this.components[_connector.comp_from].sprite.y
      };
      let pos_intermediate = {
        x: this.components[_connector.name].sprite.x,
        y: this.components[_connector.name].sprite.y
      };
      let pos_end = {
        x: this.components[_connector.comp_to].sprite.x,
        y: this.components[_connector.comp_to].sprite.y
      };

      this.components[_connector.name].length1 = Math.sqrt(
        Math.pow(pos_intermediate.x - pos_start.x, 2) +
          Math.pow(pos_intermediate.y - pos_start.y, 2)
      );

      this.components[_connector.name].length2 = Math.sqrt(
        Math.pow(pos_end.x - pos_intermediate.x, 2) +
          Math.pow(pos_end.y - pos_intermediate.y, 2)
      );

      let remap_t1 = this.Remap(
        this.components[_connector.name].current_value1,
        0,
        1,
        0,
        this.components[_connector.name].length1
      );

      let remap_t2 = this.Remap(
        this.components[_connector.name].current_value2,
        0,
        1,
        0,
        this.components[_connector.name].length2
      );

      let t1 = remap_t1 / this.components[_connector.name].length1;
      this.components[_connector.name].flow_sprite1.x =
        (1 - t1) * pos_start.x + t1 * pos_intermediate.x;
      this.components[_connector.name].flow_sprite1.y =
        (1 - t1) * pos_start.y + t1 * pos_intermediate.y;

      let t2 = remap_t2 / this.components[_connector.name].length2;
      this.components[_connector.name].flow_sprite2.x =
        (1 - t2) * pos_intermediate.x + t2 * pos_end.x;
      this.components[_connector.name].flow_sprite2.y =
        (1 - t2) * pos_intermediate.y + t2 * pos_end.y;
    },
    processData(_components) {
      // process current model components
      Object.keys(_components).forEach(key => {
        if (_components[key].type === "component") {
          this.addComponent(_components[key].subtype, _components[key]);
        }
      });
    },

    showHiddenComponents() {
      Object.keys(this.components).forEach(key => {
        this.components[key].sprite.visible = true;
        this.components[key].text_sprite.visible = true;
        if (this.components[key].flow_sprite1 != undefined) {
          this.components[key].flow_sprite1.visible = true;
          this.components[key].flow_sprite2.visible = true;
          this.components[key].connector.line.visible = true;
        }
        this.components[key]["hidden"] = false;
      });
    },
    setDrawingMode(_mode) {
      if (this.drawing_mode === _mode) {
        this.drawing_mode = 0;
      } else {
        this.drawing_mode = _mode;
      }
    },
    addExistingComponent(component) {},

    addComponent(type, _props = null) {
      let new_comp = {
        sprite: null,
        text_sprite: null,
        flow_sprite: null,
        props: null,
        hidden: false
      };

      new_comp.props = _props;
      new_comp.text_sprite = new PIXI.Text();
      new_comp.text_sprite.style = {
        fontFamily: "Arial",
        fontSize: 8,
        fill: 0x000000
      };

      switch (type) {
        case "blood_compartment": // bloodcompartment
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/compartment-old.svg"
          );
          new_comp.text_sprite.text = _props.name;

          break;
        case "container": // bloodcompartment
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/container_current.svg"
          );

          new_comp.text_sprite.text = _props.name;

          break;
        case "blood_connector": // bloodconnector
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/connector_current.svg"
          );
          new_comp.sprite.rotation = Math.PI * 0.5;

          new_comp.flow_sprite1 = new PIXI.Sprite.from(
            "statics/Sprites/compartment.svg"
          );
          new_comp.current_value1 = 0;

          new_comp.flow_sprite2 = new PIXI.Sprite.from(
            "statics/Sprites/compartment.svg"
          );
          new_comp.current_value2 = 0;

          new_comp.text_sprite.text = _props.name;

          break;
        case "gas_connector": // bloodconnector
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/connector_gas_current.svg"
          );
          new_comp.text_sprite.text = _props.name;
          break;
        case "gas_compartment": // gascompartment
          new_comp.sprite = new PIXI.Sprite.from("statics/Sprites/air.svg");
          new_comp.text_sprite.text = _props.name;
          break;

        case "pump": // pump
          new_comp.sprite = new PIXI.Sprite.from("statics/Sprites/pump2.svg");
          new_comp.text_sprite.text = _props.name;
          break;
        case "valve": // valve
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/valve_current.svg"
          );

          new_comp.flow_sprite1 = new PIXI.Sprite.from(
            "statics/Sprites/compartment.svg"
          );
          new_comp.current_value1 = 0;

          new_comp.flow_sprite2 = new PIXI.Sprite.from(
            "statics/Sprites/compartment.svg"
          );
          new_comp.current_value2 = 0;

          new_comp.text_sprite.text = _props.name;
          break;
        case "shunt": // valve
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/shunt_current.svg"
          );

          new_comp.flow_sprite1 = new PIXI.Sprite.from(
            "statics/Sprites/compartment.svg"
          );
          new_comp.current_value1 = 0;

          new_comp.flow_sprite2 = new PIXI.Sprite.from(
            "statics/Sprites/compartment.svg"
          );
          new_comp.current_value2 = 0;

          new_comp.sprite.rotation = Math.PI * 0.5;
          new_comp.text_sprite.text = _props.name;
          break;
        case "exchanger": // exchanger
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/exchanger.svg"
          );
          new_comp.text_sprite.text = _props.name;
          break;
        case "diffusor": // diffusor
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/diffusor.svg"
          );
          new_comp.text_sprite.text = _props.name;
          break;

        default:
          console.log("sssssssssss");
          console.log(type);
          break;
      }

      new_comp.sprite.anchor.set(0.5);
      new_comp.text_sprite.anchor.set(0.5);

      new_comp.sprite.width = 25;
      new_comp.sprite.height = 25;

      if (new_comp.flow_sprite1 != null) {
        new_comp.flow_sprite1.width = 10;
        new_comp.flow_sprite1.height = 10;
        new_comp.flow_sprite1.anchor.set(0.5);
        new_comp.flow_sprite1.x = this.current_x;
        new_comp.flow_sprite1.y = this.current_syl;
        this.pixi_app.stage.addChild(new_comp.flow_sprite1);

        new_comp.flow_sprite2.width = 10;
        new_comp.flow_sprite2.height = 10;
        new_comp.flow_sprite2.anchor.set(0.5);
        new_comp.flow_sprite2.x = this.current_x;
        new_comp.flow_sprite2.y = this.current_syl;
        this.pixi_app.stage.addChild(new_comp.flow_sprite2);
      }

      new_comp.sprite.x = this.current_x;
      new_comp.sprite.y = this.current_syl;

      new_comp.text_sprite.x = this.current_x;
      new_comp.text_sprite.y = this.current_syl + 17;

      this.current_x += 90;
      if (this.current_x > this.canvas.width - 50) {
        this.current_x = 100;
        this.current_syl += 50;
      }

      new_comp.sprite.interactive = true;
      new_comp.sprite.on("click", () => {
        this.selectComponent(new_comp);
      });

      if (
        new_comp.props.subtype === "blood_connector" ||
        new_comp.props.subtype === "valve" ||
        new_comp.props.subtype === "shunt"
      ) {
        new_comp["connector"] = {
          line: undefined
        };
        this.drawConnector(new_comp);
      }

      this.pixi_app.stage.addChild(new_comp.sprite);

      this.pixi_app.stage.addChild(new_comp.text_sprite);

      this.components[new_comp.props.name] = new_comp;
    },
    updateConnectors() {
      Object.keys(this.components).forEach(key => {
        if (
          this.components[key].props.subtype === "blood_connector" ||
          this.components[key].props.subtype === "valve" ||
          this.components[key].props.subtype === "shunt"
        ) {
          this.drawConnector(this.components[key]);
        }
      });
    },
    drawConnector(_component) {
      if (_component.connector["line"] != undefined) {
        this.pixi_app.stage.removeChild(_component.connector.line);
      }

      _component["connector"] = {
        x0: this.components[_component.props["comp_from"]].sprite.x,
        y0: this.components[_component.props["comp_from"]].sprite.y,
        x1: this.components[_component.props["comp_to"]].sprite.x,
        y1: this.components[_component.props["comp_to"]].sprite.y,
        line: new PIXI.Graphics(),
        name: _component.props["name"]
      };

      _component.connector.line.lineStyle(1, 0x000000, 1);
      // draw a shape
      _component.connector.line.moveTo(
        _component.connector.x0,
        _component.connector.y0
      );
      _component.connector.line.lineTo(
        _component.sprite.x,
        _component.sprite.y
      );
      _component.connector.line.lineTo(
        _component.connector.x1,
        _component.connector.y1
      );

      if (_component.hidden === false) {
        this.pixi_app.stage.addChild(_component.connector.line);
      }
    },
    selectComponent(clickedComponent) {
      if (this.selectedComponent === clickedComponent) {
        this.selectedComponent = null;
        this.selectedComponentSprite.visible = false;
      } else {
        this.selectedComponent = clickedComponent;
        this.selectedComponentSprite.x = clickedComponent.sprite.x;
        this.selectedComponentSprite.y = clickedComponent.sprite.y;
        this.selectedComponentSprite.visible = true;
        this.$root.$emit("selected_component", clickedComponent["props"].name);

        if (this.drawing_mode === 4) {
          this.selectedComponent["hidden"] = true;
          this.selectedComponent.sprite.visible = false;
          this.selectedComponent.text_sprite.visible = false;
          if (this.selectedComponent.flow_sprite1 != undefined) {
            this.selectedComponent.flow_sprite1.visible = false;
            this.selectedComponent.flow_sprite2.visible = false;
            this.selectedComponent.connector.line.visible = false;
          }
          this.selectedComponent = null;
          this.selectedComponentSprite.visible = false;
        }
      }
    },
    moveSelectedSprite(e) {
      if ((this.selectedComponent != null) & (this.drawing_mode === 0)) {
        let pos = e.data.global;

        let current_dy =
          this.selectedComponent.text_sprite.y -
          this.selectedComponent.sprite.y;
        this.selectedComponent.sprite.x = pos.x;
        this.selectedComponent.sprite.y = pos.y;
        this.selectedComponent.text_sprite.x = pos.x;
        this.selectedComponent.text_sprite.y = pos.y + current_dy;
        if (this.selectedComponent.flow_sprite1 != null) {
          this.selectedComponent.flow_sprite1.x = pos.x;
          this.selectedComponent.flow_sprite1.y = pos.y;

          this.selectedComponent.flow_sprite2.x = pos.x;
          this.selectedComponent.flow_sprite2.y = pos.y;
        }

        this.selectedComponentSprite.x = pos.x;
        this.selectedComponentSprite.y = pos.y;

        this.updateConnectors();
      }
    },
    initializeComponent() {
      // define a pixi app with the canvas as view

      PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
      PIXI.settings.ROUND_PIXELS = true;

      this.pixi_app = new PIXI.Application({
        transparent: false,
        autoResize: true,
        resolution: devicePixelRatio,
        antialias: true,
        backgroundColor: 0xeeeeee
      });
      document.querySelector("#stage").appendChild(this.pixi_app.view);

      // listen for the window resize events
      window.addEventListener("resize", this.resize);

      // listen for keypresses
      window.addEventListener("keydown", this.keypress);

      // add interactivity
      this.pixi_app.stage.interactive = true;
      this.pixi_app.stage.on("pointermove", this.moveSelectedSprite);

      // define the selected component sprite
      this.selectedComponentSprite = new PIXI.Sprite.from(
        "statics/Sprites/compartment-old.svg"
      );
      this.selectedComponentSprite.anchor.set(0.5);
      this.selectedComponentSprite.width = 75;
      this.selectedComponentSprite.height = 75;
      this.selectedComponentSprite.x = 10;
      this.selectedComponentSprite.y = 10;
      this.selectedComponentSprite.alpha = 0.2;
      this.pixi_app.stage.addChild(this.selectedComponentSprite);
      this.selectedComponentSprite.tint = "0xff0000";
      this.selectedComponentSprite.visible = false;

      this.moveSprite = new PIXI.Sprite.from("statics/Sprites/move.svg");
      this.moveSprite.anchor.set(0.5);
      this.moveSprite.width = 20;
      this.moveSprite.height = 20;
      this.moveSprite.x = 30;
      this.moveSprite.y = 30;
      this.moveSprite.alpha = 0.2;
      this.pixi_app.stage.addChild(this.moveSprite);
      this.moveSprite.interactive = true;
      this.moveSprite.on("click", () => {
        this.changeDrawingMode("move");
      });

      this.turnSprite = new PIXI.Sprite.from("statics/Sprites/turn.svg");
      this.turnSprite.anchor.set(0.5);
      this.turnSprite.width = 20;
      this.turnSprite.height = 20;
      this.turnSprite.x = 30;
      this.turnSprite.y = 70;
      this.turnSprite.alpha = 0.2;
      this.pixi_app.stage.addChild(this.turnSprite);
      this.turnSprite.interactive = true;
      this.turnSprite.on("click", () => {
        this.changeDrawingMode("turn");
      });

      this.resizeSprite = new PIXI.Sprite.from("statics/Sprites/resize.svg");
      this.resizeSprite.anchor.set(0.5);
      this.resizeSprite.width = 20;
      this.resizeSprite.height = 20;
      this.resizeSprite.x = 30;
      this.resizeSprite.y = 110;
      this.resizeSprite.alpha = 0.2;
      this.pixi_app.stage.addChild(this.resizeSprite);
      this.resizeSprite.interactive = true;
      this.resizeSprite.on("click", () => {
        this.changeDrawingMode("resize");
      });

      this.hideSprite = new PIXI.Sprite.from("statics/Sprites/hide.svg");
      this.hideSprite.anchor.set(0.5);
      this.hideSprite.width = 20;
      this.hideSprite.height = 20;
      this.hideSprite.x = 30;
      this.hideSprite.y = 150;
      this.hideSprite.alpha = 0.2;
      this.pixi_app.stage.addChild(this.hideSprite);
      this.hideSprite.interactive = true;
      this.hideSprite.on("click", () => {
        this.changeDrawingMode("hide");
      });

      this.showSprite = new PIXI.Sprite.from("statics/Sprites/show.svg");
      this.showSprite.anchor.set(0.5);
      this.showSprite.width = 20;
      this.showSprite.height = 20;
      this.showSprite.x = 30;
      this.showSprite.y = 190;
      this.showSprite.alpha = 0.2;
      this.pixi_app.stage.addChild(this.showSprite);
      this.showSprite.interactive = true;
      this.showSprite.on("click", () => {
        this.showHiddenComponents();
      });

      this.removeSprite = new PIXI.Sprite.from("statics/Sprites/remove.svg");
      this.removeSprite.anchor.set(0.5);
      this.removeSprite.width = 20;
      this.removeSprite.height = 20;
      this.removeSprite.x = 30;
      this.removeSprite.y = 230;
      this.removeSprite.alpha = 0.2;
      //this.pixi_app.stage.addChild(this.removeSprite);
      this.removeSprite.interactive = true;
      this.removeSprite.on("click", () => {
        this.changeDrawingMode("remove");
      });

      this.resize();
      this.buildDiagram();
    },
    changeDrawingMode(_mode) {
      switch (_mode) {
        case "move":
          this.moveSprite.alpha = 1;
          this.turnSprite.alpha = 0.2;
          this.resizeSprite.alpha = 0.2;
          this.removeSprite.alpha = 0.2;
          this.hideSprite.alpha = 0.2;
          this.drawing_mode = 0;
          break;
        case "turn":
          this.moveSprite.alpha = 0.2;
          this.turnSprite.alpha = 1;
          this.resizeSprite.alpha = 0.2;
          this.removeSprite.alpha = 0.2;
          this.hideSprite.alpha = 0.2;
          this.drawing_mode = 1;
          break;
        case "remove":
          this.moveSprite.alpha = 0.2;
          this.turnSprite.alpha = 0.2;
          this.resizeSprite.alpha = 0.2;
          this.removeSprite.alpha = 1;
          this.hideSprite.alpha = 0.2;
          this.drawing_mode = 2;
          break;
        case "resize":
          this.moveSprite.alpha = 0.2;
          this.turnSprite.alpha = 0.2;
          this.removeSprite.alpha = 0.2;
          this.resizeSprite.alpha = 1;
          this.hideSprite.alpha = 0.2;
          this.drawing_mode = 3;
          break;
        case "hide":
          this.moveSprite.alpha = 0.2;
          this.turnSprite.alpha = 0.2;
          this.removeSprite.alpha = 0.2;
          this.resizeSprite.alpha = 0.2;
          this.hideSprite.alpha = 1;
          this.drawing_mode = 4;
          break;
      }
    },
    keypress(e) {
      if ((e.key === "ArrowLeft") & (this.drawing_mode === 1)) {
        this.selectedComponent.sprite.rotation -= 0.1;
      }
      if ((e.key === "ArrowRight") & (this.drawing_mode === 1)) {
        this.selectedComponent.sprite.rotation += 0.1;
      }
      if ((e.key === "ArrowRight") & (this.drawing_mode === 3)) {
        this.selectedComponent.sprite.width += 1;
        this.selectedComponent.sprite.height += 1;
        this.selectedComponent.text_sprite.y += 0.5;
      }
      if ((e.key === "ArrowLeft") & (this.drawing_mode === 3)) {
        this.selectedComponent.sprite.width -= 1;
        this.selectedComponent.sprite.height -= 1;
        this.selectedComponent.text_sprite.y -= 0.5;
      }
      if ((e.key === "x") & (this.drawing_mode === 4)) {
        this.hideComponent();
      }
    },

    resize() {
      const parent = this.pixi_app.view.parentNode;
      this.canvas.width = parent.clientWidth * 0.9;
      this.canvas.height = parent.clientWidth * 0.9 * this.canvas.aspect_ratio;

      this.pixi_app.renderer.resize(this.canvas.width, this.canvas.height);

      // You can use the 'screen' property as the renderer visible
      // area, this is more useful than view.width/height because
      // it handles resolution

      //rect.position.set(this.pixi_app.screen.width, this.pixi_app.screen.height);

      this.buildDiagram();
    },
    buildDiagram() {
      // first map all model components and then generate a map
      // mouse interacti
    }
  }
};
</script>

<style>
.custom {
  width: 100%;
}

#frame {
  margin-top: 10px;
  width: 100%;
  height: auto;
}
</style>

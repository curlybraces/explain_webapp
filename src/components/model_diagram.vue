<template>
  <div class="row justify-center items-start">
    <div class="col-2 text-center">controls</div>
    <div class="col text-center">
      <div class="col text-center">
        <div id="stage" />
        <div class="row q-gutter-xs justify-center">
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
    <div class="col-2 text-center"><compartment_props></compartment_props></div>
  </div>
</template>

<script>
import * as PIXI from "pixi.js";
import compartment_props from "components/compartment_props";

export default {
  components: {
    compartment_props
  },
  data() {
    return {
      adding_type: 0,
      drawing_mode: -1,
      canvas: {
        width: 0,
        height: 0,
        aspect_ratio: 0.7
      },

      pixi_app: null,
      components: [],
      models: [],
      selectedComponent: null,
      selectedModel: null,
      selectedComponentFrom: null,
      selectedComponentTo: null,
      status: "none",
      selectedComponentSprite: null,
      moveSprite: null,
      turnSprite: null,
      removeSrpite: null
    };
  },

  mounted() {
    this.initializeComponent();
  },
  methods: {
    setDrawingMode(_mode) {
      if (this.drawing_mode === _mode) {
        this.drawing_mode = 0;
      } else {
        this.drawing_mode = _mode;
      }
    },
    addComponent(type) {
      let new_comp = {
        sprite: null
      };

      switch (type) {
        case 0: // bloodcompartment
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/compartment.svg"
          );
          break;
        case 1: // bloodconnector
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/connector.svg"
          );
          break;
        case 2: // gascompartment
          new_comp.sprite = new PIXI.Sprite.from("statics/Sprites/air.svg");
          break;
        case 3: // pump
          new_comp.sprite = new PIXI.Sprite.from("statics/Sprites/pump2.svg");
          break;
        case 4: // valve
          new_comp.sprite = new PIXI.Sprite.from("statics/Sprites/valve 2.svg");
          break;
        case 9: // exchanger
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/exchanger.svg"
          );
          break;
        case 10: // diffusor
          new_comp.sprite = new PIXI.Sprite.from(
            "statics/Sprites/diffusor.svg"
          );
          break;
      }

      new_comp.sprite.anchor.set(0.5);
      new_comp.sprite.width = 25;
      new_comp.sprite.height = 25;
      new_comp.sprite.x = this.canvas.width / 2;
      new_comp.sprite.y = this.canvas.height / 2;
      new_comp.sprite.interactive = true;
      new_comp.sprite.on("click", () => {
        this.selectComponent(new_comp);
      });

      this.pixi_app.stage.addChild(new_comp.sprite);
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
      }
    },
    moveSelectedSprite(e) {
      if ((this.selectedComponent != null) & (this.drawing_mode === 0)) {
        let pos = e.data.global;

        this.selectedComponent.sprite.x = pos.x;
        this.selectedComponent.sprite.y = pos.y;
        this.selectedComponentSprite.x = pos.x;
        this.selectedComponentSprite.y = pos.y;
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
      this.selectedComponentSprite.width = 100;
      this.selectedComponentSprite.height = 100;
      this.selectedComponentSprite.x = 10;
      this.selectedComponentSprite.y = 10;
      this.selectedComponentSprite.alpha = 0.1;
      this.pixi_app.stage.addChild(this.selectedComponentSprite);
      this.selectedComponentSprite.tint = "0xff0000";
      this.selectedComponentSprite.visible = false;

      this.moveSprite = new PIXI.Sprite.from("statics/Sprites/move.svg");
      this.moveSprite.anchor.set(0.5);
      this.moveSprite.width = 20;
      this.moveSprite.height = 20;
      this.moveSprite.x = 30;
      this.moveSprite.y = 30;
      this.moveSprite.alpha = 0.1;
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
      this.turnSprite.alpha = 0.1;
      this.pixi_app.stage.addChild(this.turnSprite);
      this.turnSprite.interactive = true;
      this.turnSprite.on("click", () => {
        this.changeDrawingMode("turn");
      });

      this.removeSprite = new PIXI.Sprite.from("statics/Sprites/remove.svg");
      this.removeSprite.anchor.set(0.5);
      this.removeSprite.width = 20;
      this.removeSprite.height = 20;
      this.removeSprite.x = 30;
      this.removeSprite.y = 110;
      this.removeSprite.alpha = 0.1;
      this.pixi_app.stage.addChild(this.removeSprite);
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
          this.turnSprite.alpha = 0.1;
          this.removeSprite.alpha = 0.1;
          this.drawing_mode = 0;
          break;
        case "turn":
          this.moveSprite.alpha = 0.1;
          this.turnSprite.alpha = 1;
          this.removeSprite.alpha = 0.1;
          this.drawing_mode = 1;
          break;
        case "remove":
          this.moveSprite.alpha = 0.1;
          this.turnSprite.alpha = 0.1;
          this.removeSprite.alpha = 1;
          this.drawing_mode = 2;
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

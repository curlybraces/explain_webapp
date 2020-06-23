<template>
  <div class="row justify-center items-start">
    <div class="col-2 text-center">controls</div>
    <div class="col text-center">
      <div class="col text-center">
        <div id="stage" />
        <div class="row q-gutter-xs justify-center">
          <q-btn color="negative" icon="add" label="ADD">
            <q-menu>
              <q-item @click="addComponent(0)" clickable v-close-popup>
                <q-item-section>blood compartment</q-item-section>
              </q-item>
              <q-item @click="addComponent(1)" clickable v-close-popup>
                <q-item-section>blood connector</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>valve</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>shunt</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>gas connector</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>gas compartment</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>container</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>exchanger</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>diffusor</q-item-section>
              </q-item>
            </q-menu>
          </q-btn>
          <q-btn color="negative" icon="link" label="CONNECT" />
          <q-btn color="negative" icon="remove" label="REMOVE" />
        </div>
      </div>
    </div>
    <div class="col-2 text-center">{{ adding_type }}</div>
  </div>
</template>

<script>
import * as PIXI from "pixi.js";

export default {
  data() {
    return {
      adding_type: 0,
      drawing_mode: 0,
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
      status: "none"
    };
  },

  mounted() {
    this.initializeComponent();
  },
  methods: {
    addComponent(type) {
      console.log(type);
    },
    initializeComponent() {
      // define a pixi app with the canvas as view
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

      // add interactivity
      this.pixi_app.stage.interactive = true;
      //this.pixi_app.stage.on("pointermove", this.moveSelectedSprite);

      this.resize();
      this.buildDiagram();
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

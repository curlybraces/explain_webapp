<template>
  <div class="col text-center">
    <div id="stage" />
  </div>
</template>

<script>
import * as PIXI from "pixi.js";

export default {
  data() {
    return {
      drawing_mode: 0,
      aspect_ratio: 0.75,
      pixi_app: null,
      components: [],
      selectedComponent: null,
      compartmentFrom: null,
      compartmentTo: null,
      status: "none"
    };
  },
  mounted() {
    this.initializeComponent();
  },
  methods: {
    dragMode() {
      this.drawing_mode = 0;
      this.selectedComponent = null;
      this.compartmentFrom = null;
      this.compartmentTo = null;
    },
    connectMode() {
      this.drawing_mode = 1;
      this.selectedComponent = null;
      this.compartmentFrom = null;
      this.compartmentTo = null;
    },
    addCompartment() {
      this.drawing_mode = 0;
      let new_component = {
        sprite_file_name: "statics/Sprites/compartment.svg",
        sprite: null
      };
      new_component.sprite = new PIXI.Sprite.from(
        new_component.sprite_file_name
      );
      new_component.sprite.id = "test";
      new_component.sprite.anchor.set(0.5);
      new_component.sprite.x = this.pixi_app.screen.width / 2;
      new_component.sprite.y = this.pixi_app.screen.height / 2;
      new_component.sprite.width = 40;
      new_component.sprite.height = 40;
      new_component.sprite.interactive = true;
      new_component.sprite.on("click", () => {
        this.componentClicked(new_component);
      });

      this.components.push(new_component);

      this.pixi_app.stage.addChild(new_component.sprite);
    },
    removeCompartment() {
      this.drawing_mode = 2;
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
      this.pixi_app.stage.on("pointermove", this.moveSelectedSprite);

      this.resize();
      this.buildDiagram();
    },
    resize() {
      const parent = this.pixi_app.view.parentNode;
      this.width = parent.clientWidth;
      this.height = parent.clientWidth * this.aspect_ratio;

      this.pixi_app.renderer.resize(
        parent.clientWidth,
        parent.clientWidth * this.aspect_ratio
      );

      // You can use the 'screen' property as the renderer visible
      // area, this is more useful than view.width/height because
      // it handles resolution

      //rect.position.set(this.pixi_app.screen.width, this.pixi_app.screen.height);

      this.buildDiagram();
    },
    buildDiagram() {
      // first map all model components and then generate a map
      // mouse interacti
    },

    componentClicked(clickedComponent) {
      switch (this.drawing_mode) {
        case 0:
          if (this.selectedComponent === clickedComponent) {
            this.selectedComponent = null;
          } else {
            this.selectedComponent = clickedComponent;
          }
          break;
        case 1:
          if (this.compartmentFrom === null) {
            clickedComponent.sprite.tint = "#ff0000";
            this.compartmentFrom = clickedComponent;
            this.status = "select comprtment to";
            break;
          }
          if (this.compartmentTo === null) {
            this.compartmentTo = clickedComponent;
            this.status = "selected comprtment to and start drawing";
          }

          break;
        case 2:
          this.pixi_app.stage.removeChild(clickedComponent.sprite);
          break;
      }
    },
    moveSelectedSprite(e) {
      if (this.selectedComponent != null) {
        let pos = e.data.global;
        this.selectedComponent.sprite.x = pos.x;
        this.selectedComponent.sprite.y = pos.y;
      }
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

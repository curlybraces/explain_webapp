<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          EXPLAIN - explanatory models in neonatology
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      :breakpoint="767"
      :width="50"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <br />
        <q-item
          v-for="nav in navs"
          :key="nav.label"
          :to="nav.to"
          exact
          clickable
        >
          <q-item-section>
            <q-icon :name="nav.icon"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label> {{ nav.caption }} </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "MainLayout",

  data() {
    return {
      leftDrawerOpen: false,
      navs: [
        {
          label: "circulation",
          caption: "",
          icon: "fas fa-heartbeat",
          to: "/"
        },
        {
          label: "ventilation",
          caption: "",
          icon: "fas fa-lungs",
          to: "/ventilator"
        },
        {
          label: "charts",
          caption: "",
          icon: "fas fa-chart-line",
          to: "/"
        },
        {
          label: "labs",
          caption: "",
          icon: "fas fa-flask",
          to: "/"
        },
        {
          label: "drugs",
          caption: "",
          icon: "fas fa-syringe",
          to: "/"
        },
        {
          label: "pregnancy",
          caption: "",
          icon: "fas fa-female",
          to: "/"
        },
        {
          label: "settings",
          caption: "",
          icon: "fas fa-sliders-h",
          to: "/"
        },
        {
          label: "info",
          caption: "",
          icon: "info",
          to: "/"
        }
      ]
    };
  }
};
</script>

<script>
  import Fa from "svelte-fa/src/fa.svelte";
  import {
    faPencil,
    faMapMarker,
    faSlash,
    faDrawPolygon,
  } from "@fortawesome/free-solid-svg-icons";
  import Button from "./Button.svelte";
  import { GEO_TYPES, TOOLS, STATES } from "../constants";
  import { tool, geo, panelOff, geoTypes, currentGeoType } from "../store";

  const ICONS = {
    [GEO_TYPES.POINT]: faMapMarker,
    [GEO_TYPES.LINE_STRING]: faSlash,
    [GEO_TYPES.POLYGON]: faDrawPolygon,
  };

  export let create = true;
  export let edit = true;
  let createHover = false;

  const toggleMode = (button, next) => {
    button.blur();

    tool.update((prev) => {
      const n =
        prev === next && $panelOff
          ? TOOLS.NONE
          : prev === TOOLS.NONE || $panelOff
          ? next
          : prev;
      console.log(prev, next, "->", n);
      return n;
    });
  };

  const toggleGeo = (button, next) => {
    button.blur();

    geo.set(next);

    if ($tool !== TOOLS.CREATE) {
      toggleMode(button, TOOLS.CREATE);
    }
  };
</script>

{#if create}
  <div class="flex" on:mouseleave={() => (createHover = false)}>
    <Button
      active={$tool === TOOLS.CREATE}
      enabled={$panelOff}
      title="Create {$currentGeoType} Features"
      onClick={(evt) => toggleMode(evt.currentTarget, TOOLS.CREATE)}
      on:mouseenter={() => (createHover = true)}
    >
      <Fa icon={ICONS[$currentGeoType]} fw size="sm" class="mx-auto" />
    </Button>
    <div class={createHover && $geoTypes.length > 1 ? "flex" : "hidden"}>
      {#each $geoTypes as g}
        <Button
          active={$currentGeoType === g}
          title={g}
          onClick={(evt) => toggleGeo(evt.currentTarget, g)}
        >
          <Fa icon={ICONS[g]} fw size="sm" class="mx-auto" />
        </Button>
      {/each}
    </div>
  </div>
{/if}

{#if edit}
  <Button
    active={$tool === TOOLS.EDIT}
    enabled={$panelOff}
    title="Edit Features"
    onClick={(evt) => toggleMode(evt.currentTarget, TOOLS.EDIT)}
  >
    <Fa icon={faPencil} fw size="sm" class="mx-auto" />
  </Button>
{/if}

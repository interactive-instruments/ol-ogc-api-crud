<script>
  import { STATES, TOOLS } from "../constants";
  import {
    sync,
    panelOff,
    error,
    tool,
    changes,
    hasChanges,
    collection,
    feature,
    clear,
  } from "../store";
  import Button from "./Button.svelte";
  import Table from "./Table.svelte";

  export let allowDelete;
  export let onSaveAsync;
  export let onDeleteAsync;
  const handlers = {};

  const handleAsync = (promise) =>
    promise
      .then((discardChanges) => {
        if (discardChanges) {
          console.log("CONFLICT");
          handlers.discard = discardChanges;
        } else {
          console.log("CLEARING");
          clear();
        }
      })
      .catch((err) => {
        console.log("ERROR", err);
        error.set(err.message);
        sync.set(STATES.ERROR);
      });

  const onSave = () => {
    sync.set(STATES.SYNC);

    return handleAsync(onSaveAsync());
  };
  const onDelete = () => {
    sync.set(STATES.SYNC);

    return handleAsync(onDeleteAsync());
  };
</script>

<div
  id="ogc-api-editor-panel"
  class="ol-unselectable font-sans bg-white/90 text-slate-700 flex transform absolute bottom-0 left-0 w-full h-1/4 ease-in-out transition-transform duration-1000 pointer-events-auto"
  class:translate-y-full={$panelOff}
  class:translate-y-0={!$panelOff}
>
  <div
    id="ogc-api-editor-panel-main"
    class="flex flex-col justify-between py-2 px-4 min-w-[150px]"
  >
    <div class="flex flex-col items-center border-b-2 border-slate-500 pb-2">
      <h3
        id="ogc-api-editor-panel-header"
        class="text-lg font-bold text-slate-700"
      >
        {$collection}
      </h3>
      <h3
        id="ogc-api-editor-panel-header2"
        class="text-base font-semibold text-slate-500"
      >
        {$feature}
      </h3>
    </div>
    <Button
      color="bg-sky-600"
      ringColor="ring-sky-600"
      enabled={$hasChanges}
      onClick={onSave}
    >
      Save
    </Button>
    <Button onClick={clear}>Cancel</Button>
    {#if $tool === TOOLS.EDIT && allowDelete}
      <Button color="bg-red-600" ringColor="ring-red-600" onClick={onDelete}
        >Delete</Button
      >
    {/if}
  </div>
  <div id="ogc-api-editor-panel-attributes" class="grow p-2 overflow-y-auto">
    <Table editables={$changes} />
  </div>
  {#if $sync === STATES.SYNC}
    <div
      id="ogc-api-editor-panel-overlay"
      class="bg-white/90 absolute w-full h-full flex justify-center items-center"
    >
      <div class="text-xl font-bold text-slate-500 animate-pulse">
        Saving...
      </div>
    </div>
  {/if}
  {#if $sync === STATES.ERROR}
    <div
      id="ogc-api-editor-panel-error"
      class="bg-red-200/90 absolute w-full h-full flex flex-col gap-2 justify-center items-center"
    >
      <div class="text-xl font-bold text-slate-500 text-center">{$error}</div>
      <Button
        color="bg-slate-400"
        ringColor="ring-slate-400"
        onClick={() => sync.set(STATES.IDLE)}>Ok</Button
      >
    </div>
  {/if}
  {#if $sync === STATES.CONFLICT}
    <div
      id="ogc-api-editor-panel-conflict"
      class="bg-amber-100/90 absolute w-full h-full flex flex-col gap-2 justify-around items-center p-2"
    >
      <div class="text-base text-slate-500 text-center">
        The feature was changed by somebody else since you started to edit it.
        It will now be reloaded and you will be taken back to the editor.<br
        />You can either discard your changes to see what was changed remotely
        or merge your changes on top of the reloaded feature which might hide
        the remote changes.
      </div>
      <div class="flex flex-row gap-2">
        <Button
          color="bg-slate-400"
          ringColor="ring-slate-400"
          onClick={() => {
            handlers.discard();
            sync.set(STATES.IDLE);
          }}>Discard my changes</Button
        >
        <Button
          color="bg-slate-400"
          ringColor="ring-slate-400"
          onClick={() => {
            sync.set(STATES.IDLE);
          }}>Merge my changes</Button
        >
      </div>
    </div>
  {/if}
</div>

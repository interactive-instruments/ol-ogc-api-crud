<script>
  import { changesProps } from "../store";

  export let editables = [];

  const onChange = (key, value) => {
    changesProps.update((prev = {}) => ({ ...prev, [key]: value }));
  };
</script>

<table class="w-full border-collapse text-sm">
  {#each editables as prop}
    <tr class="even:bg-slate-300/40" class:font-bold={prop.isDirty}>
      <!-- DO NOT REMOVE pl-4 pl-8 pl-12 pl-16 pl-20 pl-24 -->
      <td class={`w-1/3 p-1 pl-${prop.depth * 4}`} title={prop.name}
        >{prop.label}</td
      >
      <td>
        {#if prop.isValue}
          <input
            type="text"
            class="w-full bg-transparent p-1 placeholder:italic placeholder:text-slate-400"
            value={prop.value}
            placeholder="not set"
            on:input={(evt) => onChange(prop.name, evt.target.value)}
          />
        {/if}
      </td>
    </tr>
  {/each}
</table>

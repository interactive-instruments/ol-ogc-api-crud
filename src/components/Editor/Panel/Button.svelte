<script>
  export let enabled = true;
  export let color = "bg-slate-300";
  export let ringColor = "ring-slate-300";
  export let onClick;
</script>

<button
  disabled={!enabled}
  on:click={onClick}
  class={`px-4 py-1 text-sm text-white ${color} disabled:${color}/75 font-semibold rounded-full border border-transparent focus:outline-none hover:enabled:ring-2 ${ringColor} hover:enabled:ring-offset-2`}
>
  <slot />
</button>

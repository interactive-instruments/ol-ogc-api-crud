<script>
  export let enabled = true;
  export let active = false;
  export let title;
  export let onClick;
</script>

<button
  disabled={!enabled}
  {title}
  on:click={onClick}
  on:mouseenter
  on:mouseleave
  class="disabled:opacity-70 hover:disabled:opacity-50"
  class:active-button={active}
>
  <slot />
</button>

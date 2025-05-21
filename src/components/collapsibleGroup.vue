<script setup>
import { ref } from 'vue';

const props = defineProps({
    groupName: String,
    collapsed: Boolean
});

const visible = ref(!props.collapsed);

</script>
<template>
    <div>
        <div class="flexRow">
            <h3 @click="visible = !visible">{{ props.groupName }}</h3>
            <button class="collapseButton" @click="visible = !visible">{{ visible ? '\u25BC' : '\u25B6' }}</button>
        </div>
        <div v-show="visible">
            <slot></slot>
        </div>
    </div>
</template>
<style scoped>
.collapseButton {
    background-color: inherit;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    padding: revert;
    font-size: revert;
}

h3 {
    cursor: pointer;
    white-space: nowrap;
}
</style>
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
        <div class="topLine">
            <h3 @click="visible = !visible">{{ props.groupName }}</h3>
            <button class="collapseButton" @click="visible = !visible">{{ visible ? '\u25BC' : '\u25B6' }}</button>
        </div>
        <div v-show="visible">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.topLine {
    display: flex;
    flex-direction: row;
}

.collapseButton {
    background-color: var(--color-background-mute);
    border: none;
    color: var(--color-text);
    cursor: pointer;
}

h3 {
    cursor: pointer;
    white-space: nowrap;
}
</style>
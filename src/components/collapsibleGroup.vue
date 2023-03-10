<script setup>
import { ref } from 'vue';

const props = defineProps({
    groupName: String
});

const visible = ref(true);

function handleCollapse(event) {
    if (visible.value) {
        visible.value = false;
    } else {
        visible.value = true;
    }
}
</script>

<template>
    <div>
        <div class="topLine">
            <h3 @click="handleCollapse">{{ props.groupName }}</h3>
            <button class="collapseButton" @click="handleCollapse">{{ visible ? '\u25BC' : '\u25B6' }}</button>
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
    background-color: var(--color-background);
    border: none;
    color: var(--color-text);
    cursor: pointer;
}

h3 {
    cursor: pointer;
}
</style>
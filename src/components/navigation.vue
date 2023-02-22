<template>
    <span class="navigationBar">
        <div class="item">
            <slot name="home"></slot>
        </div>
        <div class="item"> | </div>
        <div class="item">
            <slot name="search"></slot>
        </div>
    </span>
</template>

<style scoped>
.navigationBar {
    display: flex;
    flex-direction: row;
}
.item {
    margin: 2rem auto 0;
    padding: 5px 8px 0;
    color: var(--color-navigation)
}
</style>

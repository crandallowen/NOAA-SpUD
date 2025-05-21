<script setup>
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
auth.login()
</script>
<template>
</template>
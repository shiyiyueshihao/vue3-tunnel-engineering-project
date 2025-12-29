<template>
    <h3>隧道设计信息</h3>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useLoginStore } from '@/stores/loginStore';
import router from '@/router/index'
import workManagementRoute from '@/router/dynamicRoute';

const loginStore = useLoginStore()
onMounted(() => {
    //  判断当前用户权限
    if (loginStore.permission === "admin") {
        router.addRoute('layout', workManagementRoute)
    }
})
</script>

<style scoped></style>
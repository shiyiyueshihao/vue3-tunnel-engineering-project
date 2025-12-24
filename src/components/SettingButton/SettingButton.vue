<template>
    <div class="setting">
        <el-button class="btn" type="primary" plain @click="showDrawerHandler">
            <el-icon>
                <Setting />
            </el-icon>
        </el-button>
        <el-drawer class="drawer" v-model="drawer" title="系统设置" :with-header="true" size="20%">
            
            <span class="text">是否显示Logo</span>
            <el-switch class="switch" v-model="ControlLogoStore.isShowLogo" />
        </el-drawer>
    </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
import { ref } from 'vue';
import { useControlLogoStore } from '@/stores/ControlLogoStore';

const ControlLogoStore = useControlLogoStore()
const drawer = ref<boolean>(false)

function showDrawerHandler() {
    drawer.value = true
}


</script>

<style scoped lang="scss">
.setting {

    .btn {
        font-size: 18px;
        position: fixed;
        right: 10px;
        top: 220px;
        z-index: 999;
    }

    .drawer{
        
        .text{
            font-size: 15px;
        }

        .switch{
            padding-left: 10px;
        }
    }
}
</style>
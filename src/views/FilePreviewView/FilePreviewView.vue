<template>
    <div class="preview-container">
        <iframe v-if="isPdf" :src="`http://localhost:3000${fileSrc}`" frameborder="0" class="full-iframe"></iframe>

        <div v-else-if="isImage" class="image-wrapper">
            <el-image :src="`http://localhost:3000${fileSrc}`" fit="contain" class="full-img"
                :preview-src-list="[`http://localhost:3000${fileSrc}`]" :initial-index="0" :hide-on-click-modal="true"
                :preview-teleported="true">
                <template #error>
                    <div class="image-slot">加载失败</div>
                </template>
            </el-image>
            <p class="hint">点击图片可开启交互预览（支持滚动缩放/拖拽）</p>
        </div>

        <div v-else class="no-data">
            <p>暂无预览或不支持的文件格式</p>
        </div>
    </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';

/** 
 *          预览 
 *              1.  pdf    iframe 
 *              2.  图片   image
 * 
 * 
 *          接收参数
 *              1.  接收链接    src 拼接     拿到链接就可以判断类型   如果是 图片  --> image     如果是 pdf  --> iframe
*/

const route = useRoute()

// 从 query 接收文件名
const fileSrc = route.query.fileSrc as string || "";

import { useRoute } from 'vue-router';

// 判断是否为 PDF
const isPdf = computed(() => {
    if (!fileSrc) return false;
    const lowerSrc = fileSrc.toLowerCase();
    return lowerSrc.endsWith('.pdf');

});


// 判断是否为图片 (jpg, jpeg, png, webp)
const isImage = computed(() => {
    if (!fileSrc) return false;
    const lowerSrc = fileSrc.toLowerCase();
    return lowerSrc.endsWith('.jpg') ||
        lowerSrc.endsWith('.jpeg') ||
        lowerSrc.endsWith('.png') ||
        lowerSrc.endsWith('.webp');
});




</script>

<style scoped lang="scss">
.preview-container {
    width: 100%;
    height: 100vh;
    background-color: #f5f7fa; // 给预览区一个浅色背景，更有质感
    display: flex;
    align-items: center;
    /* 垂直居中 */
    justify-content: center;
    /* 水平居中 */
    overflow: hidden;

    .image-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .hint {
            margin-top: 10px;
            color: #909399;
            font-size: 14px;
        }
    }

    .full-img {
        max-width: 80%;
        /* 限制初始大小，不要顶满 */
        max-height: 80%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        /* 加点阴影好看很多 */
        cursor: zoom-in;
        /* 提示用户可以点击放大 */
    }

    .full-iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
}
</style>
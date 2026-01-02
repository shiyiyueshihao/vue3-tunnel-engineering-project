<template>

    <div class="preview-container">
        <iframe v-if="isPdf" :src="`http://localhost:3000${fileSrc}`" frameborder="0" class="full-iframe"></iframe>

        <img v-else-if="isImage" :src="`http://localhost:3000${fileSrc}`" alt="预览图片" class="full-img">

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


// 判断是否为图片 (jpg, jpeg, png, gif)
const isImage = computed(() => {
    if (!fileSrc) return false;
    const lowerSrc = fileSrc.toLowerCase();
    return lowerSrc.endsWith('.jpg') ||
        lowerSrc.endsWith('.jpeg') ||
        lowerSrc.endsWith('.png') ||
        lowerSrc.endsWith('.gif');
});




</script>

<style scoped lang="scss">
.preview-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .full-iframe {
        width: 100%;
        flex: 1;
        /* 自动撑满剩余空间 */
        border: none;
    }

    .full-img {
        max-width: 100%;
        height: auto;
        margin: 0 auto;
        display: block;
    }

    .no-data {
        text-align: center;
        padding-top: 50px;
        color: #999;
    }
}
</style>
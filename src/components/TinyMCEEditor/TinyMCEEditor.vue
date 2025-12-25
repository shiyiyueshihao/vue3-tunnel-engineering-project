<template>
    <div class="tinymce-box">
        <!-- 
        1.  安装依赖  npm install tinymce @tinymce/tinymce-vue    6版本不给用了
        2.  下载中文安装包     https://www.tiny.cloud/get-tiny/language-packages/
        3.  解压安装包 并  将 langs 文件夹放入 项目的 public的 tinymce 文件夹下
        4.  把  node_modules 下 的 tinymce 里的 skins 皮肤 复制一份到 项目的 public的 tinymce 文件夹下
        5.  创建独立组件  <Editor> </Editor>
        6.  script
        7.  父传子 props --  子传父 

       修改说明：
       1. 绑定 v-model 到内部变量 myValue
       2. 直接使用 setup 中定义的 init 配置
    -->
        <Editor v-model="myValue" :init="init" :disabled="disabled"></Editor>
    </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted, toRefs } from "vue";

// 引入组件
import tinymce from 'tinymce/tinymce';      //  tinymce 默认 hidden ，不引入不显示
import Editor from '@tinymce/tinymce-vue';

// 引入主题和图标 (必须)
import 'tinymce/themes/silver/theme';   //  主题文件
import 'tinymce/icons/default';
import 'tinymce/models/dom';    //  Bug修复

// 引入插件 (按需引入)
import 'tinymce/plugins/image' // 插入上传图片插件
import "tinymce/plugins/importcss"; //图片工具
import 'tinymce/plugins/table' // 插入表格插件
import 'tinymce/plugins/lists' // 列表插件
import "tinymce/plugins/charmap"; // 特殊字符
import 'tinymce/plugins/wordcount' // 字数统计插件
import "tinymce/plugins/codesample"; // 插入代码
import "tinymce/plugins/code"; // 查看源码
import "tinymce/plugins/fullscreen"; //全屏
import 'tinymce/plugins/link' // 连接
import 'tinymce/plugins/preview' // 预览
// import "tinymce/plugins/template" //插入模板
import 'tinymce/plugins/save' // 保存
import "tinymce/plugins/searchreplace"; //查询替换
import "tinymce/plugins/pagebreak"; //分页
import "tinymce/plugins/insertdatetime"; //时间插入


// 定义 Props (遵循 Vue3 v-model 规范，推荐使用 modelValue)
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    plugins: {
        type: [String, Array],
        default: 'lists image media table wordcount save preview'
    },
    toolbar: {
        type: [String, Array],
        // 注意：TinyMCE 6/7/8 中 formatselect 已改名为 blocks
        default: 'undo redo | blocks | bold italic underline strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent blockquote | lists image table | codesample code removeformat save preview'
    }
});

// 定义 Emits
const emit = defineEmits(["update:modelValue", "onDataEvent"]);

// 内部变量
const myValue = ref(props.modelValue);

tinymce.license_key = 'gpl';

// 配置项
const init = reactive({
    selector: 'textarea',   // change this value according to your HTML

    // 3. 性能优化：禁止编辑器自动去云端找插件（解决加载慢）
    base_url: '/tinymce',
    suffix: '.min',

    width: '100%', // 建议使用 100% 自适应
    height: 300,
    language_url: '/tinymce/langs/zh_CN.js', // 确保 public 目录下有此文件
    language: 'zh_CN',
    skin_url: '/tinymce/skins/ui/oxide', // 确保 public 目录下有此文件夹
    content_css: '/tinymce/skins/content/default/content.css', // 确保 public 目录下有此文件
    plugins: props.plugins,
    toolbar: props.toolbar,
    branding: false,
    //  隐藏菜单栏
    menubar: false,
    // 是否显示底部状态栏
    statusbar: true,


    // 【重要修复】图片上传处理函数 (TinyMCE 6+ 必须返回 Promise)
    images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
        if (blobInfo.blob().size > 1024 * 1024 * 5) {
            reject("图片大小不能超过 5MB");
            return;
        }
        // 这里演示 Base64 方式，实际开发通常是上传到服务器返回 http 地址
        const img = 'data:image/jpeg;base64,' + blobInfo.base64();
        // 成功时 resolve 图片地址
        resolve(img);
    }),

    // 初始化完成
    init_instance_callback: (editor) => {
        console.log("初始化完成 ID:", editor.id);
    }
});

// 监听外部 modelValue 变化，同步到内部 (父传子)
watch(() => props.modelValue, (newValue) => {
    if (newValue !== myValue.value) {
        myValue.value = newValue;
    }
});

// 监听内部内容变化，同步到外部 (子传父)
watch(myValue, (newValue) => {
    emit("update:modelValue", newValue); // 标准 Vue3 v-model 更新
    emit("onDataEvent", newValue);       // 兼容你原来的事件
});

/**
 * 【重要修复】
 * 删除了 onMounted 中的 tinymce.init({})
 * <editor> 组件加载时会自动初始化，手动调用会导致逻辑冲突或不可见的问题。
 */

</script>

<style scoped>
.tinymce-box {
    width: 100%;
}
</style>

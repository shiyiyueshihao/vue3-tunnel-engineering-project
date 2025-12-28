/**
 *      使用 i18n
 *              1.  创建  js/ts 文件  --  创建插件
 *              2.  项目引入 i18n依赖
 *                  2.1 i18n     vue3 只支持9版本及以上        vue2只支持8版本及以下
 *                  2.2 npm install vue-i18n
 *              3.  插件文件中创建 i18 n
 *                  3.1     const i18n = createI18n( {
 *                                  .......  
 *                            } )
 *              4.  配置  i18n
 *              5.  设置语言   messages {   zh:{   }   ,    en:{   }  ...... }
 *              6.  全局加载   导出i18n 然后 app.use(i18n)
 *              7.  {{  $t( '  message.navs   ' )  }}    --  这里配置的是  你设置的当前语言环境对应的 message下的navs 的 内容
 * 
 *      
 *      Element-plus    的语言切换      --      https://element-plus.org/zh-CN/guide/i18n
 *          1.  指南里 有 国际化 
 *          2.  全局引入和配置 然后设置 语言 
 * 
 * 
 *      利用  本地存储 来设置 语言   先初始化为zh  后面通过三元来确定是否切换英文  如果更多 那就得考虑 函数里
 * 
 *      最后  刷新UI   或者 计算属性    让页面重新渲染一遍
 *              location.relaod()
 *              const { t ,locale } = useI18n()    computed( ()=>t('message.navs))
*/

import { createI18n } from "vue-i18n";


import zhLang from '@/i18n/zh/zh.ts'
import enLang from '@/i18n/en/en.ts'

const i18n = createI18n({

    legacy: false,                       //      必须显示设为 false ，才能在 setup 中 使用 useI18n
    locale: String(localStorage.getItem("lang")),                //      设置当前语言环境   默认 中文       --      动态修改(通过获取本地存储)
    globalInjection: true,               //      允许访问形式 $t 来访问

    messages: {
        //  中文
        zh: zhLang,
        //  英文
        en: enLang
    }

})


//  导出 i18n 插件
export default i18n
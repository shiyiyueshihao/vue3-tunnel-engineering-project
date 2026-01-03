<template>
    <div class="work-container">
        <div class="data-container">
            <el-card :class="`card-${item.name}`" style="width: 880px" shadow="always" v-for="(item,index) in cardData.list" :key="index">
                <div :class="`${item.name}-iconfont`">
                    <!-- <div class="blue-radius"></div> -->
                    <span :class="`iconfont  ${item.iconName}`"></span>
                </div>
                <div :class="`${item.name}-content`">
                    <p class="text">{{ item.text }}</p>
                    <p class="num">{{ item.num }}</p>
                    <p class="remark">{{ item.remark }}</p>
                </div>
            </el-card>


            <!-- <el-card class="card-orange" style="width: 880px" shadow="always"></el-card>
            <el-card class="card-red" style="width: 880px" shadow="always"></el-card>
            <el-card class="card-green" style="width: 880px" shadow="always"></el-card> -->
        </div>
        <div class="table-container">

        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const cardData = reactive({
    list:[
        {
            name:"blue",
            text:"本月监督计划",
            num:1250,
            remark:"任务总数",
            iconName:"icon-yiwanchengshijian"
        },
        {
            name:"orange",
            text:"待办监督项",
            num:35,
            remark:"今日待核查（开挖、喷锚）",
            iconName:"icon-yiwanchengshijian"
        },
        {
            name:"red",
            text:"未闭环隐患",
            num:18,
            remark:"逾期未整改",
            iconName:"icon-sanjiaogantanhao"
        },
        {
            name:"green",
            text:"监督合格率",
            num:"96.5%",    //  这个可能需要你算 现在写死吧
            remark:"质量受控水平",
            iconName:"icon-yewu_hege"
        },
    ]
})




</script>

<style scoped lang="scss">
//  引入 iconfonts 里的 样式 
@import url('../../assets/iconfonts/workCardIcon/iconfont.css');

// 定义卡片 通用  灵活  混合 样式
@mixin status-card($name, $border-clolr, $iconfont-color, $brfore-bgcolor) {
    .card-#{$name} {
        border-left: 8px solid $border-clolr;
        box-sizing: border-box;

        // el-card__body  display:flex  才能让内部实现flex布局
        .#{$name}-iconfont {
            margin-left: 10px;
            height: 80px;
            line-height: 80px;
            box-sizing: border-box;

            .iconfont {
                font-size: 80px;
                color: $iconfont-color;

                &::before {
                    border-radius: 50%;
                    background-color: $brfore-bgcolor;
                }
            }

        }

        .#{$name}-content {
            margin-left: 30px;
            box-sizing: border-box;

            .text {
                font-size: 20px;
                height: 20px;
                line-height: 20px;
                font-weight: 700;
            }

            .num {
                padding-top: 10px;
                height: 40px;
                line-height: 40px;
                font-size: 40px;
                font-weight: 700;
                padding-bottom: 10px;
                font-family: "楷体";
            }

            .remark {
                color: rgb(194, 192, 192);
                font-size: 13px;
                font-weight: 700;
            }
        }

    }
}

.work-container {
    width: 100%;
    margin: 10px auto;
    // background-color: #fff;

    .data-container {
        height: 150px;
        gap: 20px;

        display: flex;

        //  蓝色卡片  -- include 混合使用
        @include status-card("blue", #3C88E0, #388AF6, #DEECFC);
        //  橙色卡片
        @include status-card("orange", #E79248, #FD9031, #FAEEDF);
        //  红色卡片
        @include status-card("red", #DE4C50, #EC605A, #FBE6E5);
        //  绿色卡片
        @include status-card("green", #47B180, #34B77E, #E2F6EA);

        // .card-blue {
        //     border-left: 8px solid #3C88E0;
        //     box-sizing: border-box;

        //     // el-card__body  display:flex  才能让内部实现flex布局
        //     .blue-iconfont {
        //         height: 108px;
        //         line-height: 108px;

        //         .iconfont {
        //             font-size: 50px;
        //             color: #388AF6;

        //             &::before {
        //                 border-radius: 50%;
        //                 background-color: #DEECFC;
        //             }
        //         }

        //     }

        //     .blue-content {
        //         margin-left: 15px;
        //         box-sizing: border-box;

        //         .text {
        //             text-align: center;
        //             font-size: 20px;
        //             height: 20px;
        //             line-height: 20px;
        //             font-weight: 700;
        //         }

        //         .number {
        //             padding-top: 10px;
        //             height: 40px;
        //             line-height: 40px;
        //             font-size: 40px;
        //             font-weight: 700;
        //             padding-bottom: 10px;

        //         }

        //         .remark {
        //             color: gray;
        //             font-size: 16px;
        //         }
        //     }

        // }

        .card-orange {
            border-left: 8px solid #EE9244;
            box-sizing: border-box;
        }

        .card-red {
            border-left: 8px solid #E04C4F;
            box-sizing: border-box;
        }

        .card-green {
            border-left: 8px solid #38B079;
            box-sizing: border-box;
        }

    }

}
</style>
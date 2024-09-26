<template>
    <div>
        <h3>訂單編號 : {{ id }}</h3>
        <h5 class="mb-4 text-info">訂單狀態 : {{ handleStatus(order?.status!) }}</h5>
        <ul>
            <li v-for="item in order?.orderItems" class="flex items-center mb-4">
                <img :src="item.imgUrl || '/images/defaultProduct.png'" class="w-[75px] h-[75px]" alt="">
                <h5 class="ml-4 w-[20%]">{{ item.productName }}</h5>
                <p v-if="item.discountPrice" class="w-[20%]">
                    <span class="line-through text-gray-400">
                        ${{ item.price }}
                    </span>
                    <span class="text-danger">
                        ${{ item.discountPrice }}
                    </span>
                </p>
                <p v-else class="w-[20%]">${{ item.price }}</p>
                <p class="w-10%">x{{ item.quantity }}</p>
            </li>
        </ul>
        <el-divider />
        <div class="mb-4">
            <p>訂單金額 : ${{ order?.totalAmount }}</p>
            <p>訂購日期 : {{ order?.createdAt }}</p>
            <p>收件人姓名 : {{ order?.recipientName }}</p>
            <p>收件人手機 : {{ order?.recipientPhone }}</p>
            <p>配送地址 : {{ order?.recipientAddress }}</p>
            <p>訂單備註 : {{ order?.notes }}</p>
        </div>
        <div>
            <el-timeline>
                <el-timeline-item v-for="(activity, index) in orderTimeStamp" :key="index"
                    :timestamp="activity.timestamp" class="text-white">
                    {{ activity.content }}
                </el-timeline-item>
            </el-timeline>
        </div>
        <div class="flex justify-center">
            <el-button type="danger" @click="cancelOrder" v-if="order?.status !== 'canceled'">取消訂單</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useMemberStore } from '@/store/index';

const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
const memberStore = useMemberStore();
// 獲取動態路由參數
const route = useRoute()
const id = route.params.id;
const order = ref<Order | null>(null);
const orderTimeStamp = ref<OrderTimeStamp>([])
const cancelOrder = async () => {
    try {
        await $fetch(`${apiBaseUrl}/order/${id}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            async onResponse({ response }) {
                if (response.status === 204) {
                    ElNotification({
                        title: 'Success',
                        message: "訂單已取消",
                        type: 'success',
                    })
                    await getOrder()
                }
            }
        })

    }
    catch (error: any) {
        if (error.response.status === 401) {
            handleRefreshToken();
        }
        else {
            handleError(error);
        }
    }
}
const handleStatus = (status: string) => {
    let formatStatus = "";
    switch (status) {
        case "created":
            formatStatus = "確認訂單中"
            break;
        case "confirmed":
            formatStatus = "等待出貨中"
            break;
        case "shipped":
            formatStatus = "已出貨"
            break;
        case "delivered":
            formatStatus = "已送達"
            break;
        case "canceled":
            formatStatus = "已取消"
            break;
    }
    return formatStatus;
}


const getOrder = async () => {
    try {
        await $fetch(`${apiBaseUrl}/order/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            }, onRequest() {
                showLoading();
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    order.value = response._data.responseData
                    orderTimeStamp.value = response._data.responseData.orderTimeStamp
                }
            }
        })
    } catch (error: any) {
        if (error.response.status === 400) {
            navigateTo("/account/order");
        }
        else if (error.response.status === 401) {
            handleRefreshToken();
        }
        else {
            handleError(error);
        }
    } finally {
        hideLoading();
    }
}
onMounted(async () => {
    await getOrder();
})


</script>
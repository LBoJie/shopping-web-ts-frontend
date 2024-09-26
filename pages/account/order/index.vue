<template>
    <div class="flex justify-around p-8 w-full cursor-pointer mobile:p-0 mobile:mb-4 mobile:text-xs">
        <span :class="choosedStatus === 'all' ? ['text-success', 'font-bold'] : ''"
            @click="choosedStatus = 'all'">所有訂單</span>
        <span :class="choosedStatus === 'created' ? ['text-success', 'font-bold'] : ''"
            @click="choosedStatus = 'created'">確認訂單中</span>
        <span :class="choosedStatus === 'confirmed' ? ['text-success', 'font-bold'] : ''"
            @click="choosedStatus = 'confirmed'">等待出貨中</span>
        <span :class="choosedStatus === 'shipped' ? ['text-success', 'font-bold'] : ''"
            @click="choosedStatus = 'shipped'">已出貨</span>
        <span :class="choosedStatus === 'delivered' ? ['text-success', 'font-bold'] : ''"
            @click="choosedStatus = 'delivered'">已送達</span>
        <span :class="choosedStatus === 'canceled' ? ['text-success', 'font-bold'] : ''"
            @click="choosedStatus = 'canceled'">已取消</span>
    </div>
    <div class="flex p-8 w-full mobile:hidden">
        <span class="w-[10%]">訂單編號</span>
        <span class="w-[20%]">訂購日期</span>
        <span class="w-[30%]">產品圖片</span>
        <span class="w-[10%]">產品件數</span>
        <span class="w-[15%]">狀態</span>
        <span class="w-[15%]">訂單金額</span>
    </div>
    <div class="px-8 mobile:px-0">
        <NuxtLink :to="`/account/order/${order.id}`" class="flex items-center py-8 mobile:flex-wrap"
            v-for="order in showOrders" :key="order.id">
            <span class="w-[10%] mobile:w-1/2"><span class="hidden mobile:inline">訂單編號 : </span>{{ order.id }}</span>
            <span class="w-[20%] mobile:w-1/2 mobile:text-end">{{ order.createdAt }}</span>
            <span class="w-[28%] flex overflow-hidden mr-[2%] mobile:w-full mobile:mr-0 mobile:my-2">
                <img class="w-[50px] h-[50px] mr-1" :src="product.imgUrl || '/images/defaultProduct.png'"
                    v-for="product in order.orderItems" alt="" :key="product.productId">
            </span>
            <span class="w-[10%] mobile:w-[30%]"> 共 {{ order.orderItems.length }} 件</span>
            <span class="w-[15%] mobile:w-[30%]">{{ handleStatus(order.status) }}</span>
            <span class="w-[15%] mobile:w-[40%] mobile:text-end">${{ order.totalAmount }}</span>
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
import { useMemberStore } from '@/store/index';
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
const memberStore = useMemberStore();
const orders = ref<Order[]>([]);
const choosedStatus = ref("all");
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
const showOrders = computed(() => {
    if (choosedStatus.value === "all") {
        return orders.value
    }
    else {
        return orders.value.filter((order) => {
            return order.status === choosedStatus.value
        })
    }
})


onMounted(async () => {
    try {
        await $fetch(`${apiBaseUrl}/order`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            onRequest() {
                showLoading();
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    orders.value = response._data.responseData
                }
            }
        })
    } catch (error: any) {
        if (error.response.status === 401) {
            handleRefreshToken();
        }
        else {
            handleError(error);
        }
    }
    finally {
        hideLoading();
    }
})
</script>

<style scoped lang="scss"></style>
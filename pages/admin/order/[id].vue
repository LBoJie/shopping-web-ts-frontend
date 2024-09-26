<template>
    <h3>訂單編號 : {{ id }}</h3>
    <div class="flex pb-8">
        <div class="w-[70%]">
            <div>
                <p>收件人姓名 : {{ order?.recipientName }}</p>
                <p>收件人手機 : {{ order?.recipientPhone }}</p>
                <p>收件地址 : {{ order?.recipientAddress }}</p>
                <p>訂單金額 : ${{ order?.totalAmount }}</p>
                <p>訂單備註 : {{ order?.notes }}</p>
            </div>
            <ul class="py-8">
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
        </div>
        <div class="w-[30%]">
            <p class="mb-4">訂單狀態 :</p>
            <el-timeline>
                <el-timeline-item v-for="(activity, index) in orderTimeStamp" :key="index"
                    :timestamp="activity.timestamp" class="text-white">
                    {{ activity.content }}
                </el-timeline-item>
            </el-timeline>
            <el-button @click="handleStaus()"
                v-if="order?.status !== 'canceled' && order?.status !== 'delivered'">下一步</el-button>
            <el-button type="danger" @click="handleStaus(true)" v-if="order?.status !== 'canceled'">取消訂單</el-button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useMemberStore } from '@/store/index';
const memberStore = useMemberStore();
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
definePageMeta({
    layout: 'admin',
})
const route = useRoute();
const id = route.params.id;
const order = ref<Order | null>(null);

const statusArr = ["created", "confirmed", "shipped", "delivered", "canceled"];
const handleStaus = async (isCanceled: boolean = false) => {
    try {
        let status = "";
        if (isCanceled) {
            if (order.value?.status === "canceled") {
                ElNotification({
                    title: 'Error',
                    message: "此訂單已取消",
                    type: 'error',
                })
                return
            }

            status = "canceled"
        }
        else {
            const index = statusArr.findIndex((item) => item === order.value!.status)
            if (index === 4 || statusArr[index + 1] === "canceled") {
                ElNotification({
                    title: 'Error',
                    message: "此訂單流程已結束",
                    type: 'error',
                })
                return
            }
            status = statusArr[index + 1]
        }
        await $fetch(`${apiBaseUrl}/admin/order/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            }, body: {
                status
            },
            onRequest() {
                showLoading();
            },
            async onResponse({ response }) {
                if (response.status === 204) {
                    ElNotification({
                        title: 'Success',
                        message: "訂單狀態更新成功",
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
        else if (error.response.status === 403) {
            alert("無權限進行此操作，返回首頁")
            navigateTo("/")
        }
        else {
            handleError(error);
        }
    }
    finally {
        hideLoading();
    }
}




const orderTimeStamp = ref<OrderTimeStamp>([])
const getOrder = async () => {
    try {
        await $fetch(`${apiBaseUrl}/admin/order/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            onRequest() {
                showLoading();
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    order.value = response._data.responseData
                    orderTimeStamp.value = response._data.responseData.orderTimeStamp
                }
            }
        })
    }
    catch (error: any) {
        if (error.response.status === 401) {
            handleRefreshToken();
        }
        else if (error.response.status === 403) {
            alert("無權限進行此操作，返回首頁")
            navigateTo("/")
        }
        else {
            handleError(error);
        }
    }
    finally {
        hideLoading();
    }
}

onMounted(async () => {
    await getOrder();
})

</script>
<style scoped lang="scss">
:deep(.el-timeline-item__content) {
    color: #fff;
}
</style>
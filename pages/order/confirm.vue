<template>
    <div class="w-[800px] mx-auto bg-info-6 min-h-[300px] rounded-xl p-8 mobile:w-full mobile:p-2">
        <ClientOnly>
            <div class="mb-8">
                <h5 class="text-xl font-bold mb-2">收件資訊</h5>
                <p>收件人姓名 : {{ orderStore.order?.name }}</p>
                <p>收件人手機 : {{ orderStore.order?.phone }}</p>
                <p>收件地址 : {{ orderStore.order?.address }}</p>
                <p>訂單備註 : {{ orderStore.order?.notes }}</p>
            </div>
        </ClientOnly>
        <el-divider />
        <el-scrollbar class="h-[400px]">
            <div class="flex pr-8 mobile:hidden">
                <span class="w-[45%]">商品</span>
                <span class="w-[15%]">單價</span>
                <span class="w-[15%]">數量</span>
                <span class="w-[15%] ml-auto">小計</span>
            </div>
            <div class="flex my-8 items-center pr-8 mobile:my-4 mobile:flex-wrap" v-for="item in cart"
                :key="item.productId">
                <div class="w-[45%] flex items-center mobile:w-full mobile:mb-4">
                    <img class="w-[80px] h-[80px] object-cover mr-8 shrink-0"
                        :src="item.imgUrl || '/images/defaultProduct.png'" alt="">{{ item.name }}
                    <span class="border text-danger p-1 text-xs ml-2" v-if="item.status === '0'">已下架</span>
                </div>
                <div class="w-[15%] mobile:w-[40%] text-danger" v-if="item.discountPrice">
                    <span class="text-danger">${{ item.discountPrice }}</span>
                    <span class="text-sm line-through ml-1 text-gray-400">${{ item.price }}</span>
                </div>
                <div class="w-[15%] mobile:w-[40%]" v-else>
                    ${{ item.price }}
                </div>
                <div class="w-[15%]"> <span class="hidden mobile:inline-block">x</span>{{ item.quantity }}</div>
                <div class="w-[15%] text-danger ml-auto">${{ (item.discountPrice || item.price) * item.quantity }}</div>
            </div>
        </el-scrollbar>
        <el-divider />
        <div>
        </div>

        <div class="text-end">
            <h5 class="text-xl font-bold text-primary mb-4">購物車 - 總金額 : {{ totalAmount }}</h5>
            <el-button type="success" round @click="sendOrder">送出訂單</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMemberStore, useOrderStore } from '@/store/index';
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
const memberStore = useMemberStore();
const orderStore = useOrderStore();
const cart = ref<CartItem[]>([]);
const totalAmount = ref(0);
const sendOrder = async () => {
    showLoading();
    try {
        await $fetch<ApiResponse>(`${apiBaseUrl}/cart/check`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`
            }
        })

    }
    catch (error: any) {
        hideLoading();
        if (error.response.status === 400) {
            let warningText = error.response._data.responseData.join("<br />");
            ElMessageBox.alert(warningText, '購物車商品不可結帳', {
                dangerouslyUseHTMLString: true,
            })
        }
        else if (error.response.status === 401) {
            handleRefreshToken();
        }
        else {
            handleError(error);
        }
    }
    try {
        await $fetch(`${apiBaseUrl}/order`, {
            method: "POST",
            body: {
                name: orderStore.order!.name,
                phone: orderStore.order!.phone,
                address: orderStore.order!.address,
                notes: orderStore.order!.notes,
                totalAmount: totalAmount.value
            },
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
        });
        await ElMessageBox.alert("訂單已成立", "訂單成立", {
            confirmButtonText: "前往",
            type: "success",
        })
            .then(async () => {
                await memberStore.getCart();
                orderStore.clearOrder();
                navigateTo("/account/order");
            })
            .catch(() => { });
    } catch (error: any) {
        hideLoading();
        if (error.response.status === 401) {
            handleRefreshToken();
        }
        else {
            handleError(error);
        }
    }
    hideLoading();
}
onMounted(async () => {
    if (!orderStore.order || !memberStore.member) {
        navigateTo("/cart");
    }
    await memberStore.getCart();
    cart.value = memberStore.cart;
    totalAmount.value = cart.value.reduce((total, item) => total + (item.discountPrice || item.price) * item.quantity, 0);
})
</script>

<template>
    <el-scrollbar class="h-[500px]">
        <div class="flex pr-8 mobile:hidden">
            <span class="w-[30%]">
                商品
            </span>
            <span class="w-[15%]">單價</span>
            <span class="w-[30%]">數量</span>
            <span class="w-[15%]">小計</span>
            <span class="ml-auto">操作</span>
        </div>
        <div class="flex my-8 items-center pr-8 mobile:flex-wrap mobile:pr-2" v-for="item in cart"
            :key="item.productId">
            <div class="w-[30%] flex items-center mobile:w-full ">
                <img class="w-[80px] h-[80px] object-cover mr-8 shrink-0"
                    :src="item.imgUrl || '/images/defaultProduct.png'" alt="">{{ item.name }}
                <span class="border text-danger p-1 text-xs ml-2" v-if="item.status === '0'">已下架</span>
            </div>
            <div class="w-[15%] mobile:w-[30%]">
                <span v-if="item.discountPrice">
                    <span class="text-danger">${{ item.discountPrice }}</span>
                    <span class="text-sm line-through ml-1 text-gray-400">${{ item.price }}</span>
                </span>
                <span v-else>
                    ${{ item.price }}
                </span>
            </div>
            <div class="w-[30%] mobile:w-[50%]">
                <el-input-number :disabled="quantityProcessing" v-model="item.quantity" :min="1"
                    @change="modifyCartItem(item)" />
            </div>
            <div class="w-[15%] mobile:hidden text-danger">${{ (item.discountPrice || item.price) * item.quantity }}
            </div>
            <div class="ml-auto cursor-pointer">
                <el-icon @click="deleteCartItem(item.productId)" class="text-[20px]">
                    <Delete />
                </el-icon>
            </div>
        </div>
    </el-scrollbar>
    <el-divider />
    <div class="text-end">
        <h5 class="text-xl font-bold text-primary mb-4">購物車 - 總金額 : {{ cartAmount }}</h5>
        <el-button type="success" round size="large" @click="checkOut">前往結帳</el-button>
    </div>


</template>

<script setup lang="ts">
import { useMemberStore, useOrderStore } from '@/store/index';
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
const memberStore = useMemberStore();
const orderStore = useOrderStore();
const cart = ref<CartItem[]>([]);
const quantityProcessing = ref(false);


const modifyCartItem = async (item: CartItem) => {
    quantityProcessing.value = true;
    await memberStore.modifyCartItem(item);
    cart.value = memberStore.cart;
    quantityProcessing.value = false;
}
const deleteCartItem = async (productId: number) => {
    await memberStore.deleteCartItem(productId);
    cart.value = memberStore.cart;
}
const cartAmount = computed(() => {
    return cart.value.reduce((total, item) => total + (item.discountPrice || item.price) * item.quantity, 0)
})
const checkOut = async () => {
    if (!memberStore.member) {
        await ElMessageBox.confirm(
            '結帳前請先登入',
            '請先登入',
            {
                confirmButtonText: '前往登入',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
            .then(() => {
                navigateTo({ path: '/login', query: { redirect: '/cart' } });
            })
            .catch(() => {
            })
        return
    }
    try {
        await $fetch<ApiResponse>(`${apiBaseUrl}/cart/check`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`
            }
        })
        navigateTo('/order/info');
    } catch (error: any) {
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

}
onMounted(async () => {
    orderStore.clearOrder();
    await memberStore.getCart();
    cart.value = memberStore.cart;
})

</script>

<style scoped lang="scss"></style>
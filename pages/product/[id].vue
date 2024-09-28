<template>
    <div class="text-sm ">
        <NuxtLink class="hover:text-primary hover:underline" to="/category/0">
            所有分類
        </NuxtLink> /
        <NuxtLink class="hover:text-primary hover:underline" :to="`/category/${product.categoryId}`">
            {{ product?.categoryName }}
        </NuxtLink> /
        <NuxtLink>{{ product?.name }}</NuxtLink>

    </div>

    <div class="flex items-center mobile:flex-wrap">
        <img :src="product.imgUrl || '/images/defaultProduct.png'" alt="" class="w-[500px] h-[500px] object-cover mobile:w-full mobile:h-auto">
        <div class="grow ml-8 mobile:ml-0">
            <h3 class="mb-4 text-info text-3xl font-bold">{{ product?.name }}</h3>
            <h5 v-if="product.promotion" class="text-3xl font-bold">
                <span class="text-base text-danger">$</span>
                <span class="text-danger">{{ product.promotion.discountPrice }} </span>
                <el-tag class="ml-2" type="danger">{{ product.promotion.discountValue / 10 }} 折</el-tag>
                <span class="text-sm line-through ml-4 text-gray-400">原價${{ product.price }}</span>
            </h5>
            <h5 v-else class="text-3xl font-bold"><span class=" text-base">$</span>{{ product?.price }}</h5>
            <el-divider />
            <div class="mb-4">
                <span class="mr-4">購買數量</span>
                <el-input-number v-model="cartItem.quantity" :min="product.inventory !== 0 ? 1 : 0"
                    :max="product.inventory" @change="handleChange" />
                <span class="ml-4 text-xs text-gray-400">還剩{{ product.inventory }} 件</span>
            </div>
            <div class="mobile:text-end">
                <el-button type="success" :loading="cartLoading" :disabled="product.inventory === 0"
                    @click="addToCart">加入購物車</el-button>
                <el-button type="primary" :loading="cartLoading" :disabled="product.inventory === 0"
                    @click="buyNow">立即購買</el-button>
            </div>
        </div>
    </div>
    <el-divider />
    <div class="w-full" v-if="product.descriptionHtml" v-html="product.descriptionHtml"></div>
</template>

<script setup lang="ts">
import { useMemberStore } from '@/store/index';
const memberStore = useMemberStore();
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
const route = useRoute();
const id = route.params.id;
const { data, error } = await useFetch<ApiResponse<Product>>(`${apiBaseUrl}/product/${id}`, { method: "GET" })
if (error.value) {
    throw createError({
        statusCode: 404,
        message: '無此商品',
        fatal: true
    })
}
const product = ref<Product>(data.value!.responseData);
const handleChange = () => {
    if (cartItem.value.quantity === product.value.inventory) {
        ElNotification({
            title: 'Warning',
            message: "已達庫存上限",
            type: 'warning',
        })
    }
}
const cartItem = ref({
    productId: product.value.id,
    name: product.value.name,
    price: product.value.price,
    discountPrice: product.value.promotion ? product.value.promotion.discountPrice : null,
    imgUrl: product.value.imgUrl,
    quantity: 1,
    inventory: product.value.inventory,
    status: product.value.status
})
const cartLoading = ref(false)
const addToCart = async () => {
    cartLoading.value = true;
    await memberStore.addToCart(cartItem.value);
    cartLoading.value = false;
}
const buyNow = async () => {
    cartLoading.value = true;
    const isSuccess = await memberStore.addToCart(cartItem.value);
    cartLoading.value = false
    if (isSuccess) {
        navigateTo('/cart')
    }
}

</script>
<style scoped lang="scss"></style>
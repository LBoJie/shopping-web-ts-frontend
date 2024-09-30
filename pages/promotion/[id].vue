<template>
    <div class="bg-[#F5F7FA] flex rounded-xl p-8 mb-8 mobile:p-0 mobile:flex-wrap">
        <img :src="promotion.imgUrl || '/images/defaultPromotion.png'" alt="" class="rounded-xl w-1/2 mobile:w-full">
        <div class="ml-8 mobile:ml-0 mobile:p-4">
            <h3 class=" text-3xl font-bold mb-4 text-success">{{ promotion.name }}</h3>
            <p class="mb-4">活動期間 : {{ promotion.startDate.split(' ')[0] }} ~ {{ promotion.endDate.split(' ')[0] }}
            </p>
            <p>{{ promotion.description }}</p>
        </div>

    </div>
    <div class="flex justify-end mb-8">
        <button class="mr-4" @click="sort = 'id'; order = 'ASC'"
            :class="{ 'text-primary': sort === 'id' && order === 'ASC' }">上架時間</button>
        <button class="mr-4" @click="sort = 'price'; order = 'DESC'"
            :class="{ 'text-primary': sort === 'price' && order === 'DESC' }">價格高到低</button>
        <button @click="sort = 'price'; order = 'ASC'"
            :class="{ 'text-primary': sort === 'price' && order === 'ASC' }">價格低到高</button>
    </div>
    <div class="flex flex-wrap mobile:justify-between" v-infinite-scroll="load"
        v-if="promotion.promotionProducts.length > 0">
        <div class="product" v-for="product in promotion.promotionProducts" :key="product.id">
            <NuxtLink :to="`/product/${product.id}`" target="_blank">
                <img :src="product.imgUrl || '/images/defaultProduct.png'" alt="">
                <div class="p-2">
                    <h3 class="text-primary mb-2">{{ product.categoryName }}</h3>
                    <h5 class="mb-2">
                        {{ product.name }}
                    </h5>
                    <p class="flex items-center justify-between mt-auto text-warning">
                        ${{ product.discountPrice }}
                        <el-button type="success" :loading="cartLoading" @click.prevent="addToCart(product)">
                            <el-icon size="18">
                                <ShoppingCart />
                            </el-icon>
                        </el-button>
                    </p>
                </div>
            </NuxtLink>
        </div>
        <div class="w-full py-8" v-if="!isEndOfList" v-loading="loading" element-loading-text="取得更多商品中"></div>
    </div>
    <el-empty description="此活動不再有效期限內" v-else-if="!promotionIsWithinRange">
        <el-button type="primary" @click="router.push('/category/0')">查看所有商品</el-button>
    </el-empty>
    <el-empty description="此活動尚無商品" v-else>
        <el-button type="primary" @click="router.push('/category/0')">查看所有商品</el-button>
    </el-empty>
</template>

<script setup lang="ts">
import { useMemberStore } from '@/store/index';
const memberStore = useMemberStore();
type Product = {
    id: number
    discountPrice: number
    imgUrl: string
    inventory: number
    name: string
    price: number
    status: string
    categoryName: string
}
type Promotion = {
    id: number
    name: string
    description: string
    discountType: "PERCENTAGE"
    discountValue: number
    startDate: string
    endDate: string
    imgUrl: string
    isActive: boolean
    promotionProducts: Product[]
}
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
const router = useRouter();
const route = useRoute();
const promotionId = route.params.id;
const sort = ref('id');
const order = ref('ASC');
const startIdx = ref(0);
const { data, error } = await useFetch<ApiResponse<Promotion>>(`${apiBaseUrl}/promotion/${promotionId}?sort=${sort.value}&order=${order.value}&startIdx=${startIdx.value}`,
    {
        method: "GET",
    })
if (error.value) {
    throw createError({
        statusCode: error.value.statusCode,
        message: error.value.statusCode === 400 ? "無此活動" : error.value.message,
        fatal: true
    })
}
const loading = ref(false);
startIdx.value += 16;
const promotion = ref<Promotion>(data.value!.responseData);
const promotionIsWithinRange = ref(false);
const today = new Date();
const startDate = new Date(promotion.value.startDate);
const endDate = new Date(promotion.value.endDate);
promotionIsWithinRange.value = today >= startDate && today <= endDate;
if (!promotionIsWithinRange.value) {
    promotion.value.promotionProducts = [];
}
const isEndOfList = ref(false);
watch([sort, order], () => {
    if (!promotionIsWithinRange.value) {
        promotion.value.promotionProducts = [];
        return
    }
    startIdx.value = 0;
    promotion.value.promotionProducts = [];
    isEndOfList.value = false;
    load();
})
const load = async () => {
    if (isEndOfList.value || loading.value) return
    try {
        await $fetch(`${apiBaseUrl}/promotion/${promotionId}?sort=${sort.value}&order=${order.value}&startIdx=${startIdx.value}`, {
            method: "GET",
            onRequest() {
                loading.value = true
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    if (response._data.responseData.promotionProducts.length === 0) {
                        isEndOfList.value = true;
                        return
                    }
                    startIdx.value += 16;
                    promotion.value.promotionProducts = promotion.value.promotionProducts.concat(response._data.responseData.promotionProducts);
                }
            }
        })
    } catch (error) {
        handleError(error);
    }
    finally {
        loading.value = false
    }
}
const cartLoading = ref(false)
const addToCart = async (product: Product) => {
    const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        imgUrl: product.imgUrl,
        quantity: 1,
        inventory: product.inventory,
        status: product.status
    }
    cartLoading.value = true;
    await memberStore.addToCart(cartItem);
    cartLoading.value = false;
}
</script>

<style scoped lang="scss">
.category {
    a {
        cursor: pointer;
    }

    a:hover,
    .active {
        color: var(--el-color-primary);
        border-bottom: 1px solid var(--el-color-primary);
    }

}

.product {
    overflow: hidden;
    width: 22%;
    margin-left: 1.5%;
    margin-right: 1.5%;
    margin-bottom: 1.5%;
    box-shadow: 0px 0px 12px rgba(0, 0, 0, .12);
    border-radius: 10px;

    img {
        width: 100%;
        height: 250px;
        object-fit: cover;
    }

    h3 {
        font-size: 14px;
    }

    h5 {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
        height: calc(1.5em * 2);
    }
}


@media (max-width: 500px) {
    .product {
        width: 49%;
        margin-left: 0;
        margin-right: 0;
        margin-bottom: 16px;

        img {
         
            height: 150px;
         
        }
    }
}
</style>
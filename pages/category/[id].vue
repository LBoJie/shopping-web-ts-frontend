<template>
    <div class="category flex justify-around items-center mb-8 h-8">
        <NuxtLink :class="{ 'active': category === '0' }" to="/category/0">全部商品</NuxtLink>
        <NuxtLink :class="{ 'active': category === '1' }" to="/category/1">分類一</NuxtLink>
        <NuxtLink :class="{ 'active': category === '2' }" to="/category/2">分類二</NuxtLink>
        <NuxtLink :class="{ 'active': category === '3' }" to="/category/3">分類三</NuxtLink>
    </div>
    <div class="flex justify-end mb-8">
        <button class="mr-4" @click="sort = 'id'; order = 'ASC'"
            :class="{ 'text-primary': sort === 'id' && order === 'ASC' }">上架時間</button>
        <button class="mr-4" @click="sort = 'price'; order = 'DESC'"
            :class="{ 'text-primary': sort === 'price' && order === 'DESC' }">價格高到低</button>
        <button @click="sort = 'price'; order = 'ASC'"
            :class="{ 'text-primary': sort === 'price' && order === 'ASC' }">價格低到高</button>
    </div>
    <div class="flex flex-wrap" v-infinite-scroll="load" v-if="products.length > 0">
        <div class="product" v-for="product in products" :key="product.id">
            <NuxtLink :to="`/product/${product.id}`" target="_blank">
                <img :src="product.imgUrl || '/images/defaultProduct.png'" alt="">
                <div class="p-2">
                    <h3 class="text-primary mb-2">{{ product.categoryName }}</h3>
                    <h5 class="mb-4">
                        {{ product.name }}
                    </h5>
                    <p v-if="product.promotion" class="flex items-center justify-end mt-auto text-warning">
                        ${{ product.promotion.discountPrice }}
                        <el-tag class="ml-2" type="danger">{{ product.promotion.discountValue / 10 }} 折</el-tag>
                    </p>
                    <p v-else class="mt-auto text-end ">${{ product.price }}</p>
                </div>
            </NuxtLink>
        </div>
        <div class="w-full py-8" v-if="!isEndOfList" v-loading="loading" element-loading-text="取得更多商品中"></div>
    </div>
    <el-empty description="此分類尚無商品" v-else>
        <el-button type="primary" @click="router.push('/category/0')">查看所有商品</el-button>
    </el-empty>
</template>

<script setup lang="ts">

const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
const router = useRouter();
const route = useRoute();
const category = ref(route.params.id);
const sort = ref('id');
const order = ref('ASC');
const startIdx = ref(0);
const { data, error } = await useFetch<ApiResponse<Product[]>>(`${apiBaseUrl}/product/category/${category.value}?sort=${sort.value}&order=${order.value}&startIdx=${startIdx.value}`,
    {
        method: "GET",
    })
if (error.value) {
    throw createError({
        statusCode: 404,
        message: error.value.message,
        fatal: true
    })
}
const loading = ref(false);
startIdx.value += 16;
const products = ref<Product[]>(data.value!.responseData);
const isEndOfList = ref(false);
watch([sort, order], () => {
    startIdx.value = 0;
    products.value = [];
    isEndOfList.value = false;
    load();
})
const load = async () => {
    if (isEndOfList.value || loading.value) return
    try {
        await $fetch(`${apiBaseUrl}/product/category/${category.value}?sort=${sort.value}&order=${order.value}&startIdx=${startIdx.value}`, {
            method: "GET",
            onRequest() {
                loading.value = true
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    if (response._data.responseData.length === 0) {
                        isEndOfList.value = true;
                        return
                    }
                    startIdx.value += 16;
                    products.value = products.value.concat(response._data.responseData);
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
        width: 48%;
        margin-left: 1%;
        margin-right: 1%;
        margin-bottom: 3%;
        img{
            height: auto;
        }
    }
}
</style>
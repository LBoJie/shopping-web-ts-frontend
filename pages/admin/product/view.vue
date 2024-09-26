<template>

    <div class="flex mb-4 justify-between">
        <h3 class="text-3xl">商品總覽</h3>
        <el-input v-model="search" placeholder="搜尋商品名稱" class="w-[300px]">
        </el-input>
    </div>
    <el-table :data="tableData" style="width: 100%" @sort-change="handleSort">
        <el-table-column align="right" label="">
            <template #default="scope">
                <div class="w-[75px] h-[75px]">
                    <img :src="scope.row.imgUrl || '/images/defaultProduct.png'" alt="">
                </div>
            </template>
        </el-table-column>
        <el-table-column align="right" label="id" prop="id" />
        <el-table-column align="right" label="商品名稱" prop="name" />
        <el-table-column align="right" sortable="custom" label="庫存" prop="inventory" />
        <el-table-column align="right" sortable="custom" label="價格" prop="price" />
        <el-table-column align="right" sortable="custom" label="分類" prop="categoryName" />
        <el-table-column align="right" sortable="custom" label="狀態" prop="status">
            <template #default="scope">
                {{ scope.row.status === "0" ? "下架" : "上架" }}
            </template>
        </el-table-column>

        <el-table-column align="right">
            <!-- <template #header>
                <el-input v-model="search" size="small" placeholder="Type to search" />
            </template> -->
            <template #default="scope">
                <el-button size="small" type="danger" @click="handleEdit(scope.$index, scope.row)">
                    編輯
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination class="flex justify-end py-8" hide-on-single-page :page-size="pageSize"
        @current-change="handleCurrentChange" layout="prev, pager, next" :total="totalProductsCount" />
</template>

<script setup lang="ts">
import { useMemberStore } from '@/store/index';
const memberStore = useMemberStore();
definePageMeta({
    layout: 'admin',
})
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;



const search = ref('');
// pagination 設定
const currentPage = ref(1);
const pageSize = ref(20);
const sortField = ref('id');
const sortOrder = ref('asc');
const totalProductsCount = ref(0);
const handleCurrentChange = (val: number) => {
    currentPage.value = val;
    getProduct();
}

watch(search, () => {
    getProduct()
})
const handleEdit = (index: number, row: Product) => {
    //前往編輯葉面 韓html編輯器
    navigateTo(`/admin/product/edit/${row.id}`)
}

type SortParams = {
    prop: string;
    order: string | null;
};
const handleSort = ({ prop, order }: SortParams) => {
    if (order === null) {
        sortField.value = 'id';
        sortOrder.value = 'ASC';
        getProduct()
        return
    }
    sortField.value = prop
    sortOrder.value = order === 'ascending' ? 'ASC' : 'DESC'
    getProduct()
}
const tableData = ref<Product[]>([]);

const getProduct = async () => {
    try {
        await $fetch(`${apiBaseUrl}/admin/product?page=${currentPage.value}&search=${search.value}&pageSize=${pageSize.value}&sortField=${sortField.value}&sortOrder=${sortOrder.value}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            onRequest() {
                showLoading();
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    tableData.value = response._data.responseData.products;
                    totalProductsCount.value = response._data.responseData.totalProductsCount;
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
            ElNotification({
                title: 'Error',
                message: `${error.response._data ? error.response._data.responseData : error}`,
                type: 'error',
            })
        }
    }
    finally {
        hideLoading();
    }
}


onMounted(async () => {
    await getProduct();

})
</script>

<style scoped lang="scss">
:deep(.el-table__cell) {
    background-color: #606266 !important;
    color: #fff;
}


:deep(.btn-prev) {
    background-color: #303133 !important;
    color: #FFF;
}

:deep(.btn-next) {
    background-color: #303133 !important;
    color: #FFF;
}

:deep(.number) {
    color: #fff;
    background-color: #303133;

    &.is-active {
        color: #ffd04b
    }
}

:deep(.more) {
    color: #fff;
    background-color: #303133;

}
</style>
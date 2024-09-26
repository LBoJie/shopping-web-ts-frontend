<template>

    <div class="flex mb-4 justify-between">
        <h3 class="text-3xl">訂單總覽</h3>
        <el-input v-model="search" placeholder="搜尋訂單編號" class="w-[300px]">
        </el-input>
    </div>
    <el-table :data="tableData" style="width: 100%">
        <el-table-column align="right" label="訂單編號" prop="id" />
        <el-table-column align="right" label="訂單金額" prop="totalAmount" />
        <el-table-column align="right" sortable label="狀態" prop="status">
            <template #default="scope">
                {{ handleStatus(scope.row.status) }}
            </template>
        </el-table-column>

        <el-table-column align="right">
            <!-- <template #header>
                <el-input v-model="search" size="small" placeholder="Type to search" />
            </template> -->
            <template #default="scope">
                <el-button size="small" type="danger" @click="handleEdit(scope.$index, scope.row)">
                    查看
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination class="flex justify-end py-8" hide-on-single-page :page-size="pageSize"
        @current-change="handleCurrentChange" layout="prev, pager, next" :total="filterData.length" />
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
const handleCurrentChange = (val: number) => {
    currentPage.value = val;
}
const filterData = computed(() =>
    allData.value.filter(
        (data) =>
            !search.value || data.id.toString() === search.value
    )
)

// table 呈現資料
const tableData = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    return filterData.value.slice(startIndex, endIndex)
})
const handleEdit = (index: number, row: EditProduct) => {
    //前往編輯葉面 韓html編輯器
    navigateTo(`/admin/order/${row.id}`)
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
const allData = ref<Order[]>([]);
onMounted(async () => {
    try {
        await $fetch(`${apiBaseUrl}/admin/order`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            onRequest() {
                showLoading();
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    allData.value = response._data.responseData;
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
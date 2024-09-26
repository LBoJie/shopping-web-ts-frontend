<template>

    <div class="flex mb-4 justify-between">
        <h3 class="text-3xl">活動總覽</h3>
        <el-input v-model="search" placeholder="搜尋活動名稱或編號" class="w-[300px]">
        </el-input>
    </div>
    <el-table :data="tableData" style="width: 100%">
        <el-table-column align="right" label="" prop="img">
            <template #default="scope">
                <div class="w-[75px] h-[75px]">
                    <img :src="scope.row.imgUrl || '/images/defaultProduct.png'" alt="">
                </div>
            </template>
        </el-table-column>
        <el-table-column align="right" label="id" prop="id" />
        <el-table-column align="right" label="活動名稱" prop="name" />
        <el-table-column align="right" sortable label="開始時間" prop="startDate" />
        <el-table-column align="right" sortable label="結束時間" prop="endDate" />
        <el-table-column align="right" sortable label="折扣方式" prop="discountType" />
        <el-table-column align="right" sortable label="狀態" prop="isActive">
            <template #default="scope">
                {{ scope.row.isActive ? "上架" : "下架" }}
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
            !search.value ||
            (data.name.toLowerCase().includes(search.value.toLowerCase()) || data.id!.toString() === search.value)
    )
)

// table 呈現資料
const tableData = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    return filterData.value.slice(startIndex, endIndex)
})
const handleEdit = (index: number, row: Promotion) => {
    //前往編輯葉面 韓html編輯器
    navigateTo(`/admin/promotion/edit/${row.id}`)
}



const allData = ref<Promotion[]>([]);
onMounted(async () => {
    try {
        await $fetch(`${apiBaseUrl}/admin/promotion`, {
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
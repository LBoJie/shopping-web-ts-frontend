<template>
    <h3 class="text-3xl mb-4">商品分類</h3>
    <div class="flex items-start">
        <div class="flex gap-2 w-1/2 flex-wrap items-center">
            <el-check-tag v-for="item in category" :checked="item.id === activeCategory.id" type="danger" :key="item.id"
                @change="onChange(item)">
                {{ item.name }}
            </el-check-tag>
            <el-input v-if="inputVisible" ref="InputRef" v-model="inputValue" class="w-20" size="small"
                @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />
            <el-button v-else class="button-new-tag" size="small" @click="showInput">
                + 新增商品分類
            </el-button>
        </div>
        <div class="w-1/2">
            <el-input class="mb-4" v-model="activeCategory.name" placeholder="請選擇編輯分類"
                :disabled="activeCategory.id === 0" />
            <el-button type="primary" plain @click="editCategory"
                :disabled="activeCategory.id === 0 || activeCategory.name.length === 0">確認</el-button>
            <el-button type="warning" plain @click="editCancle" :disabled="activeCategory.id === 0">取消</el-button>
        </div>
    </div>
</template>
<script setup lang="ts">
import type { InputInstance } from 'element-plus'
import { useMemberStore } from '@/store/index';
const memberStore = useMemberStore();
definePageMeta({
    layout: 'admin',
})
type Category = {
    id: number
    name: string
}
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;



const category = ref<Category[]>([]);

const inputValue = ref('')
const inputVisible = ref(false);
const InputRef = ref<InputInstance>();
const showInput = () => {
    inputVisible.value = true
    nextTick(() => {
        InputRef.value!.input!.focus()
    })
}
const handleInputConfirm = async () => {
    if (inputValue.value) {
        try {
            await $fetch(`${apiBaseUrl}/admin/category`, {
                method: 'POST',
                body: { name: inputValue.value },
                headers: {
                    Authorization: `Bearer ${memberStore.accessToken}`,
                },
                onRequest() {
                    showLoading();
                },
                onResponse({ response }) {
                    if (response.status === 201) {
                        ElNotification({
                            title: 'Success',
                            message: "新增成功",
                            type: 'success',
                        })
                    }
                }
            })
            await getCategory();
        } catch (error: any) {
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
        } finally {
            hideLoading();
        }
    }
    inputVisible.value = false
    inputValue.value = ''
}

const activeCategory = ref<Category>(
    {
        id: 0,
        name: ""
    })


const onChange = (item: Category) => {
    activeCategory.value = { ...item };
}

const editCategory = async () => {
    const originalCategory = category.value.find((item) => {
        return item.id === activeCategory.value.id
    })
    if (activeCategory.value.name === originalCategory!.name) {
        ElNotification({
            title: 'Error',
            message: "無須編輯",
            type: 'error',
        })
        return
    }
    try {
        await $fetch(`${apiBaseUrl}/admin/category/${activeCategory.value.id}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            }, body: {
                name: activeCategory.value.name
            },
            onRequest() {
                showLoading();
            },
            onResponse({ response }) {
                if (response.status === 204) {
                    ElNotification({
                        title: 'Success',
                        message: "更新成功",
                        type: 'success',
                    })
                }
            }
        })
        await getCategory();
    } catch (error: any) {
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
    } finally {
        hideLoading();
    }

}
const editCancle = () => {
    activeCategory.value = {
        id: 0,
        name: ""
    }
}

const getCategory = async () => {
    try {
        await $fetch(`${apiBaseUrl}/admin/category`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            onRequest() {
                showLoading();
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    category.value = response._data.responseData;
                }
            }
        })
    } catch (error: any) {
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
    } finally {
        hideLoading();
    }
}


onMounted(async () => {
    await getCategory();
})


</script>

<style scoped lang="scss"></style>
<template>
    <div class="flex justify-between">
        <div class="w-6/12">
            <h3 class="text-2xl mb-4">首頁輪播</h3>
            <draggable v-model="carousels" item-key="id" @end="updateOrder" class="flex flex-wrap">
                <template #item="{ element }">
                    <div class=" p-1 drag-item" @click="handleActive(element)"
                        :class="{ 'active': element.id === activeId }">
                        <img :src="element.imgUrl" alt="" class="w-full h-full object-cover">
                    </div>
                </template>
                <template #footer>
                    <div @click="addCarousel" class="add-carousel p-1 relative" :class="{ 'active': activeId === 0 }">
                        <el-icon class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size="36">
                            <Plus />
                        </el-icon>
                    </div>
                </template>
            </draggable>
        </div>
        <div class="w-5/12 border border-white p-4" v-show="activeId >= 0">
            <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto"
                class="demo-ruleForm" status-icon>
                <el-form-item label="商品圖片" prop="imgUrl">
                    <el-upload class="img-uploader" :show-file-list="false" :on-success="handleImgSuccess" drag
                        :before-upload="beforeImgUpload">
                        <div v-if="ruleForm.imgUrl" class="w-full h-full relative hover:text-primary">
                            <img :src="ruleForm.imgUrl" class="img" />
                            <div
                                class="img-btn w-full h-full flex justify-center items-center opacity-0 hover:opacity-100">
                                <el-icon @click.stop="dialogVisible = true" size="24" class="mr-2">
                                    <zoom-in />
                                </el-icon>
                                <el-icon @click.stop="removeImg" size="24">
                                    <Delete />
                                </el-icon>
                            </div>
                        </div>
                        <el-icon v-else class="img-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
                <el-form-item label="商品分類" prop="category">
                    <el-select-v2 v-model="ruleForm.category" placeholder="Activity count" :options="categoryOptions" />
                </el-form-item>
                <el-form-item label="連結" prop="href">
                    <el-input v-model="ruleForm.href" type="string" />
                </el-form-item>
                <el-dialog v-model="dialogVisible">
                    <img w-full class="mx-auto" :src="ruleForm.imgUrl" alt="Preview Image" />
                </el-dialog>
                <div class="flex justify-end">
                    <el-form-item>
                        <el-button type="primary" @click="submitForm(ruleFormRef)">
                            {{ activeId === 0 ? '新增' : '編輯' }}
                        </el-button>
                        <el-button v-if="activeId === 0" @click="resetForm(ruleFormRef)">重置</el-button>
                        <el-button v-else @click="deleteCarousel">刪除</el-button>
                    </el-form-item>
                </div>
            </el-form>
        </div>
    </div>
</template>


<script setup lang="ts">
import type { FormInstance, FormRules, UploadProps, UploadRawFile } from 'element-plus';
import _ from 'lodash'
import { useMemberStore } from '@/store/index';
import draggable from 'vuedraggable';

const memberStore = useMemberStore();
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
definePageMeta({
    layout: 'admin',
})

const carousels = ref<Carousel[]>([])
const activeId = ref<number>(-1);
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<Carousel>({
    category: 1,
    href: "",
    imgUrl: '',
})
const rules = reactive<FormRules<Carousel>>({
    href: [
        { required: true, message: '請填寫連結', trigger: 'blur' },
    ],
    imgUrl: [
        { required: true, message: '請上傳圖片' },
    ],
})


type categoryOptions = {
    label: string
    value: number
}
const categoryOptions = ref<categoryOptions[]>([{ label: "首頁", value: 1 }]);


const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields();
    uploadImg = null;
}

const deleteCarousel = async () => {
    try {
        await $fetch(`${apiBaseUrl}/admin/carousel/${activeId.value}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            onRequest() {
                showLoading();
            },
            onResponse({ response }) {
                if (response.status === 204) {
                    ElNotification({
                        title: 'Success',
                        message: "刪除成功",
                        type: 'success',
                    })
                    getCarousels(1);
                    ruleFormRef.value?.resetFields();
                    activeId.value = -1;
                }
            }

        })
    } catch (error: any) {
        if (error.response.status === 401) {
            handleRefreshToken();
        } else if (error.response.status === 403) {
            alert("無權限進行此操作，返回首頁")
            navigateTo("/")
        } else {
            handleError(error);
        }
    }
    finally {
        hideLoading();
    }
}
const findDifferences = (original: Carousel, edit: Carousel): Partial<Record<keyof Carousel, Carousel[keyof Carousel]>> => {
    const differences: Partial<Record<keyof Carousel, Carousel[keyof Carousel]>> = {};

    (Object.keys(edit) as (keyof Carousel)[]).forEach(key => {
        if (!_.isEqual(original[key], edit[key])) {
            const value = edit[key];
            if (value !== undefined) {
                differences[key] = value;
            }
        }
    });

    return differences;
};
const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            const formData = new FormData();
            if (activeId.value === 0) {
                //新增   
                formData.append("img", uploadImg ?? "");
                formData.append("category", `${ruleForm.category}`)
                formData.append("href", ruleForm.href)
                try {
                    await $fetch(`${apiBaseUrl}/admin/carousel`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${memberStore.accessToken}`,
                        },
                        body: formData,
                        onRequest() {
                            showLoading();
                        },

                        onResponse({ response }) {
                            if (response.status === 201) {
                                ElNotification({
                                    title: 'Success',
                                    message: response._data.responseData,
                                    type: 'success',
                                })
                                formEl.resetFields();
                                uploadImg = null;
                                getCarousels(1);
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
            else {
                //修改
                const patch = findDifferences(originalCarousel!, ruleForm);
                if (Object.keys(patch).length === 0) {
                    ElNotification({
                        title: 'Error',
                        message: "無須編輯",
                        type: 'error',
                    })
                    return
                }

                if (patch.imgUrl) {
                    formData.append("img", uploadImg!)
                    delete patch.imgUrl
                }
                formData.append("patch", JSON.stringify(patch));
                try {
                    await $fetch(`${apiBaseUrl}/admin/carousel/${activeId.value}`, {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${memberStore.accessToken}`,
                        },
                        body: formData,
                        onRequest() {
                            showLoading();
                        },
                        onResponse({ response }) {
                            if (response.status === 204) {
                                ElNotification({
                                    title: 'Success',
                                    message: "編輯成功",
                                    type: 'success',
                                })
                                uploadImg = null;
                                getCarousels(1);
                            }

                        }
                    });
                } catch (error: any) {
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
                } finally {
                    hideLoading();
                }

            }


        }
    })
}
// 上傳的檔案
let uploadImg: UploadRawFile | null = null;
const dialogVisible = ref(false)
const handleImgSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
    ruleForm.imgUrl = URL.createObjectURL(uploadFile.raw!)
    uploadImg = uploadFile.raw ?? null;
    ruleFormRef.value!.clearValidate('imgUrl');
}

const beforeImgUpload: UploadProps['beforeUpload'] = (rawFile) => {
    if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
        ElNotification({
            title: 'Error',
            message: '圖片格式錯誤!',
            type: 'error',
        })
        return false
    } else if (rawFile.size / 1024 / 1024 > 2) {
        ElNotification({
            title: 'Error',
            message: '圖片大小不能超過 2MB!',
            type: 'error',
        })
        return false
    }
    return true
}

const removeImg = () => {
    uploadImg = null;
    ruleForm.imgUrl = "";
}
const addCarousel = () => {
    activeId.value = 0
    ruleFormRef.value!.resetFields();
}
let originalCarousel: Carousel | null = null;

const handleActive = (carousel: Carousel) => {
    originalCarousel = { ...carousel };
    activeId.value = carousel.id!;
    ruleForm.href = carousel.href;
    ruleForm.imgUrl = carousel.imgUrl;
    ruleForm.category = carousel.category;
}
const updateOrder = async () => {
    const orders = carousels.value.map((carousel, index) => {
        return {
            id: carousel.id,
            order: index + 1
        }
    })
    try {
        await $fetch(`${apiBaseUrl}/admin/carousel/order`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            body: orders,
            onResponse({ response }) {
                if (response.status === 204) {
                    ElNotification({
                        title: 'Success',
                        message: "排序修改成功",
                        type: 'success',
                    })
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
            handleError(error);
        }
    }
    await getCarousels(1);
}

const getCarousels = async (categoryId: number) => {
    try {
        await $fetch(`${apiBaseUrl}/admin/carousel/${categoryId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    carousels.value = response._data.responseData

                }
            }
        });
    } catch (error: any) {
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
}
onMounted(async () => {
    await getCarousels(1)
})
</script>

<style scoped lang="scss">
.drag-item {
    width: 130px;
    height: 130px;
    border: 1px solid transparent;
    margin-right: 8px;
    margin-bottom: 8px;
}

.add-carousel {
    width: 130px;
    height: 130px;
    border: 1px solid #fff;
    margin-right: 8px;
    margin-bottom: 8px;
}

.active {
    border-color: var(--el-color-primary);
}

:deep(.el-form-item__label) {
    color: #fff
}

.img-uploader {
    width: 178px;
    height: 178px;
}

.img-uploader .img {
    width: 100%;
    height: 100%;
    display: block;
}

.el-icon.img-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100%;
    height: 100%;
    text-align: center;
}

.img-btn {
    position: absolute;
    left: 0;
    top: 0;
}

:deep(.el-upload-dragger) {
    width: 100%;
    height: 100%;
    padding: 4px;
}

:deep(.el-upload) {
    width: 100%;
    height: 100%;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

:deep(.el-upload):hover {
    border-color: var(--el-color-primary);
}
</style>

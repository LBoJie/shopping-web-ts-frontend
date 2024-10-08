<template>
    <h3 class="text-3xl mb-4">新增商品</h3>
    <ClientOnly>
        <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto"
            class="demo-ruleForm" status-icon>
            <el-form-item label="商品名稱" prop="name">
                <el-input v-model="ruleForm.name" type="string" />
            </el-form-item>
            <el-form-item label="價格" prop="price">
                <el-input v-model.number="ruleForm.price" type="string" />
            </el-form-item>
            <el-form-item label="庫存" prop="inventory">
                <el-input v-model.number="ruleForm.inventory" type="string" />
            </el-form-item>
            <el-form-item label="商品分類" prop="categoryId">
                <el-select-v2 v-model="ruleForm.categoryId" placeholder="Activity count" :options="categoryOptions" />
            </el-form-item>
            <el-form-item label="商品圖片" prop="imgUrl">
                <el-upload class="img-uploader" :show-file-list="false" :on-success="handleImgSuccess" drag
                    :before-upload="beforeImgUpload">
                    <div v-if="ruleForm.imgUrl" class="w-full h-full relative hover:text-primary">
                        <img :src="ruleForm.imgUrl" class="img" />
                        <div class="img-btn w-full h-full flex justify-center items-center opacity-0 hover:opacity-100">
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
            <el-dialog v-model="dialogVisible">
                <img w-full class="mx-auto" :src="ruleForm.imgUrl" alt="Preview Image" />
            </el-dialog>
            <el-form-item label="商品詳情">
                <quill ref="editor" />
            </el-form-item>
            <el-form-item label="是否上架" prop="status">
                <el-switch v-model="ruleForm.status" />
            </el-form-item>
            <div class="flex justify-end">
                <el-form-item>
                    <el-button type="primary" @click="submitForm(ruleFormRef)">
                        新增
                    </el-button>
                    <el-button @click="resetForm(ruleFormRef)">重置</el-button>
                </el-form-item>
            </div>
        </el-form>
    </ClientOnly>

</template>

<script lang="ts" setup>
import type { FormInstance, FormRules, UploadProps, UploadRawFile } from 'element-plus';
import { useMemberStore } from '@/store/index';
const memberStore = useMemberStore();
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
definePageMeta({
    layout: 'admin',
})
interface RuleForm {
    name: string
    price: string
    inventory: string
    categoryId: number
    imgUrl: string
    status: boolean
}
type editorData = {
    delta: string
    html: string
}
const editor = ref();

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
    name: '',
    price: '',
    inventory: '',
    categoryId: 1,
    imgUrl: '',
    status: true,
})


const rules = reactive<FormRules<RuleForm>>({
    name: [
        { required: true, message: '請填寫商品名稱', trigger: 'blur' },
    ],
    price: [
        { required: true, message: '請填寫售價' },
        { type: 'number', message: '必須是數字' },
    ],
    inventory: [
        { required: true, message: '請填寫庫存' },
        { type: 'number', message: '必須是數字' },
    ],
})


const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            const editorData: editorData = editor.value.getContent();
            const formData = new FormData();
            formData.append("img", uploadImg ?? "");
            formData.append("name", ruleForm.name);
            formData.append("price", ruleForm.price);
            formData.append("inventory", ruleForm.inventory);
            formData.append("categoryId", `${ruleForm.categoryId}`);
            formData.append("status", ruleForm.status ? "1" : "0");
            if (editorData.delta) {
                formData.append("descriptionDelta", editorData.delta);
                formData.append("descriptionHtml", editorData.html);
            }
            try {
                await $fetch(`${apiBaseUrl}/admin/product`, {
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
                            editor.value.resetContent();
                            uploadImg = null;
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
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields();
    editor.value.resetContent();
    uploadImg = null;
}


// 上傳的檔案
let uploadImg: UploadRawFile | null = null;
const dialogVisible = ref(false)
const handleImgSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
    ruleForm.imgUrl = URL.createObjectURL(uploadFile.raw!)
    uploadImg = uploadFile.raw ?? null;
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
type categoryOptions = {
    label: string
    value: number
}
const categoryOptions = ref<categoryOptions[]>([]);

onMounted(async () => {
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
                    response._data.responseData.forEach((item: { id: number, name: string }) => {
                        categoryOptions.value.push({ label: item.name, value: item.id })
                    });
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




})
</script>


<style scoped lang="scss">
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

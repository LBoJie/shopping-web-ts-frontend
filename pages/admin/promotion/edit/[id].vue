<template>
    <h3 class="text-3xl mb-4">編輯活動</h3>
    <ClientOnly>
        <el-form ref="ruleFormRef" style="max-width: 800px" :model="ruleForm" :rules="rules" label-width="auto"
            class="demo-ruleForm" status-icon>
            <el-form-item label="活動名稱" prop="name">
                <el-input v-model="ruleForm.name" type="string" />
            </el-form-item>
            <el-form-item label="活動時間">
                <el-form-item prop="startDate">
                    <el-date-picker v-model="ruleForm.startDate" type="date" :disabled-date="disabledStartDate"
                        placeholder="活動開始時間" />
                </el-form-item>
                <span class="mx-4">-</span>
                <el-form-item prop="endDate">
                    <el-date-picker :disabled="ruleForm.startDate! == ''" v-model="ruleForm.endDate" type="date"
                        :disabled-date="disabledEndDate" placeholder="活動結束時間" />
                </el-form-item>
            </el-form-item>
            <el-form-item label="折扣方式" prop="discountType">
                <el-select-v2 v-model="ruleForm.discountType" placeholder="Activity count"
                    :options="discountTypeOption" />
            </el-form-item>

            <el-form-item :label="`${ruleForm.discountType === 'PERCENTAGE' ? '折數' : '折扣金額'}`" prop="discountValue">
                <el-input-number v-model="ruleForm.discountValue" :min="0" :controls="false" />
                <span v-if="ruleForm.discountType === 'PERCENTAGE'" class="ml-2">95 = 95折，50 = 5折</span>
            </el-form-item>
            <el-form-item label="活動圖片" prop="imgUrl">
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
                <img w-full class="mx-auto" :src="ruleForm.imgUrl || ''" alt="Preview Image" />
            </el-dialog>
            <el-form-item label="活動描述" prop="description">
                <el-input v-model="ruleForm.description" type="textarea" />
            </el-form-item>
            <el-form-item label="活動商品" prop="productIds">
                <el-transfer class="text-xs" :titles="['可加入商品', '已加入商品']" v-model="ruleForm.productIds" filterable
                    :filter-method="filterMethod" filter-placeholder="搜尋商品" :data="product" />
            </el-form-item>
            <el-form-item label="是否上架" prop="isActive">
                <el-switch v-model="ruleForm.isActive" />
            </el-form-item>
            <div class="flex justify-end">
                <el-form-item>
                    <el-button type="primary" @click="submitForm(ruleFormRef)">
                        編輯
                    </el-button>
                </el-form-item>
            </div>
        </el-form>
    </ClientOnly>

</template>

<script lang="ts" setup>
import type { FormInstance, FormRules, UploadProps, UploadRawFile, TransferDataItem } from 'element-plus';
import { useMemberStore } from '@/store/index';
import _ from 'lodash'
const memberStore = useMemberStore();
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
definePageMeta({
    layout: 'admin',
})
const route = useRoute();
const id = route.params.id;
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<Promotion>({
    id: Number(id),
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    discountType: "PERCENTAGE",
    imgUrl: "" || null,
    discountValue: 0,
    productIds: [],
    isActive: true,
})

const disabledStartDate = (time: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return time < tomorrow;
}
const disabledEndDate = (time: Date) => {
    const tomorrow = new Date();
    const startDate = new Date(ruleForm.startDate);
    startDate.setDate(startDate.getDate() + 1);
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(0, 0, 0, 0);
    return time < tomorrow || time < startDate;
}
const rules = reactive<FormRules<Promotion>>({
    name: [
        { required: true, message: '請填寫活動名稱', trigger: 'blur' },
    ],


    startDate: [
        { required: true, message: '請填寫開始時間', trigger: 'blur' },
    ],

    endDate: [
        { required: true, message: '請填寫結束時間', trigger: 'blur' },
        {
            validator: (rule, value) => {
                if (new Date(ruleForm.startDate) > new Date(value)) {
                    return false
                }
                return true
            },
            message: '結束時間必須大於開始時間',
            trigger: 'blur'
        }

    ],
    discountType: [
        { required: true, message: '請選擇折扣類型', trigger: 'blur' },
    ],
    discountValue: [
        { required: true, message: '請填寫折扣值', trigger: 'blur' },
        {
            validator: (rule, value) => {
                if (ruleForm.discountType === "PERCENTAGE") {
                    if (value as number <= 0 || value as number >= 100) {
                        return false
                    }
                    return true
                }
            },
            message: '折扣值必須介於 0 到 100 之間',
            trigger: 'blur'
        }
    ]
})

const findDifferences = (original: Promotion, edit: Promotion): Partial<Record<keyof Promotion, Promotion[keyof Promotion]>> => {
    const differences: Partial<Record<keyof Promotion, Promotion[keyof Promotion]>> = {};
    // 找出 original 和 edit 中的不同
    (Object.keys(edit) as (keyof Promotion)[]).forEach(key => {
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
            const patch = findDifferences(originalPromotion, ruleForm) as Partial<Promotion>;
            const formData = new FormData();
            if (Object.keys(patch).length === 0) {
                ElNotification({
                    title: 'Error',
                    message: "無須編輯",
                    type: 'error',
                })
                return
            }
            if (patch.imgUrl) {
                formData.append("img", uploadImg ?? "");
            }
            if (patch.hasOwnProperty("endDate")) {
                const endDate = new Date(ruleForm.endDate);
                endDate.setHours(23, 59, 59, 0)
                patch.endDate = endDate.toString()
            }
            formData.append("patch", JSON.stringify(patch))
            try {
                await $fetch(`${apiBaseUrl}/admin/promotion/${id}`, {
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
                            originalPromotion = JSON.parse(JSON.stringify(ruleForm))
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
    ruleForm.imgUrl = null;
}
type DiscountType = {
    label: string
    value: "PERCENTAGE"
}
const discountTypeOption = ref<DiscountType[]>([{ label: "折數", value: "PERCENTAGE" }]);

//活動商品
interface Option {
    key: number
    label: string
}

const product = ref<Option[]>([])
const filterMethod = (query: string, item: TransferDataItem) => {
    return item.label.toLowerCase().includes(query.toLowerCase())
}
let originalPromotion: Promotion;
onMounted(async () => {
    try {
        await $fetch(`${apiBaseUrl}/admin/promotion/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            onRequest() {
                showLoading();
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    originalPromotion = response._data.responseData;
                    ruleForm.name = originalPromotion.name;
                    ruleForm.description = originalPromotion.description;
                    ruleForm.startDate = originalPromotion.startDate;
                    ruleForm.endDate = originalPromotion.endDate;
                    ruleForm.discountType = originalPromotion.discountType;
                    ruleForm.discountValue = originalPromotion.discountValue;
                    ruleForm.imgUrl = originalPromotion.imgUrl;
                    ruleForm.isActive = originalPromotion.isActive;
                    ruleForm.productIds = originalPromotion.productIds.map((item) => item);
                }
            }
        })

        await $fetch(`${apiBaseUrl}/admin/promotion/product`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            onRequest() {
                showLoading();
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    product.value = response._data.responseData.map((item: Product) => {
                        const inOtherPromotion = item.inPromotion && item.inPromotion !== originalPromotion.id ? true : false;
                        return { key: item.id, label: `${item.id}-${item.name} ${inOtherPromotion ? `活動ID: ${item.inPromotion}` : ''}`, disabled: inOtherPromotion }
                    });
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

:deep(.el-transfer-panel__item.el-checkbox .el-checkbox__label) {
    white-space: normal;

}

:deep(.el-transfer-panel__item) {
    height: auto;
}
</style>

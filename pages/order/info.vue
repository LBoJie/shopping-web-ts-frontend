<template>
    <div class="mx-auto w-[600px] mobile:w-full">
        <el-form ref="ruleFormRef" label-position="top" label-width="auto" :rules="rules" :model="ruleForm">
            <div class="flex">
                <label class="custom-label leading-[22px] mb-[8px] h-auto text-[#606266] text-[14px]">收件人資料</label>
                <el-button class="ml-2" type="info" plain size="small" @click="useMemberInfo">使用會員資料</el-button>
            </div>
            <el-form-item prop="name">
                <el-input v-model="ruleForm.name" placeholder="收件人姓名" prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="phone">
                <el-input v-model="ruleForm.phone" placeholder="收件人手機" prefix-icon="Iphone" />
            </el-form-item>
            <el-form-item label="配送地址" prop="address">
                <el-input v-model="ruleForm.address" prefix-icon="Location" />
            </el-form-item>
            <el-form-item label="訂單備註" prop="notes">
                <el-input v-model="ruleForm.notes" :autosize="{ minRows: 4 }" type="textarea" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="next(ruleFormRef)">
                    下一步
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { useMemberStore, useOrderStore } from '@/store/index';
import type { FormInstance, FormRules } from 'element-plus'
const memberStore = useMemberStore();
const orderStore = useOrderStore();
const useMemberInfo = () => {
    ruleForm.name = memberStore.member!.name
    ruleForm.phone = memberStore.member!.phone

}
interface RuleForm {
    name: string
    phone: string
    address: string
    notes: string
}
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
    name: '',
    phone: '',
    address: '',
    notes: '',
})
const rules = reactive<FormRules<RuleForm>>({
    name: [
        { required: true, message: '請填寫姓名', trigger: 'blur' },
        { min: 2, max: 5, message: '姓名必須是 2 ~ 5 個字符', trigger: 'change' }
    ],
    phone: [
        { required: true, message: '請輸入有效的手機號碼', trigger: 'change', pattern: /^09\d{8}$/ },
    ],
    address: [
        { required: true, message: '請填寫地址', trigger: 'change' },
    ],

})
const next = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            orderStore.order = ruleForm;
            navigateTo("/order/confirm")
        }
    })
}
onMounted(() => {
    if (!memberStore.member) {
        navigateTo("/cart")
    }
})
</script>

<style scoped lang="scss">
.custom-label::before {
    color: var(--el-color-danger);
    content: "*";
    margin-right: 4px;
}
</style>
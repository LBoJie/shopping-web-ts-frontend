<template>
    <div class=" h-[700px] pb-[200px]">
        <div id="editor"></div>
    </div>
    <input class="quill-editor-input-file hidden" ref="quillEditorInputFileRef" type="file" accept="image/*"
        @change="onFileChange" />
</template>
<script setup lang="ts">
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import { useMemberStore } from '@/store/index';
import type { Delta } from 'quill/core';
const memberStore = useMemberStore();
const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote'],
    ['link', 'image', 'video'],
    // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean'],                                 // remove formatting button
];

let quill: Quill;
const quillEditorInputFileRef = ref<HTMLDivElement>();
const onFileChange = async (event: Event) => {
    const files = (event.target as HTMLInputElement).files!;
    let file: File | null = null;
    if (files.length <= 0) {
        file = null;
        return;
    }
    file = files[0]; // 只取第一个文件
    if (!file || (file.type !== "image/jpeg" && file.type !== "image/png")) return;
    const formData = new FormData;
    formData.append("img", file);
    try {
        await $fetch(`${apiBaseUrl}/admin/upload/img`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${memberStore.accessToken}`,
            },
            body: formData,
            onRequest() {
                showLoading();
            },
            onResponse({ response }) {
                if (response.status === 200) {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', response._data.responseData, Quill.sources.USER);
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
    } finally {
        hideLoading();
    }
}
const getContent = () => {
    const delta = quill.getContents();
    const isEmpty = delta.ops.length === 1 && delta.ops[0].insert === '\n';
    return {
        delta: isEmpty ? null : JSON.stringify(delta),
        html: isEmpty ? null : quill.root.innerHTML
    }
}
const resetContent = () => {
    quill.setContents([]);
}
const setContent = (content: Delta) => {
    quill.setContents(content);
}
onMounted(() => {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: toolbarOptions,
                handlers: {
                    image: () => {
                        quillEditorInputFileRef.value?.click();
                    },

                }
            }
        }
    });

})
defineExpose({ getContent, resetContent, setContent })

</script>
<style scoped lang="scss">
:deep(.ql-toolbar) {
    background-color: #f5f5f5;
    /* 你的颜色 */
}

:deep(.ql-editor) {
    background-color: #ffffff;
    /* 你的颜色 */
    color: #000000;
    /* 你的文本颜色 */
}
</style>
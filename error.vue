<template>
    <div class="bg-primary flex min-h-screen items-center text-white">
        <div class="mx-auto flex flex-wrap items-center p-4">
            <div class="p-4 text-center">
                <div class="text-8xl lg:text-[12rem] font-semibold">{{ error.statusCode }}</div>
            </div>
            <div class="p-4 text-center">
                <div class="mb-4 text-3xl font-medium">噢不！發生了一些意外 🙁</div>
                <div class="mb-8 text-lg">{{ error.message }}</div>
                <button type="button"
                    class="rounded border border-white px-4 py-2 hover:bg-gray-50 hover:bg-opacity-10 active:bg-opacity-20"
                    @click="processError">
                    回到首頁
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    error: Object
})

const processError = () => clearError({ redirect: '/' })
</script>
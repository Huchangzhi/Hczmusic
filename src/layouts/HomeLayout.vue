<template>
    <Header />
    <main>
        <router-view :playerControl="playerControl"></router-view>
    </main>
    <PlayerControl ref="playerControl" />
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import Header from "@/components/Header.vue";
import PlayerControl from "@/components/PlayerControl.vue";
import { setTheme } from '../utils/utils';
const playerControl = ref(null);
const { proxy } = getCurrentInstance();
onMounted(() => {
    const savedConfig = JSON.parse(localStorage.getItem('settings'));
    if (savedConfig) {
        proxy.$applyColorTheme(savedConfig['themeColor']);
    }
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }
});
</script>

<style>
:root {
    /* 粉红色主色调 */
    --primary-color:rgba(20, 160, 224, 0.66);
    /* 浅粉红色辅助色 */
    --secondary-color:rgb(69, 131, 224);
    --text-color: #333;
    /* 浅粉色背景 */
    --background-color:rgba(85, 86, 190, 0.27);
    /* 高亮色 */
    --color-primary:rgb(28, 61, 207);
    --color-secondary-bg-for-transparent: rgba(209, 209, 214, 0.28);
    --color-box-shadow: rgba(39, 56, 211, 0.2);
}

* {
    user-select: none;
}

body,
html {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #FFF;
    color: var(--text-color);
    height: 100%;
}

body {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

::-webkit-scrollbar {
    width: 0;
    height: 0;
}

main {
    min-height: calc(100vh - 80px - 188px);
    max-width: 1200px;
    margin: 0 auto;
    margin-bottom: 150px;
    padding-top: 80px;
    padding-bottom: 150px;
}

a {
    text-decoration: none;
    color: inherit;
    display: block;
}
</style>
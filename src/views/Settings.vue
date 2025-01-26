<template>
    <div class="settings-page">
        <section class="setting-section">
            <div class="setting-item" @click="openSelection('language')">
                <span>{{ $t('yu-yan') }}</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.language.displayText }}</span>
                </div>
            </div>

            <div class="setting-item" @click="openSelection('themeColor')">
                <span>{{ $t('zhu-se-tiao') }}</span>
                <div class="setting-control">
                    <span>🎨 {{ selectedSettings.themeColor.displayText }}</span>
                </div>
            </div>

            <div class="setting-item" @click="openSelection('theme')">
                <span>{{ $t('wai-guan') }}</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.theme.displayText }}</span>
                </div>
            </div>
        </section>

        <section class="setting-section">
            <h3>{{ $t('sheng-yin') }}</h3>
            <div class="setting-item">
                <span>{{ $t('yin-zhi-xuan-ze') }}</span>
                <div class="setting-control" @click="openSelection('quality')">
                    <span>🎧 {{ selectedSettings.quality.displayText }}</span>
                </div>
            </div>
            <div class="setting-item">
                <span>{{ $t('qi-dong-wen-hou-yu') }}</span>
                <div class="setting-control" @click="openSelection('greetings')">
                    <span>👋 {{ selectedSettings.greetings.displayText }}</span>
                </div>
            </div>
        </section>

        <section class="setting-section">
            <h3>{{ $t('ge-ci') }}</h3>
            <div class="setting-item" @click="openSelection('lyricsBackground')">
                <span>{{ $t('xian-shi-ge-ci-bei-jing') }}</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.lyricsBackground.displayText }}</span>
                </div>
            </div>

            <div class="setting-item" @click="openSelection('desktopLyrics')">
                <span>{{ $t('xian-shi-zhuo-mian-ge-ci') }} (实验性功能)</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.desktopLyrics.displayText }}</span>
                </div>
            </div>

            <div class="setting-item" @click="openSelection('lyricsFontSize')">
                <span>{{ $t('ge-ci-zi-ti-da-xiao') }}</span>
                <div class="setting-control">
                    <span>{{ selectedSettings.lyricsFontSize.displayText }}</span>
                </div>
            </div>
        </section>

        <div v-if="isSelectionOpen" class="modal">
            <div class="modal-content">
                <h3>{{ selectionTypeMap[selectionType].title }}</h3>
                <ul>
                    <li v-for="option in selectionTypeMap[selectionType].options" :key="option" @click="selectOption(option)">
                        {{ option.displayText }}
                    </li>
                </ul>
                <button @click="closeSelection">{{ $t('guan-bi') }}</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { MoeAuthStore } from '../stores/store';
const MoeAuth = MoeAuthStore();
const { t } = useI18n();
const { proxy } = getCurrentInstance();

const selectedSettings = ref({
    language: { displayText: '🇨🇳 简体中文', value: 'zh-CN' },
    themeColor: { displayText: t('nan-nan-lan'), value: 'pink' },
    theme: { displayText: t('qian-se'), value: 'light' },
    quality: { displayText: t('pu-tong-yin-zhi'), value: 'normal' },
    lyricsBackground: { displayText: t('da-kai'), value: 'on' },
    desktopLyrics: { displayText: t('guan-bi'), value: 'off' },
    lyricsFontSize: { displayText: t('zhong'), value: '32px' },
    greetings: { displayText: t('kai-qi'), value: 'on' }
});

const isSelectionOpen = ref(false);
const selectionType = ref('');

const selectionTypeMap = {
    language: {
        title: t('xuan-ze-yu-yan'),
        options: [
            { displayText: '🇨🇳 简体中文', value: 'zh-CN' },
            { displayText: '🇨🇳 繁体中文', value: 'zh-TW' },
            { displayText: '🇺🇸 English', value: 'en' },

            { displayText: '🇰🇷 한국어', value: 'ko' }
        ]
    },
    themeColor: {
        title: t('xuan-ze-zhu-se-tiao'),
        options: [
            { displayText: t('shao-nv-fen'), value: 'pink' },
            { displayText: t('nan-nan-lan'), value: 'blue' },
            { displayText: t('tou-ding-lv'), value: 'green' }
        ]
    },
    theme: {
        title: t('xuan-ze-wai-guan'),
        options: [
            { displayText: '🌗 ' + t('zi-dong'), value: 'auto' },
            { displayText: '☀️ ' + t('qian-se'), value: 'light' },
            { displayText: '🌙 ' + t('shen-se'), value: 'dark' }
        ]
    },
    quality: {
        title: t('yin-zhi-xuan-ze'),
        options: [
            { displayText: t('pu-tong-yin-zhi'), value: 'normal' },
            { displayText: t('gao-yin-zhi-320kbps'), value: 'high' },
            { displayText: t('wu-sun-yin-zhi-1104kbps'), value: 'lossless' }
        ]
    },
    lyricsBackground: {
        title: t('xian-shi-ge-ci-bei-jing'),
        options: [
            { displayText: t('da-kai'), value: 'on' },
            { displayText: t('guan-bi'), value: 'off' }
        ]
    },
    desktopLyrics: {
        title: t('xian-shi-zhuo-mian-ge-ci'),
        options: [
            { displayText: t('da-kai'), value: 'on' },
            { displayText: t('guan-bi'), value: 'off' }
        ]
    },
    lyricsFontSize: {
        title: t('ge-ci-zi-ti-da-xiao'),
        options: [
            { displayText: t('xiao'), value: '24px' },
            { displayText: t('zhong'), value: '32px' },
            { displayText: t('da'), value: '40px' }
        ]
    },
    greetings: {
        title: t('qi-dong-wen-hou-yu'),
        options: [
            { displayText: t('kai-qi'), value: 'on' },
            { displayText: t('guan-bi'), value: 'off' }
        ]
    }
};

const openSelection = (type) => {
    isSelectionOpen.value = true;
    selectionType.value = type;
};

const selectOption = (option) => {
    selectedSettings.value[selectionType.value] = option;
    if (selectionType.value === 'themeColor') {
        proxy.$applyColorTheme(option.value);
    } else if (selectionType.value === 'theme') {
        proxy.$setTheme(option.value);
    } else if (selectionType.value === 'language') {
        proxy.$i18n.locale = option.value;
    }else if( selectionType.value === 'quality' && !MoeAuth.isAuthenticated) {
        window.$modal.alert(t('gao-pin-zhi-yin-le-xu-yao-deng-lu-hou-cai-neng-bo-fango'));
        return
    }else if(selectionType.value === 'desktopLyrics'){
        const action = selectedSettings.value.desktopLyrics.value === 'on' ? 'display-lyrics' : 'close-lyrics';
        if(isElectron()){
            window.electron.ipcRenderer.send('desktop-lyrics-action', action);
        }else{
            window.$modal.alert('非客户端环境，无法启用');
            return;
        }
    }else if(selectionType.value === 'lyricsFontSize'){
        if(isElectron()){
            window.electron.ipcRenderer.send('lyrics-font-size', selectedSettings.value.lyricsFontSize.value);
        }else{
            window.$modal.alert('非客户端环境，无法启用');
            return;
        }
    }
    saveSettings();
    closeSelection();
};

const isElectron = () => {
    return typeof window !== 'undefined' && typeof window.electron !== 'undefined';
};

const saveSettings = () => {
    const settingsToSave = Object.fromEntries(
        Object.entries(selectedSettings.value).map(([key, setting]) => [key, setting.value])
    );
    localStorage.setItem('settings', JSON.stringify(settingsToSave));
    isElectron() && window.electron.ipcRenderer.send('save-settings',settingsToSave);
};

const closeSelection = () => {
    isSelectionOpen.value = false;
};

onMounted(() => {
    const savedSettings = JSON.parse(localStorage.getItem('settings'));
    if (savedSettings) {
        for (const key in savedSettings) {
            const displayText = selectionTypeMap[key].options.find(
                (option) => option.value === savedSettings[key]
            ).displayText;
            selectedSettings.value[key] = { displayText, value: savedSettings[key] };
        }
    }
});
</script>

<style scoped>
.settings-page {
    padding: 20px;
    font-family: Arial, sans-serif;
}

.setting-section {
    margin-bottom: 30px;
}

.setting-section h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    cursor: pointer;
}

.setting-control {
    background-color: #f5f5f5;
    padding: 8px 16px;
    border-radius: 8px;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-in-out;
    z-index: 9;
}

.modal-content {
    background: white;
    padding: 25px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease-in-out;
}

.modal-content h3 {
    font-size: 20px;
    margin-bottom: 20px;
    color: #333;
}

.modal-content ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.modal-content li {
    padding: 12px;
    margin: 6px 0;
    background-color: var(--background-color);
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.modal-content li:hover {
    background-color:var(--secondary-color);
}

.modal-content button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.modal-content button:hover {
    background-color: var(--color-primary)
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from { transform: translateY(-20px); }
    to { transform: translateY(0); }
}
</style>
<template>
    <header>
        <nav class="navigation">
            <div class="navigation">
                <button class="nav-arrow" @click="goBack" :disabled="!canGoBack">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="nav-arrow" @click="goForward" :disabled="!canGoForward">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <button class="nav-arrow" @click="refreshPage">
                    <i class="fas fa-redo"></i>
                </button>
            </div>
            <div class="nav-links">
                <router-link to="/">{{ $t('shou-ye') }}</router-link>
                <router-link to="/discover">{{ $t('fa-xian') }}</router-link>
                <router-link to="/library">{{ $t('yin-le-ku') }}</router-link>
            </div>
            <div class="search-profile">
                <div class="search-bar">
                    <input v-model="searchQuery" type="text" :placeholder="$t('sou-suo-yin-le-ge-shou-ge-dan')" @keydown.enter="getSearch">
                </div>
                <div class="profile" @click="toggleProfile">
                    <img :src="MoeAuth.UserInfo ? MoeAuth.UserInfo.pic : './assets/images/profile.jpg'"
                        alt="Profile Picture">
                    <div class="profile-menu" v-if="showProfile">
                        <ul>
                            <li>
                                <router-link to="/settings">
                                    <i class="fas fa-cog"></i> {{ $t('she-zhi') }}
                                </router-link>
                            </li>
                            <li>
                                <a v-if="MoeAuth.isAuthenticated" @click="logout"><i
                                        class="fas fa-sign-out-alt"></i>{{ $t('tui-chu') }}</a>
                                <router-link to="/login" v-else>
                                    <i class="fas fa-sign-in-alt"></i> {{ $t('deng-lu') }}
                                </router-link>
                            </li>
                            <li>
                                <a @click="openRegisterUrl(downloadUrl || 'https://github.com/iAJue/MoeKoeMusic/releases')" style="position: relative;">
                                    <i class="fab fa-github"></i> {{ $t('geng-xin') }}
                                    <i v-if="showNewBadge" class="new-badge">new</i>
                                </a>
                            </li>
                            <li>
                                <a @click="Disclaimer()">
                                    <i class="fas fa-info-circle"></i> {{ $t('guan-yu') }}
                                </a>
                            </li>
                            <li>
                                <a @click="toggleLocalModeMenu()">
                                    <i class="fas fa-plug"></i> {{ $t('ben-di-mo-shi') }}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    </header>
    
    <!-- 本地模式模态窗口 -->
    <div v-if="showLocalModeWindow" class="local-mode-window-overlay" @click="closeLocalModeWindow()">
        <div class="local-mode-window" @click.stop>
            <div class="window-header">
                <h3>{{ $t('ben-di-mo-shi') }}</h3>
                <button class="close-btn" @click="closeLocalModeWindow()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="window-content">
                <p>{{ $t('ben-di-mo-shi-shuo-ming') }}</p>
                <div class="window-buttons">
                    <button @click="enableLocalMode" class="btn-primary" :class="{ disabled: isLocalMode }" :disabled="isLocalMode">
                        {{ $t('da-kai') }}
                    </button>
                    <button @click="disableLocalMode" class="btn-secondary" :class="{ disabled: !isLocalMode }" :disabled="!isLocalMode">
                        {{ $t('guan-bi') }}
                    </button>
                    <button @click="downloadLocalServer" class="btn-download">
                        {{ $t('xia-zai-fu-wu-duan') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
            </div>
        </nav>
    </header>
    <div v-if="isDisclaimerVisible" class="modal-overlay" @click="Disclaimer">
        <div class="modal-content" @click.stop>
            <h2>{{ $t('mian-ze-sheng-ming') }}</h2>
            <p>{{ $t('0-ben-cheng-xu-shi-ku-gou-di-san-fang-ke-hu-duan-bing-fei-ku-gou-guan-fang-xu-yao-geng-wan-shan-de-gong-neng-qing-xia-zai-guan-fang-ke-hu-duan-ti-yan') }}</p>
            <p>{{ $t('1-ben-xiang-mu-jin-gong-xue-xi-shi-yong-qing-zun-zhong-ban-quan-qing-wu-li-yong-ci-xiang-mu-cong-shi-shang-ye-hang-wei-ji-fei-fa-yong-tu') }}</p>
            <p>{{ $t('2-shi-yong-ben-xiang-mu-de-guo-cheng-zhong-ke-neng-hui-chan-sheng-ban-quan-shu-ju-dui-yu-zhe-xie-ban-quan-shu-ju-ben-xiang-mu-bu-yong-you-ta-men-de-suo-you-quan-wei-le-bi-mian-qin-quan-shi-yong-zhe-wu-bi-zai-24-xiao-shi-nei-qing-chu-shi-yong-ben-xiang-mu-de-guo-cheng-zhong-suo-chan-sheng-de-ban-quan-shu-ju') }}</p>
            <p>{{ $t('3-you-yu-shi-yong-ben-xiang-mu-chan-sheng-de-bao-kuo-you-yu-ben-xie-yi-huo-you-yu-shi-yong-huo-wu-fa-shi-yong-ben-xiang-mu-er-yin-qi-de-ren-he-xing-zhi-de-ren-he-zhi-jie-jian-jie-te-shu-ou-ran-huo-jie-guo-xing-sun-hai-bao-kuo-dan-bu-xian-yu-yin-shang-yu-sun-shi-ting-gong-ji-suan-ji-gu-zhang-huo-gu-zhang-yin-qi-de-sun-hai-pei-chang-huo-ren-he-ji-suo-you-qi-ta-shang-ye-sun-hai-huo-sun-shi-you-shi-yong-zhe-fu-ze') }}
            </p>
            <p>{{ $t('4-jin-zhi-zai-wei-fan-dang-di-fa-lv-fa-gui-de-qing-kuang-xia-shi-yong-ben-xiang-mu-dui-yu-shi-yong-zhe-zai-ming-zhi-huo-bu-zhi-dang-di-fa-lv-fa-gui-bu-yun-xu-de-qing-kuang-xia-shi-yong-ben-xiang-mu-suo-zao-cheng-de-ren-he-wei-fa-wei-gui-hang-wei-you-shi-yong-zhe-cheng-dan-ben-xiang-mu-bu-cheng-dan-you-ci-zao-cheng-de-ren-he-zhi-jie-jian-jie-te-shu-ou-ran-huo-jie-guo-xing-ze-ren') }}
            </p>
            <p>{{ $t('5-yin-le-ping-tai-bu-yi-qing-zun-zhong-ban-quan-zhi-chi-zheng-ban') }}</p>
            <p>{{ $t('6-ben-xiang-mu-jin-yong-yu-dui-ji-shu-ke-hang-xing-de-tan-suo-ji-yan-jiu-bu-jie-shou-ren-he-shang-ye-bao-kuo-dan-bu-xian-yu-guang-gao-deng-he-zuo-ji-juan-zeng') }}</p>
            <p>{{ $t('7-ru-guo-guan-fang-yin-le-ping-tai-jue-de-ben-xiang-mu-bu-tuo-ke-lian-xi-ben-xiang-mu-geng-gai-huo-yi-chu') }}</p>
            <button @click="Disclaimer">{{ $t('guan-bi') }}</button>
            <div class="version-number">© MoeKoe Music <span v-if="appVersion">V{{ appVersion }} - {{ platform }}</span></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MoeAuthStore } from '../stores/store';
import { openRegisterUrl } from '../utils/utils';
import { useI18n } from 'vue-i18n';
import { updateBaseURL } from '../utils/request';
const MoeAuth = MoeAuthStore();
const searchQuery = ref('');
const isDisclaimerVisible = ref(false);
const router = useRouter();
const route = useRoute();
const canGoBack = ref(false);
const canGoForward = ref(false);
const forwardStack = ref([]);
const { t } = useI18n();
const showNewBadge = ref(false);
const downloadUrl = ref('');
const appVersion = ref('');
const platform = ref('');
onMounted(() => {
    updateNavigationStatus();
    if (window.electron) {
        window.electron.ipcRenderer.on('version', (version) => {
            appVersion.value = version;
            fetchLatestVersion();
            platform.value = window.electron.platform;
            localStorage.setItem('version', version);
        });
    }
});
const Disclaimer = () => {
    isDisclaimerVisible.value = !isDisclaimerVisible.value;
};
const updateNavigationStatus = () => {
    canGoBack.value = window.history.length > 1;
    canGoForward.value = forwardStack.value.length > 0;
};
const goBack = () => {
    if (canGoBack.value) {
        forwardStack.value.push(route.fullPath);
        router.back();
    }
    updateNavigationStatus();
};
const goForward = () => {
    if (canGoForward.value) {
        const forwardRoute = forwardStack.value.pop();
        router.push(forwardRoute);
    }
    updateNavigationStatus();
};
router.afterEach(() => {
    updateNavigationStatus();
});
const refreshPage = () => {
    window.location.reload();
};
const logout = async () => {
    const result = await window.$modal.confirm(t('ni-que-ren-yao-tui-chu-deng-lu-ma'));
    if (result) {
        MoeAuth.clearData();
        router.push({ path: '/' });   
    }
}
const showProfile = ref(false);

const toggleProfile = () => {
    showProfile.value = !showProfile.value;
};
const getSearch = () => {
    if (searchQuery.value.trim() !== '') {
        if (searchQuery.value.includes('collection_')) {
            router.push({
                path: '/PlaylistDetail',
                query: { global_collection_id: searchQuery.value }
            });
            return;
        }
        router.push({
            path: '/search',
            query: { q: searchQuery.value }
        });
    }
};
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

const handleClickOutside = (event) => {
    const profileMenu = document.querySelector('.profile-menu');
    const localPanel = document.querySelector('.local-mode-panel');
    
    // 如果点击的是本地模式面板或其内部元素，则不关闭主菜单
    if (localPanel && localPanel.contains(event.target)) {
        return;
    }
    
    if (profileMenu && !profileMenu.contains(event.target) && !event.target.closest('.profile')) {
        showProfile.value = false;
        showLocalModePanel.value = false; // 同时关闭本地模式面板
    }
};

const fetchLatestVersion = async () => {
    try {
        const response = await fetch('https://api.github.com/repos/iAJue/MoeKoeMusic/releases/latest');
        const data = await response.json();
        downloadUrl.value = data.html_url;
        const latestVersion = data.tag_name.replace(/^v/, '');
        if (isVersionLower(appVersion.value, latestVersion)) {
            showNewBadge.value = true; 
        }
    } catch (error) {
        console.error('获取最新版本号失败:', error);
    }
};

const isVersionLower = (current, latest) => {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
        if ((latestParts[i] || 0) > (currentParts[i] || 0)) {
            return true;
        } else if ((latestParts[i] || 0) < (currentParts[i] || 0)) {
            return false;
        }
    }
    return false;
};

// 本地模式相关
const isLocalMode = ref(false);
const showLocalModeWindow = ref(false);
const originalApiUrl = import.meta.env.VITE_APP_API_URL || 'http://127.0.0.1:6521';
const localApiUrl = 'http://127.0.0.1:6521';

// 检查当前是否为本地模式
onMounted(() => {
    const savedLocalMode = localStorage.getItem('localMode');
    if (savedLocalMode === 'true') {
        isLocalMode.value = true;  // 只设置状态，不调用函数以避免循环调用
        // 更新axios基本URL
        updateAxiosBaseURL(localApiUrl);
    } else {
        isLocalMode.value = false;
    }
});

// 下载本地服务器
const downloadLocalServer = () => {
    openRegisterUrl('https://gitee.com/huchangzhi/hmusic/releases/download/v1.0/app_win.exe');
    $message.info($t('fu-wu-duan-xia-zai-zhong'));
};

// 启用本地模式
const enableLocalMode = () => {
    // 更新axios配置的baseURL
    updateAxiosBaseURL(localApiUrl);
    isLocalMode.value = true;
    localStorage.setItem('localMode', 'true');
    $message.success($t('yi-qie-huan-dao-ben-di-mo-shi'));
    showLocalModeWindow.value = false; // 启用后关闭窗口
};

// 禁用本地模式
const disableLocalMode = () => {
    // 更新axios配置的baseURL
    updateAxiosBaseURL(originalApiUrl);
    isLocalMode.value = false;
    localStorage.setItem('localMode', 'false');
    $message.success($t('yi-qie-huan-dao-zai-xian-mo-shi'));
    showLocalModeWindow.value = false; // 禁用后关闭窗口
};

// 更新axios请求实例的baseURL
const updateAxiosBaseURL = (newBaseUrl) => {
    updateBaseURL(newBaseUrl);
};
</script>
<style scoped>
.navigation {
    display: flex;
    gap: 10px;
}

.nav-arrow {
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-arrow:disabled i {
    color: #ccc;
    cursor: not-allowed;
}

.nav-arrow i {
    font-size: 24px;
    color: #333;
}

.nav-arrow:hover {
    background-color: #f0f0f0;
}


button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    background: transparent;
    margin: 4px;
    border-radius: 25%;
    transition: .2s
}

button .svg-icon {
    color: var(--color-text);
    height: 16px;
    width: 16px
}

button:first-child {
    margin-left: 0
}

button:hover {
    background: var(--color-secondary-bg-for-transparent)
}

button:active {
    transform: scale(.92)
}

header {
    background-color: #fff;
    padding: 15px 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: fixed;
    width: 100%;
    top: 0px;
    z-index: 9;
}

.nav-arrow,
.nav-links a,
.search-bar input,
.profile,
.profile img {
    -webkit-app-region: no-drag;
}

.navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.nav-links {
    display: flex;
    gap: 30px;
    justify-content: center;
    flex-grow: 1;
}

.nav-links a {
    text-decoration: none;
    color: var(--primary-color);
    -webkit-app-region: no-drag;
    font-size: 18px;
    font-weight: 700;
    border-radius: 6px;
    padding: 6px 10px;
    transition: .2s;
    -webkit-user-drag: none;
    margin-right: 12px;
    margin-left: 12px
}

.nav-links a:hover {
    background: var(--color-secondary-bg-for-transparent)
}

.nav-links a:active {
    transform: scale(.92);
    transition: .2s
}

.nav-links a.active {
    color: var(--color-primary)
}

.search-profile {
    display: flex;
    align-items: center;
    gap: 20px;
}

.search-bar input {
    padding: 8px 15px;
    border-radius: 20px;
    border: 1px solid var(--secondary-color);
    font-size: 14px;
    width: 200px;
    transition: width 0.3s ease;
}

.search-bar input:focus {
    width: 250px;
    outline: none;
    border-color: var(--primary-color);
}

.profile {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--secondary-color);
    cursor: pointer;
    position: relative;
}

.profile img {
    width: 41px;
    border-radius: 50%;
}

.profile-menu {
    position: absolute;
    top: 50px;
    right: 0;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 10px;
    width: 150px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fadeInOut 0.3s ease-in-out;
}

@keyframes fadeInOut {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.profile-menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.profile-menu li a {
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
    padding: 7px 5px;
    border-radius: 5px;
    color: #000;
    text-decoration: none;
}

.profile-menu li a:hover {
    background-color: var(--secondary-color);
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    position: relative;
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    max-width: 700px;
    width: 90%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    text-align: left;
    animation: fadeIn 0.3s ease;
}

.modal-content h2 {
    margin-top: 0;
    color: var(--primary-color);
}

.modal-content p {
    margin: 10px 0;
    line-height: 1.6;
}

.modal-content button {
    margin-top: 15px;
    padding: 8px 12px;
    background-color: var(--primary-color);
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}


@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.new-badge {
    position: absolute;
    top: 1px;
    left: 67px;
    background-color: red;
    color: white;
    padding: 0px 4px;
    border-radius: 5px;
    font-size: 14px;
}

.version-number {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 12px;
    color: #666;
}

/* 本地模式窗口样式 */
.local-mode-window-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.local-mode-window {
    position: relative;
    background: #fff;
    border-radius: 8px;
    width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    text-align: left;
}

.window-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
}

.window-header h3 {
    margin: 0;
    font-size: 16px;
    color: var(--primary-color);
}

.close-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #666;
}

.close-btn:hover {
    color: #333;
}

.window-content {
    padding: 20px;
}

.window-content p {
    margin: 0 0 20px 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
}

.window-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.window-buttons button {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.window-buttons button:disabled,
.window-buttons button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.btn-primary:hover:not(:disabled):not(.disabled) {
    opacity: 0.9;
}

.btn-secondary {
    background-color: #f8f9fa;
    color: #6c757d;
    border-color: #dee2e6;
}

.btn-secondary:hover:not(:disabled):not(.disabled) {
    background-color: #e9ecef;
}

.btn-download {
    background-color: #28a745;
    color: white;
    border-color: #28a745;
}

.btn-download:hover {
    opacity: 0.9;
}
</style>
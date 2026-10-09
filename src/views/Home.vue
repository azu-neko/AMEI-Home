<script setup>
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import HeroSection from '../components/HeroSection.vue';
import { emoDiarySections, emoDiarySubtitle, emoDiaryTitle } from '../constants/emoDiary';

const SlidePanel = defineAsyncComponent(() => import('../components/SlidePanel.vue'));

// 页面状态机：loading(加载中) -> opening(开场动画) -> ready(内容可见)
const stage = ref('loading');
// 统一管理当前打开的侧栏：none | bigtech | simulator
const activePanel = ref('none');
const hitokoto = ref('May a gentle light find you each day.');
const hitokotoFrom = ref('');
// 使用时间戳避免背景图被浏览器缓存，保证每次进入页面都可刷新背景
const bgUrl = `https://www.dmoe.cc/random.php?t=${Date.now()}`;
// 通过 CSS 变量注入背景图地址，默认 none 表示仅显示渐变底色
const bgImage = ref('none');
// 背景图最大等待时间，超时后不阻塞页面进入 ready
const MAX_LOADING_MS = 10000;
let readyTimer = 0;
let maxTimer = 0;
let isUnmounted = false;
let bgImageLoader = null;

const fetchHitokoto = async () => {
  // 拉取底部一言，失败时保持默认文案
  try {
    const response = await fetch('https://v1.hitokoto.cn?encode=json');
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    if (isUnmounted) {
      return;
    }
    if (data?.hitokoto) {
      hitokoto.value = data.hitokoto;
      hitokotoFrom.value = data.from || '';
    }
  } catch (error) {
    console.warn('hitokoto 请求失败:', error);
  }
};

const startOpening = () => {
  // 仅在 loading 阶段切到 opening，再进入 ready
  if (stage.value !== 'loading') {
    return;
  }
  stage.value = 'opening';
  readyTimer = window.setTimeout(() => {
    stage.value = 'ready';
  }, 1200);
};

const openBigtechPanel = () => {
  // 面板互斥：切换后只保留当前目标面板
  activePanel.value = 'bigtech';
};

const openSimulatorPanel = () => {
  // 面板互斥：切换后只保留当前目标面板
  activePanel.value = 'simulator';
};

const closePanel = () => {
  // 统一关闭入口：遮罩点击与面板按钮都走这里
  activePanel.value = 'none';
};

onMounted(() => {
  // 预加载背景图：成功则使用远程图，超时/失败则回退纯色背景
  let timedOut = false;
  let imageLoaded = false;
  const img = new Image();
  bgImageLoader = img;

  const openFromLoading = () => {
    if (isUnmounted || stage.value !== 'loading') {
      return;
    }
    startOpening();
  };

  img.onload = () => {
    if (timedOut || bgImageLoader !== img || isUnmounted) {
      return;
    }
    imageLoaded = true;
    window.clearTimeout(maxTimer);
    maxTimer = 0;
    bgImage.value = `url("${bgUrl}")`;
    openFromLoading();
  };

  img.onerror = () => {
    if (bgImageLoader !== img || isUnmounted) {
      return;
    }
    bgImage.value = 'none';
  };

  img.src = bgUrl;
  maxTimer = window.setTimeout(() => {
    if (imageLoaded) {
      return;
    }
    timedOut = true;
    bgImage.value = 'none';
    openFromLoading();
  }, MAX_LOADING_MS);

  fetchHitokoto();
});

onBeforeUnmount(() => {
  // 组件销毁时清理计时器与图片监听，避免内存泄漏
  isUnmounted = true;
  window.clearTimeout(readyTimer);
  window.clearTimeout(maxTimer);
  if (bgImageLoader) {
    bgImageLoader.onload = null;
    bgImageLoader.onerror = null;
    bgImageLoader.src = '';
    bgImageLoader = null;
  }
});
</script>

<template>
  <div
    class="home"
    :class="{
      'bigtech-open': activePanel === 'bigtech',
      'simulator-open': activePanel === 'simulator',
    }"
    :data-stage="stage"
    :style="{ '--bg-image': bgImage }"
  >
    <div class="loader" aria-hidden="true">
      <div class="loader-core">
        <div class="loader-orbit"></div>
      </div>
    </div>

    <div class="home-layout">
      <!-- 遮罩仅在面板打开时出现；点击遮罩可关闭当前面板 -->
      <div v-if="activePanel !== 'none'" class="simulator-backdrop" @click="closePanel"></div>

      <!-- 主内容区：会在左右面板打开时整体平移 -->
      <div class="main-shell">
        <main class="page">
          <HeroSection
            :emo-diary-title="emoDiaryTitle"
            :emo-diary-subtitle="emoDiarySubtitle"
            :emo-diary-sections="emoDiarySections"
            :is-ready="stage === 'ready'"
            @open-bigtech="openBigtechPanel"
            @open-simulator="openSimulatorPanel"
          />
        </main>

        <footer class="site-footer">
          <div class="footer-inner">
            <p class="footer-copy">
              "{{ hitokoto }}"
              <span v-if="hitokotoFrom" class="footer-from">- {{ hitokotoFrom }}</span>
            </p>
          </div>
        </footer>
      </div>

      <!-- 左侧面板：互联网大厂模拟器（按需挂载，避免 iframe 常驻） -->
      <SlidePanel
        aria-label="互联网大厂模拟器面板"
        title="互联网大厂模拟器"
        side="left"
        :open="activePanel === 'bigtech'"
        src="https://www.bigtech-simulator.com/"
        @close="closePanel"
      />

      <!-- 右侧面板：月抛模拟器（按需挂载，避免 iframe 常驻） -->
      <SlidePanel
        aria-label="月抛模拟器面板"
        title="月抛模拟器"
        side="right"
        :open="activePanel === 'simulator'"
        src="/月抛模拟器 (Final Edition).html"
        @close="closePanel"
      />
    </div>
  </div>
</template>

<style scoped>
.loader-core {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  position: relative;
  z-index: 1;
}

.home-layout {
  position: relative;
  z-index: 1;
}

.main-shell {
  position: relative;
  z-index: 1;
  /* 面板开关时主内容平移动画 */
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.simulator-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(5, 7, 10, 0.45);
  z-index: 4;
}

.home.bigtech-open .main-shell {
  /* 左侧面板打开时，主内容向右让位 */
  transform: translateX(min(46vw, 680px));
}

.home.simulator-open .main-shell {
  /* 右侧面板打开时，主内容向左让位 */
  transform: translateX(calc(-1 * min(46vw, 680px)));
}

@media (max-width: 820px) {
  .home.bigtech-open .main-shell,
  .home.simulator-open .main-shell {
    transform: none;
  }

  :deep(.emo-diary) {
    margin-inline: auto;
    text-align: left;
  }
}
</style>

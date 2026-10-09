<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  ariaLabel: { type: String, required: true },
  title: { type: String, required: true },
  // side 控制面板从左侧还是右侧滑入
  side: { type: String, default: 'right' },
  src: { type: String, required: true },
  // open 为 true 时显示面板并触发滑入动画
  open: { type: Boolean, default: false },
});

defineEmits(['close']);
// 组件职责：只负责渲染侧栏和抛出 close 事件，不管理打开状态

const shouldRenderFrame = ref(false);
let frameTimer = 0;

watch(
  () => props.open,
  (isOpen) => {
    window.clearTimeout(frameTimer);
    if (!isOpen) {
      shouldRenderFrame.value = false;
      return;
    }
    frameTimer = window.setTimeout(() => {
      shouldRenderFrame.value = true;
    }, 140);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  window.clearTimeout(frameTimer);
});
</script>

<template>
  <!-- 侧栏容器：通过 side + open 控制左右方向与开合状态 -->
  <aside
    :class="['slide-panel', side === 'left' ? 'is-left' : 'is-right', { 'is-open': open }]"
    :aria-label="ariaLabel"
  >
    <header class="simulator-panel-head">
      <a-typography-title :level="5" class="simulator-panel-title">{{ title }}</a-typography-title>
      <a-button size="small" shape="round" @click="$emit('close')">关闭</a-button>
    </header>
    <div class="simulator-panel-body">
      <!-- 使用 iframe 承载外部/独立页面 -->
      <iframe
        v-if="shouldRenderFrame"
        class="simulator-frame"
        :src="src"
        :title="title"
        sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
        referrerpolicy="no-referrer"
      ></iframe>
    </div>
  </aside>
</template>

<style scoped>
.slide-panel {
  position: fixed;
  top: 0;
  width: min(46vw, 680px);
  min-width: 360px;
  height: 100vh;
  background: rgba(12, 15, 21, 0.96);
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: -12px 0 36px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.25s ease;
  z-index: 5;
  display: flex;
  flex-direction: column;
  opacity: 0;
  pointer-events: none;
  will-change: transform;
}

.slide-panel.is-left {
  left: 0;
  border-left: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 12px 0 36px rgba(0, 0, 0, 0.42);
  transform: translateX(-100%);
}

.slide-panel.is-right {
  right: 0;
  transform: translateX(100%);
}

.slide-panel.is-open {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

.simulator-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.simulator-panel-title {
  margin: 0;
  color: var(--text);
}

.simulator-panel-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 820px) {
  .slide-panel {
    width: min(92vw, 520px);
    min-width: 0;
    height: 100dvh;
  }

  .simulator-panel-head {
    padding-top: calc(12px + env(safe-area-inset-top));
    padding-left: max(14px, env(safe-area-inset-left));
    padding-right: max(14px, env(safe-area-inset-right));
  }

  .simulator-panel-body {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

.simulator-frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: #020617;
}
</style>

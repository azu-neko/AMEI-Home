<script setup>
import EmoDiary from './EmoDiary.vue';

// 该组件专注“主卡片内容”：个人信息、外链按钮、功能入口、歌词模块
defineProps({
  emoDiaryTitle: { type: String, required: true },
  emoDiarySubtitle: { type: String, required: true },
  emoDiarySections: { type: Array, required: true },
  // 由父组件传入，控制首屏卡片何时开始入场
  isReady: { type: Boolean, required: true },
});

defineEmits(['open-bigtech', 'open-simulator']);
// 向父组件抛出事件，由父组件统一控制左右面板状态
</script>

<template>
  <a-card id="hero" class="hero-card" :class="{ 'is-ready': isReady }" :bordered="false" hoverable>
    <a-row :gutter="[24, 24]" align="top">
      <a-col :xs="24" :sm="7" :md="5" class="hero-avatar-col">
        <a-avatar
          class="hero-avatar"
          :size="96"
          shape="square"
          src="https://easyimage2.788848.xyz/i/2026/05/09/12u41j3.webp"
          alt="AMEI avatar"
        />
      </a-col>
      <a-col :xs="24" :sm="17" :md="19">
        <a-space direction="vertical" size="middle" class="hero-content">
          <div>
            <a-typography-title :level="1" class="hero-title">AMEI</a-typography-title>
            <a-typography-paragraph class="hero-lead">
              <span class="lead-zh">代码不是工具，而是改变世界的语言。</span>
              <span class="lead-en"
                >Code is not just a tool — it’s a language to shape new worlds.</span
              >
            </a-typography-paragraph>
          </div>
          <a-space size="small" wrap class="hero-actions">
            <!-- 对外跳转链接 -->
            <a-button
              type="primary"
              shape="round"
              href="https://github.com/AMEINEKO"
              target="_blank"
              rel="noopener noreferrer"
              >GitHub</a-button
            >
            <a-button
              shape="round"
              href="https://komari.azuneko.com/"
              target="_blank"
              rel="noopener noreferrer"
              >Komari Monitor</a-button
            >
            <a-button
              shape="round"
              href="https://blog.azuneko.com/"
              target="_blank"
              rel="noopener noreferrer"
              >Blog</a-button
            >
          </a-space>
          <div class="fun-section">
            <a-typography-title :level="4" class="fun-title">好玩的东西</a-typography-title>
            <!-- 触发父组件打开对应侧栏 -->
            <a-space size="small" wrap class="fun-actions">
              <a-button shape="round" @click="$emit('open-bigtech')">互联网大厂模拟器</a-button>
              <a-button shape="round" @click="$emit('open-simulator')">月抛模拟器</a-button>
            </a-space>
          </div>
          <div class="fun-section">
            <a-typography-title :level="4" class="fun-title">Nana的emo时间</a-typography-title>
            <EmoDiary
              :title="emoDiaryTitle"
              :subtitle="emoDiarySubtitle"
              :sections="emoDiarySections"
            />
          </div>
        </a-space>
      </a-col>
    </a-row>
  </a-card>
</template>

<style scoped>
.hero-card {
  border-radius: 18px;
  border: 1px solid var(--line);
  background: var(--glass);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden;
  opacity: 0;
  transform: translateY(16px);
  animation: fadeUp 0.9s ease forwards;
  animation-play-state: paused;
  transition:
    transform 0.4s ease,
    border-color 0.4s ease,
    box-shadow 0.4s ease;
}

.hero-card.is-ready {
  animation-play-state: running;
}

.hero-card:hover {
  transform: translateY(-4px);
  border-color: rgba(154, 220, 210, 0.4);
  box-shadow: 0 26px 46px rgba(0, 0, 0, 0.45);
}

.hero-card :deep(.ant-card-body) {
  padding: clamp(28px, 4vw, 70px);
  background: transparent;
}

.hero-avatar-col {
  display: flex;
  justify-content: center;
}
.hero-avatar {
  border-radius: 26px;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.45);
}
.hero-avatar :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 26px;
}
.hero-content,
.hero-actions,
.fun-actions,
.fun-section {
  width: 100%;
}
.fun-section {
  margin-top: 2rem;
}
.fun-title {
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  color: var(--text);
  font-weight: 500;
  text-align: left;
}

.hero-actions :deep(.ant-btn),
.fun-actions :deep(.ant-btn) {
  border-color: rgba(255, 255, 255, 0.16);
  color: var(--muted);
  background: rgba(10, 12, 16, 0.45);
  box-shadow: none;
  transition:
    border-color 0.3s ease,
    color 0.3s ease,
    background 0.3s ease;
}

.hero-actions :deep(.ant-btn:hover),
.fun-actions :deep(.ant-btn:hover) {
  color: var(--text);
  border-color: rgba(154, 220, 210, 0.6);
  background: rgba(154, 220, 210, 0.12);
}

.hero-actions :deep(.ant-btn-primary) {
  color: #0f1718;
  background: rgba(154, 220, 210, 0.85);
  border-color: rgba(154, 220, 210, 0.85);
}

.hero-actions :deep(.ant-btn-primary:hover) {
  background: rgba(154, 220, 210, 1);
  border-color: rgba(154, 220, 210, 1);
}

.hero-title {
  display: inline-block;
  font-family: 'Shippori Mincho', 'Times New Roman', serif;
  font-size: clamp(2.2rem, 4.8vw, 3.6rem);
  margin: 0;
  font-weight: 600;
  line-height: 1.05;
  background-image: linear-gradient(
    120deg,
    rgba(154, 220, 210, 0.55),
    rgba(246, 247, 249, 0.9),
    rgba(184, 166, 255, 0.55)
  );
  background-size: 200% 100%;
  background-position: 0% 50%;
  color: transparent;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  animation: title-shine 6s linear infinite;
}

.hero-lead {
  margin: 1rem 0 1.6rem;
  color: var(--muted);
  max-width: 32rem;
}
.hero-lead .lead-zh,
.hero-lead .lead-en {
  display: block;
}
.hero-lead .lead-zh {
  font-size: 1.05rem;
  color: var(--text);
  letter-spacing: 0.02em;
}
.hero-lead .lead-en {
  margin-top: 0.45rem;
  font-size: 0.95rem;
  color: rgba(246, 247, 249, 0.7);
}

@media (max-width: 820px) {
  .hero-content {
    text-align: center;
  }
  .hero-actions,
  .fun-actions {
    justify-content: center;
  }
  .fun-title {
    text-align: center;
  }

  .hero-actions :deep(.ant-btn),
  .fun-actions :deep(.ant-btn) {
    min-height: 42px;
    padding-inline: 16px;
  }
}

@media (max-width: 600px) {
  .hero-card :deep(.ant-card-body) {
    padding-inline: 20px;
    padding-block: 34px;
  }
  .hero-title {
    font-size: clamp(1.8rem, 8vw, 2.5rem);
  }
  .hero-lead {
    margin: 0.7rem 0 1.1rem;
  }
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .fun-actions {
    gap: 10px;
  }
  .hero-actions :deep(.ant-btn),
  .fun-actions :deep(.ant-btn) {
    width: 100%;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1.2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-title {
    animation: none;
    background-position: 50% 50%;
  }
}

@keyframes title-shine {
  to {
    background-position: 200% 50%;
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

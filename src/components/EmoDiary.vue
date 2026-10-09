<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  // 二维数组：每个 section 包含多行歌词（便于按段分组展示）
  sections: { type: Array, required: true },
});
</script>

<template>
  <section class="emo-diary" aria-label="歌词日记">
    <div class="emo-diary-head">
      <p class="emo-diary-kicker">Diary Fragment</p>
      <h3 class="emo-diary-title">{{ title }}</h3>
      <p class="emo-diary-subtitle">{{ subtitle }}</p>
    </div>
    <div class="emo-diary-body">
      <div
        v-for="(section, sectionIndex) in sections"
        :key="`emo-section-${sectionIndex}`"
        class="emo-diary-section"
      >
        <p
          v-for="(line, lineIndex) in section"
          :key="`emo-line-${sectionIndex}-${lineIndex}`"
          class="emo-diary-line"
        >
          {{ line }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.emo-diary {
  position: relative;
  width: min(100%, 760px);
  padding: clamp(28px, 4vw, 42px) clamp(22px, 4vw, 40px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 248, 242, 0.12), rgba(255, 248, 242, 0.06)),
    rgba(17, 18, 24, 0.26);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 18px 38px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.emo-diary::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 22%),
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 39px,
      rgba(255, 255, 255, 0.035) 39px,
      rgba(255, 255, 255, 0.035) 40px
    );
  opacity: 0.45;
  pointer-events: none;
}

.emo-diary-head,
.emo-diary-body {
  position: relative;
  z-index: 1;
}

.emo-diary-head {
  margin-bottom: 28px;
}

.emo-diary-kicker {
  margin: 0 0 10px;
  font-family: 'Cormorant Garamond', 'Times New Roman', serif;
  font-size: 0.92rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(246, 247, 249, 0.48);
}

.emo-diary-title {
  margin: 0;
  font-family: 'Cormorant Garamond', 'Times New Roman', serif;
  font-size: clamp(1.9rem, 4vw, 2.8rem);
  font-weight: 500;
  line-height: 1.1;
  color: rgba(255, 250, 246, 0.96);
}

.emo-diary-subtitle {
  margin: 12px 0 0;
  max-width: 30rem;
  font-family: 'LXGW WenKai', 'STKaiti', serif;
  font-size: 0.98rem;
  line-height: 1.8;
  color: rgba(246, 247, 249, 0.62);
}

.emo-diary-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.emo-diary-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.emo-diary-line {
  margin: 0;
  font-family: 'LXGW WenKai', 'STKaiti', serif;
  font-size: clamp(1.08rem, 1.5vw, 1.22rem);
  line-height: 1.95;
  color: rgba(255, 250, 246, 0.9);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.18);
}

@media (max-width: 600px) {
  .emo-diary {
    max-width: 100%;
    padding: 22px 18px;
  }

  .emo-diary-head {
    margin-bottom: 20px;
  }

  .emo-diary-subtitle {
    font-size: 0.94rem;
    line-height: 1.72;
  }

  .emo-diary-body {
    gap: 18px;
  }

  .emo-diary-section {
    gap: 4px;
  }

  .emo-diary-line {
    font-size: 1rem;
    line-height: 1.8;
  }
}
</style>

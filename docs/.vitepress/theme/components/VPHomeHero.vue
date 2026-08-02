<script setup lang="ts">
import { ref } from 'vue'
import { useData } from 'vitepress'
import { VPButton } from 'vitepress/theme'
import { heroCodeSlides, heroCodeMaxLines } from './hero-code'

const { frontmatter: fm } = useData()

const maxLines = heroCodeMaxLines()

const current = ref(0)

function prev() {
  current.value =
    (current.value - 1 + heroCodeSlides.length) % heroCodeSlides.length
}

function next() {
  current.value = (current.value + 1) % heroCodeSlides.length
}
</script>

<template>
  <div v-if="fm.hero" class="VPHomeHero">
    <div class="container">
      <div class="main">
        <h1 class="heading">
          <span v-if="fm.hero.name" v-html="fm.hero.name" class="name clip"></span>
          <span v-if="fm.hero.text" v-html="fm.hero.text" class="text"></span>
        </h1>
        <p v-if="fm.hero.tagline" v-html="fm.hero.tagline" class="tagline"></p>

        <div v-if="fm.hero.actions" class="actions">
          <div v-for="action in fm.hero.actions" :key="action.link" class="action">
            <VPButton
              tag="a"
              size="medium"
              :theme="action.theme"
              :text="action.text"
              :href="action.link"
            />
          </div>
        </div>
      </div>

      <div class="hero-code">
        <div class="hero-code-window">
          <div class="hero-code-header">
            <span class="hero-code-dot"></span>
            <span class="hero-code-dot"></span>
            <span class="hero-code-dot"></span>
            <span class="hero-code-title">{{ heroCodeSlides[current].title }}</span>
            <template v-if="heroCodeSlides.length > 1">
              <span class="hero-code-counter">
                {{ current + 1 }}/{{ heroCodeSlides.length }}
              </span>
              <button class="hero-code-nav" type="button" aria-label="Previous snippet" @click="prev">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M6.5 1 3 5l3.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button class="hero-code-nav" type="button" aria-label="Next snippet" @click="next">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="m3.5 1 3.5 4-3.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </template>
          </div>
          <div
            class="hero-code-body"
            :style="{ minHeight: `calc(${maxLines} * var(--vp-code-line-height) * var(--vp-code-font-size) + 32px)` }"
            v-html="heroCodeSlides[current].html"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPHomeHero {
  margin-top: calc((var(--vp-nav-height) + var(--vp-layout-top-height, 0px)) * -1);
  padding: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 48px) 24px 48px;
}

@media (min-width: 640px) {
  .VPHomeHero {
    padding: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 80px) 48px 64px;
  }
}

@media (min-width: 960px) {
  .VPHomeHero {
    padding: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 80px) 64px 64px;
  }
}

.container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin: 0 auto;
  max-width: 1152px;
}

@media (min-width: 960px) {
  .container {
    flex-direction: row;
    align-items: center;
    gap: 48px;
  }
}

.main {
  flex: 0 0 auto;
}

@media (min-width: 960px) {
  .main {
    width: 48%;
  }
}

.heading {
  display: flex;
  flex-direction: column;
}

.name,
.text {
  width: fit-content;
  max-width: 392px;
  letter-spacing: -0.4px;
  line-height: 40px;
  font-size: 32px;
  font-weight: 700;
  white-space: pre-wrap;
}

@media (min-width: 640px) {
  .name,
  .text {
    max-width: 576px;
    line-height: 56px;
    font-size: 48px;
  }
}

@media (min-width: 960px) {
  .name,
  .text {
    line-height: 64px;
    font-size: 56px;
  }
}

.name {
  color: var(--vp-home-hero-name-color);
}

.clip {
  background: var(--vp-home-hero-name-background);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: var(--vp-home-hero-name-color);
}

.tagline {
  padding-top: 8px;
  max-width: 392px;
  line-height: 28px;
  font-size: 18px;
  font-weight: 500;
  white-space: pre-wrap;
  color: var(--vp-c-text-2);
}

@media (min-width: 640px) {
  .tagline {
    padding-top: 12px;
    max-width: 576px;
    line-height: 32px;
    font-size: 20px;
  }
}

@media (min-width: 960px) {
  .tagline {
    line-height: 36px;
    font-size: 24px;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  margin: -6px;
  padding-top: 24px;
}

@media (min-width: 640px) {
  .actions {
    padding-top: 32px;
  }
}

.action {
  flex-shrink: 0;
  padding: 6px;
}

.hero-code {
  flex: 1 1 auto;
  min-width: 0;
}

.hero-code-window {
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-code-block-bg);
  box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
}

.hero-code-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.hero-code-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--vp-c-divider);
}

.hero-code-dot:nth-child(1) {
  background: #f56565;
}

.hero-code-dot:nth-child(2) {
  background: #ecc94b;
}

.hero-code-dot:nth-child(3) {
  background: #48bb78;
}

.hero-code-title {
  margin-left: 8px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.hero-code-counter {
  margin-left: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.hero-code-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: pointer;
  transition: color 0.25s, border-color 0.25s, background-color 0.25s;
}

.hero-code-nav:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.hero-code-nav:active {
  transition: color 0.1s, border-color 0.1s, background-color 0.1s;
}

.hero-code-body {
  overflow-x: auto;
  padding: 16px;
  font-size: var(--vp-code-font-size);
  line-height: var(--vp-code-line-height);
}

.hero-code-body :deep(.vp-code) {
  margin: 0;
  padding: 4px 0;
  background: transparent;
}

.hero-code-body :deep(.vp-code .line) {
  min-height: 1.25em;
}
</style>

<script setup lang="ts">
import { ref } from "vue";
const state = ref<"idle" | "spinning" | "finished">("idle");
const spinDeg = ref(0);
const currentDeg = ref(0);
const spinRef = ref<HTMLElement>();
const names = ["Vi", "Nam", "Truong", "Ha", "Dung", "Bach"];

const intake = 6;

const finalList = names.slice(0, intake);

const getStyle = (index: number) => {
  const rotate = 360 / intake;
  const rotateDeg = rotate * index;
  const sliceDegree = 180 - rotate;
  return {
    "--slice-degree": `${sliceDegree}deg`,
    "--background-color": `hsl(${rotateDeg}, 100%, 50%)`,
    "--rotate-degree": `${rotateDeg}deg`,
    "--rotate-content": `${-rotateDeg}deg`,
    "--text-position": "4%",
    zIndex: index,
  };
};

const handleAnimationEnd = () => {
  state.value = "finished";
  spinRef.value?.classList.remove("spin-animation");
  if (spinRef.value) {
    currentDeg.value = spinDeg.value % 360;
    spinDeg.value = currentDeg.value;
  }
};

const handleClick = () => {
  if (state.value === "idle" || state.value === "finished") {
    state.value = "spinning";
    spinDeg.value += 7000 + Math.floor(Math.random() * 5000);
    spinRef.value?.classList.add("spin-animation");
  }
};
</script>

<template>
  <div class="wrapper">
    <div class="spin-wrapper">
      <div ref="spinRef" class="spin" @animationend="handleAnimationEnd">
        <div
          v-for="(name, index) in finalList"
          :key="name"
          class="pie"
          :style="getStyle(index)"
        >
          <div class="content">
            <div class="text">
              {{ name }}
            </div>
          </div>
        </div>

        <button
          :disabled="state === 'spinning'"
          @click="handleClick"
          class="activator"
        >
          🌀
        </button>
      </div>

      <div class="pointer-wrapper">
        <div class="pointer"></div>
      </div>
    </div>
  </div>
</template>

<style>
.wrapper {
  --pointer-height: 40px;
  --spin-wrapper-size: 600px;
  --spinning-deg: v-bind(spinDeg + "deg");
  display: flex;
  gap: 20px;
}

.spin-wrapper {
  width: var(--spin-wrapper-size);
  height: var(--spin-wrapper-size);
}

.spin {
  rotate: v-bind(currentDeg + "deg");
  width: 100%;
  height: 100%;
  position: relative;

  animation-duration: 10s;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.44, -0.205, 0, 1.13);
}

.spin-animation {
  animation-name: spinning;
}

.pointer-wrapper {
  height: var(--pointer-height);
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
}

.pointer {
  top: -100%;
  height: 40px;
  width: 80px;
  overflow: hidden;
  position: absolute;
  transform-origin: 50% 100%;
  rotate: 120deg;

  &:before {
    height: inherit;
    width: inherit;
    position: absolute;
    content: "";
    border-radius: 40px 40px 0 0;
    transform-origin: 50% 100%;
    rotate: 120deg;
    background-color: blueviolet;
  }
}

.activator {
  border-color: transparent;
  cursor: pointer;
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: white;
  display: grid;
  place-content: center;
  font-size: 23px;
  z-index: 1000;

  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.pie {
  height: calc(var(--spin-wrapper-size) / 2);
  width: var(--spin-wrapper-size);
  overflow: hidden;
  position: absolute;
  transform-origin: 50% 100%;

  &:before {
    height: inherit;
    width: inherit;
    position: absolute;
    content: "";
    border-radius: calc(var(--spin-wrapper-size) / 2)
      calc(var(--spin-wrapper-size) / 2) 0 0;
    transform-origin: 50% 100%;
    rotate: var(--slice-degree);
    background-color: var(--background-color);
  }

  rotate: var(--rotate-degree);
}

@keyframes spinning {
  from {
    rotate: v-bind(currentDeg + "deg");
  }
  to {
    rotate: var(--spinning-deg);
  }
}

.content {
  font-size: xx-large;
  font-weight: bold;
  height: 100%;
  width: 100%;
  position: absolute;
  border-radius: 300px 300px 0 0;
  transform-origin: 50% 100%;
  rotate: var(--slice-degree);
}

.text {
  position: absolute;
  left: var(--text-position);
  bottom: var(--text-position);
}
</style>

<script setup lang="ts">
const names = ["Vi", "Nam", "Truong", "Ha", "Hung", "Bach"];

const intake = 5;

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
</script>

<template>
  <div class="parent">
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

    <div class="center">🌀</div>
  </div>
</template>

<style>
.center {
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
  height: 300px;
  width: 600px;
  overflow: hidden;
  position: absolute;
  transform-origin: 50% 100%;

  &:before {
    height: inherit;
    width: inherit;
    position: absolute;
    content: "";
    border-radius: 300px 300px 0 0;
    transform-origin: 50% 100%;
    rotate: var(--slice-degree);
    background-color: var(--background-color);
  }

  rotate: var(--rotate-degree);
}

.parent {
  width: 600px;
  height: 600px;
  position: relative;
  animation-duration: 10s;
  animation-fill-mode: forwards;
  animation-name: spinning;
  animation-timing-function: cubic-bezier(0.44, -0.205, 0, 1.13);
}

@keyframes spinning {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(10000deg);
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

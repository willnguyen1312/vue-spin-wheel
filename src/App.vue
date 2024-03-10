<script setup lang="ts"></script>

<template>
  <div class="parent">
    <div class="pie pie1">
      <p class="content">Vi</p>
    </div>
    <div class="pie pie2">
      <p class="content">Nam</p>
    </div>
    <div class="pie pie3">
      <p class="content">Truong</p>
    </div>
    <div class="pie pie4">
      <p class="content">Ha</p>
    </div>

    <div class="center"></div>
  </div>
</template>

<style scoped>
.center {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: white;

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
    transform: rotate(90deg);
  }
}

.pie1 {
  &:before {
    background-color: red;
  }
}

.pie2 {
  &:before {
    background-color: green;
  }
  transform: rotate(90deg);
}

.pie3 {
  transform: rotate(180deg);
  &:before {
    background-color: blue;
  }
}

.pie4 {
  transform: rotate(270deg);
  &:before {
    background-color: pink;
  }
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
  display: grid;
  place-content: center;
  z-index: 999;
  width: 50%;
  height: 100%;
  position: absolute;
  rotate: -45deg;
  font-size: xx-large;
  font-weight: bold;
}
</style>

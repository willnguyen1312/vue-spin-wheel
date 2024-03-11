<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
const state = ref<"idle" | "spinning" | "finished">("idle");
const spinDeg = ref(0);
const currentDeg = ref(0);
const spinRef = ref<HTMLElement>();

const randomHslColor = () => {
  const h = Math.floor(Math.random() * 361);
  const s = 100;
  const l = Math.floor(Math.random() * (100 - 50) + 50);
  return `hsl(${h},${s}%,${l}%)`;
};

type Person = {
  name: string;
  avatarUrl: string;
  color?: string;
};

const people = ref<Person[]>(JSON.parse(localStorage.getItem("items") ?? "[]"));

const winner = ref<Person>();

people.value = people.value.map((item) => ({
  ...item,
  color: item.color ?? randomHslColor(),
}));

const includedPeople = ref<string[]>(
  JSON.parse(localStorage.getItem("includedPeople") ?? "[]"),
);

const finalPeople = computed(() =>
  people.value.filter((person) => includedPeople.value.includes(person.name)),
);

const resultList = computed(() => {
  const initialList = finalPeople.value
    .filter((person) => includedPeople.value.includes(person.name))
    .map((person) => person.name);
  const reversedList = initialList.slice(1);
  reversedList.reverse();
  return [initialList[0], ...reversedList];
});

watchEffect(() => {
  localStorage.setItem(
    "includedPeople",
    JSON.stringify(includedPeople.value, null, 2),
  );
});

const getStyle = (index: number) => {
  const rotate = 360 / finalPeople.value.length;
  const rotateDeg = rotate * index;
  const sliceDegree = 180 - rotate;
  return {
    "--slice-degree": `${sliceDegree}deg`,
    "--background-color": finalPeople.value[index].color,
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

  const result =
    resultList.value[
      Math.floor(spinDeg.value / (360 / resultList.value.length))
    ];

  const winnerPerson = finalPeople.value.find(
    (person) => person.name === result,
  );
  if (winnerPerson) {
    winner.value = winnerPerson;
  }
};

const handleClick = () => {
  if (state.value === "idle" || state.value === "finished") {
    winner.value = undefined;
    state.value = "spinning";
    spinDeg.value += 10000 + Math.ceil(Math.random() * 360);
    spinRef.value?.classList.add("spin-animation");
  }
};
</script>

<template>
  <div class="wrapper">
    <div class="spin-wrapper">
      <div ref="spinRef" class="spin" @animationend="handleAnimationEnd">
        <div
          v-for="(item, index) in finalPeople"
          :key="item.name"
          class="pie"
          :style="getStyle(index)"
        >
          <div class="content">
            <div class="text">
              {{ item.name }}
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

      <div class="pointer pointer-up"></div>
      <div class="pointer pointer-down"></div>
    </div>

    <fieldset class="fieldset">
      <legend class="legend">Members</legend>
      <div class="members">
        <div
          v-for="(person, personIdx) in people"
          :key="personIdx"
          class="member-wrapper"
        >
          <label :for="`person-${person.name}`">{{ person.name }}</label>

          <input
            :id="`person-${person.name}`"
            :name="`person-${person.name}`"
            type="checkbox"
            v-model="includedPeople"
            :value="person.name"
          />
        </div>
      </div>
    </fieldset>
  </div>

  <div class="winner-wrapper">
    <img v-if="winner" :src="winner.avatarUrl" class="winner" />
  </div>
</template>

<style>
.fieldset {
  height: fit-content;
}

.legend {
  text-align: center;
  font-size: large;
  font-weight: bold;
}

.members {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100px;
}

.member-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: large;
}

.wrapper {
  --pointer-height: 40px;
  --spin-wrapper-size: 600px;
  --spinning-deg: v-bind(spinDeg + "deg");
  display: flex;
  justify-content: center;
  gap: 100px;
}

.spin-wrapper {
  position: relative;
  width: var(--spin-wrapper-size);
  height: var(--spin-wrapper-size);
}

.spin {
  rotate: v-bind(currentDeg + "deg");
  width: 100%;
  height: 100%;
  position: relative;

  animation-duration: 14s;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.44, -0.205, 0, 1.13);
}

.spin-animation {
  animation-name: spinning;
}

.pointer {
  right: 0;
  top: 50%;
  transform: translate(50%, -100%);
  height: 40px;
  width: 80px;
  overflow: hidden;
  position: absolute;
  transform-origin: 50% 100%;

  &:before {
    height: inherit;
    width: inherit;
    position: absolute;
    content: "";
    border-radius: 40px 40px 0 0;
    transform-origin: 50% 100%;
    rotate: 150deg;
    background-color: blueviolet;
  }
}
.pointer-up {
  transform: translate(50%, -100%);
}

.pointer-down {
  transform: translate(50%, -100%) scaleY(-1);
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

@keyframes fadeInUp {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0%);
    opacity: 1;
  }
}

.winner-wrapper {
  padding-top: 32px;
  width: 100vw;
  display: grid;
  place-content: center;
}

.winner {
  border-radius: 16px;
  animation: 3s fadeInUp;
}
</style>

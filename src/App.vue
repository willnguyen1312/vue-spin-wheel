<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, watchEffect } from "vue";
import { createAnimation, decode, encode } from "./utils";
const state = ref<"idle" | "spinning" | "finished" | "manual">("idle");
const spinDeg = ref(0);
const currentDeg = ref(0);
const spinRef = ref<HTMLElement>();
const lastManualDeg = ref();
const lastCurrentDeg = ref(0);
const animationOverFlow = ref<"hidden" | "visible">("hidden");

function checkOnTheMove() {
  return state.value === "spinning" || state.value === "manual";
}

function preventDefault(event: Event) {
  event.preventDefault();
}

window.addEventListener("wheel", preventDefault, { passive: false });
window.addEventListener("touchmove", preventDefault, { passive: false });

onMounted(() => {
  createAnimation();

  if (spinRef.value) {
    spinRef.value.style.background = getBackgroundColor();
  }
});

let lastTimeStamp: number;
let lastDeg = 0;
let direction: "clockwise" | "counter-clockwise" | "none" = "none";
const numberOfRounds = ref(1);
const timeThreshold = 150;

const getDegreeFromCenter = (x: number, y: number) => {
  const center = document.querySelector(".activator") as HTMLButtonElement;

  const rect = center.getBoundingClientRect();
  const w = rect.width / 2 + rect.x;
  const h = rect.height / 2 + rect.y;

  const deltaX = w - x;
  const deltaY = h - y;

  const rad = Math.atan2(deltaY, deltaX);

  let deg = Math.round(rad * (180 / Math.PI));

  if (deg < 0) {
    deg = (deg + 360) % 360;
  }

  return deg;
};

const handlePointerDown = (e: PointerEvent) => {
  preventDefault(e);
  animationOverFlow.value = "hidden";
  winner.value = undefined;

  if (checkOnTheMove()) return;

  lastManualDeg.value = getDegreeFromCenter(e.clientX, e.clientY);
  lastCurrentDeg.value = currentDeg.value;

  lastTimeStamp = Date.now();
  lastDeg = currentDeg.value;
  numberOfRounds.value = 1;
};

window.addEventListener("pointerup", (e: PointerEvent) => {
  preventDefault(e);

  if (checkOnTheMove()) return;
  const degDiff = currentDeg.value - lastCurrentDeg.value;
  const timeDiff = (Date.now() - lastTimeStamp) / timeThreshold;
  const hasSpun = currentDeg.value - lastDeg !== 0;

  lastManualDeg.value = undefined;

  if (hasSpun && direction !== "none") {
    spinRef.value?.classList.add("spin-animation");
    spinRef.value?.classList.add("spin-simple-animation");
    spinDeg.value =
      currentDeg.value +
      360 * (degDiff / 360) * timeDiff * numberOfRounds.value;

    spinDeg.value =
      direction === "clockwise"
        ? Math.abs(spinDeg.value)
        : -Math.abs(spinDeg.value);

    state.value = "manual";
  }
});

const runMe = () => {
  const currentTimeStamp = Date.now();
  const diff = currentDeg.value - lastDeg;

  if (direction === "none" && diff !== 0) {
    direction = diff > 0 ? "clockwise" : "counter-clockwise";
  }

  if (diff === 0) {
    lastTimeStamp = currentTimeStamp;
    numberOfRounds.value = 1;
    direction = "none";
  } else {
    lastDeg = currentDeg.value;
  }
};

window.addEventListener("pointermove", (e: PointerEvent) => {
  preventDefault(e);

  if (checkOnTheMove() || !lastManualDeg.value) return;

  runMe();

  const currentDegValue = getDegreeFromCenter(e.clientX, e.clientY);
  const diffDeg = currentDegValue - lastManualDeg.value;
  const newDegree = lastCurrentDeg.value + diffDeg;

  if (
    (newDegree < 0 && currentDeg.value > 0) ||
    (newDegree > 0 && currentDeg.value < 0)
  ) {
    numberOfRounds.value += 0.5;
  }
  currentDeg.value = newDegree;
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
  const isMetaKeyPressed = e.metaKey || e.ctrlKey;
  const isOnTheMove = checkOnTheMove();
  const hasMetaKeyPressWithA = isMetaKeyPressed && e.key === "a";
  hasMetaKeyPressWithA && preventDefault(e);

  if (isMetaKeyPressed && e.key === "s") {
    preventDefault(e);
    // Update URL to include search query in URL
    const decodedState = encode({
      people: people.value,
      includedPeople: includedPeople.value,
    });

    history.replaceState(null, "", `?state=${decodedState}`);
    // Copy url to clipboard
    navigator.clipboard.writeText(window.location.href);
  }

  if (hasMetaKeyPressWithA && !isOnTheMove) {
    // Toggle all people
    const isAllSelected = people.value.every((person) =>
      includedPeople.value.includes(person.name)
    );

    if (isAllSelected) {
      includedPeople.value = [];
    } else {
      includedPeople.value = people.value.map((person) => person.name);
    }
  }
});

const getBackgroundColor = () => {
  const first = `hsl(${Math.floor(Math.random() * 361)},100%,${Math.floor(
    Math.random() * (100 - 50) + 50
  )}%,${Math.random()})`;
  const second = `hsl(${Math.floor(Math.random() * 361)},100%,${Math.floor(
    Math.random() * (100 - 50) + 50
  )}%)`;

  const gradient = `linear-gradient(${first}, ${second})`;
  return gradient;
};

type Person = {
  name: string;
  avatarUrl: string;
  backgroundColor: string;
};

// Check if URL has state query
const urlParams = new URLSearchParams(window.location.search);
const stateQuery = urlParams.get("state") ?? "";
const decodedState = decode(stateQuery) ?? {};

const initialPeople: Person[] =
  decodedState.people ?? JSON.parse(localStorage.getItem("items") ?? "[]");
const initialIncludedPeople: string[] =
  decodedState.includedPeople ??
  JSON.parse(localStorage.getItem("includedPeople") ?? "[]");

const people = ref<Person[]>(
  initialPeople.sort((first, second) => first.name.localeCompare(second.name))
);

const includedPeople = ref<string[]>(initialIncludedPeople);

const winner = ref<Person>();

people.value = people.value.map(
  (item) =>
    ({
      ...item,
      backgroundColor: getBackgroundColor(),
    } satisfies Person)
);

const finalPeople = computed(() =>
  people.value.filter((person) => includedPeople.value.includes(person.name))
);

watch(includedPeople, (newIncludedPeople) => {
  localStorage.setItem(
    "includedPeople",
    JSON.stringify(newIncludedPeople, null, 2)
  );

  // Reload for getting new fun colors 😊
  const currentURL = new URL(window.location.href);
  location.href = currentURL.origin + currentURL.pathname;
});

watchEffect(() => {
  localStorage.setItem("items", JSON.stringify(people.value, null, 2));
  if (stateQuery) {
    // Remove query from URL without refreshing
    history.replaceState(null, "", window.location.pathname);
  }
});

const getStyle = (index: number) => {
  const isOnePerson = finalPeople.value.length === 1;

  const rotate = 360 / finalPeople.value.length;
  const rotateDeg = rotate * index;
  const sliceDegree = 180 - rotate;

  if (isOnePerson && spinRef.value) {
    spinRef.value.style.background = finalPeople.value[index].backgroundColor;

    return {
      "--rotate-degree": `${rotateDeg}deg`,
      "--rotate-content": `${-rotateDeg}deg`,
      "--text-position": "4%",
      zIndex: index,
    };
  }

  return {
    "--slice-degree": `${sliceDegree}deg`,
    "--background": finalPeople.value[index].backgroundColor,
    "--rotate-degree": `${rotateDeg}deg`,
    "--rotate-content": `${-rotateDeg}deg`,
    "--text-position": "4%",
    zIndex: index,
  };
};

const showWinner = async () => {
  const length = includedPeople.value.length;
  const sortedIncludedPeople = includedPeople.value.sort();
  const middlePerson = sortedIncludedPeople[0];

  const isEven = length % 2 === 0;

  const half = Math.floor(sortedIncludedPeople.length / 2);
  let left: string[] = [];
  let right: string[] = [];
  let index = 0;
  let result: string = "";

  if (isEven) {
    left = sortedIncludedPeople.slice(1, 1 + half).reverse();
    right = sortedIncludedPeople.slice(1 + half).reverse();
    const _resultList = [...left, middlePerson, ...right];
    const resultList = spinDeg.value < 0 ? _resultList.reverse() : _resultList;

    index = Math.floor(Math.abs(spinDeg.value) / (360 / resultList.length));
    result = resultList[index % length];
  } else {
    left = sortedIncludedPeople.slice(1, 1 + half).reverse();
    right = sortedIncludedPeople.slice(1 + half).reverse();
    const _resultList = [...left, middlePerson, ...right];
    const resultList = spinDeg.value < 0 ? _resultList.reverse() : _resultList;

    const piece = 360 / resultList.length;

    index = Math.floor(
      (spinDeg.value < 0
        ? Math.abs(spinDeg.value) + piece / 2
        : spinDeg.value - piece / 2) / piece
    );
    result = resultList[index % length];
  }

  const winnerPerson = finalPeople.value.find(
    (person) => person.name === result
  );
  if (winnerPerson) {
    winner.value = winnerPerson;

    await nextTick();
    animationOverFlow.value = "visible";
  }
};

const handleAnimationEnd = () => {
  spinRef.value?.classList.remove("spin-animation");
  spinRef.value?.classList.remove("spin-simple-animation");
  if (spinRef.value) {
    currentDeg.value = spinDeg.value % 360;
    spinDeg.value = currentDeg.value;
  }

  state.value = "finished";
  direction = "none";
  numberOfRounds.value = 1;

  showWinner();
};

const handleClick = () => {
  if (includedPeople.value.length < 2) {
    return;
  }

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
      <div class="pointer pointer-up"></div>
      <div class="pointer pointer-down"></div>

      <div
        ref="spinRef"
        class="spin"
        @animationend="handleAnimationEnd"
        @pointerdown="handlePointerDown"
      >
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
          @click.stop.prevent="handleClick"
          class="activator"
        >
          🌀
        </button>
      </div>
    </div>

    <div class="members">
      <div
        v-for="(person, personIdx) in people"
        :key="personIdx"
        class="member-wrapper"
      >
        <label class="member-label" :for="`person-${person.name}`">{{
          person.name
        }}</label>

        <input
          :id="`person-${person.name}`"
          :name="`person-${person.name}`"
          type="checkbox"
          :disabled="state === 'spinning'"
          v-model="includedPeople"
          :value="person.name"
        />
      </div>
    </div>
  </div>

  <div id="animate"></div>
  <div class="winner-wrapper">
    <img
      v-if="winner"
      :alt="winner.name"
      :src="winner.avatarUrl"
      class="winner"
    />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

#animate {
  margin: 0 auto;
  width: 20px;
  overflow: v-bind(animationOverFlow);
  position: relative;
}

.members {
  height: 600px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 20px;
}

.member-wrapper {
  display: flex;
  justify-content: space-between;
  font-size: large;
}

.member-label {
  cursor: pointer;
}

.wrapper {
  --pointer-height: 40px;
  --spin-wrapper-size: 600px;
  display: flex;
  justify-content: center;
  gap: 100px;
  user-select: none;
  padding-top: 16px;
}

.spin-wrapper {
  position: relative;
  width: var(--spin-wrapper-size);
  height: var(--spin-wrapper-size);
}

.spin {
  will-change: transform;
  clip-path: circle(50%);
  cursor: pointer;
  transform: rotate(v-bind(currentDeg + "deg"));
  width: 100%;
  height: 100%;
  position: relative;

  animation-duration: 7s;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.44, -0.205, 0, 1.13);
}

.spin-animation {
  animation-name: spinning;
}

.spin-simple-animation {
  animation-duration: v-bind(numberOfRounds * 2 + "s");
  animation-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
}

@keyframes spinning {
  from {
    rotate: v-bind(currentDeg + "deg");
  }
  to {
    rotate: v-bind(spinDeg + "deg");
  }
}

.pointer {
  transform: scaleX(-1);
  left: 0;
  top: 50%;
  height: 40px;
  width: 80px;
  overflow: hidden;
  position: absolute;
  transform-origin: 50% 100%;
  pointer-events: none;

  &:before {
    height: inherit;
    width: inherit;
    position: absolute;
    content: "";
    border-radius: 40px 40px 0 0;
    transform-origin: 50% 100%;
    rotate: 150deg;
    background: blueviolet;
  }
}
.pointer-up {
  transform: translate(-50%, -100%) scaleX(-1);
}

.pointer-down {
  transform: translate(-50%, -100%) scaleY(-1) scaleX(-1);
}

.activator {
  border-color: transparent;
  cursor: pointer;
  position: absolute;
  width: 40px;
  height: 40px;
  background: white;
  display: grid;
  place-content: center;
  font-size: 20px;
  text-align: center;
  z-index: 1000;
  color: inherit;

  top: 50%;
  left: 50%;
  border-radius: 99999px;
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
    background: var(--background);
  }

  rotate: var(--rotate-degree);
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
  padding-top: 120px;
  width: 100vw;
  display: grid;
  place-content: center;
}

.winner {
  border-radius: 16px;
  animation: 3s fadeInUp;
}
</style>

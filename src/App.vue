<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { decode, encode } from "./utils";
const state = ref<"idle" | "spinning" | "finished" | "manual">("idle");
const spinDeg = ref(0);
const currentDeg = ref(0);
const spinRef = ref<HTMLElement>();
const lastManualDeg = ref();
const lastCurrentDeg = ref(0);

let timer: number;
let lastTimeStamp: number;
let lastDeg = 0;
let direction: "clockwise" | "counter-clockwise" | "none" = "none";
const numberOfRounds = ref(1);
const timeThreshold = 250;

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
  if (state.value === "spinning" || state.value === "manual") return;

  lastManualDeg.value = getDegreeFromCenter(e.clientX, e.clientY);
  lastCurrentDeg.value = currentDeg.value;

  lastTimeStamp = Date.now();
  lastDeg = currentDeg.value;
  numberOfRounds.value = 1;

  const runMe = () => {
    const currentTimeStamp = Date.now();
    const diff = currentDeg.value - lastDeg;

    if (diff === 0) {
      lastTimeStamp = currentTimeStamp;
      numberOfRounds.value = 1;
      direction = "none";
    } else {
      lastDeg = currentDeg.value;
      lastTimeStamp = currentTimeStamp;
    }
  };

  timer = setInterval(runMe, timeThreshold);
};

window.addEventListener("pointerup", () => {
  if (state.value === "spinning" || state.value === "manual") return;
  const degDiff = currentDeg.value - lastCurrentDeg.value;
  const timeDiff = (Date.now() - lastTimeStamp) / timeThreshold;
  const hasSpun = currentDeg.value - lastDeg !== 0;

  clearInterval(timer);
  lastManualDeg.value = undefined;

  if (hasSpun) {
    spinDeg.value =
      currentDeg.value +
      360 * (degDiff / 360) * timeDiff * numberOfRounds.value * 4;

    spinDeg.value =
      direction === "clockwise"
        ? Math.abs(spinDeg.value)
        : -Math.abs(spinDeg.value);

    spinRef.value?.classList.add("spin-animation");
    spinRef.value?.classList.add("spin-simple-animation");
    state.value = "manual";
  }
});

window.addEventListener("pointermove", (e: PointerEvent) => {
  if (
    state.value === "spinning" ||
    state.value === "manual" ||
    !lastManualDeg.value
  )
    return;

  const diff = currentDeg.value - lastDeg;
  if (direction === "none" && diff !== 0) {
    direction = diff > 0 ? "clockwise" : "counter-clockwise";
  }

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
  // Check if Command or Control key is pressed with s letter
  if ((e.metaKey || e.ctrlKey) && e.key === "s") {
    e.preventDefault();

    // Update URL to include search query in URL
    const decodedState = encode({
      people: people.value,
      includedPeople: includedPeople.value,
    });

    history.replaceState(null, "", `?state=${decodedState}`);
    // Copy url to clipboard
    navigator.clipboard.writeText(window.location.href);
  }
});

const getBackgroundColor = () => {
  const first = `hsl(${Math.floor(Math.random() * 361)},100%,${Math.floor(
    Math.random() * (100 - 50) + 50,
  )}%,${Math.random()})`;
  const second = `hsl(${Math.floor(Math.random() * 361)},100%,${Math.floor(
    Math.random() * (100 - 50) + 50,
  )}%)`;

  const gradient = `linear-gradient(${first}, ${second})`;
  return gradient;
};

type Person = {
  name: string;
  avatarUrl: string;
  backgroundColor?: string;
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

const people = ref<Person[]>(initialPeople);

const winner = ref<Person>();

people.value = people.value.map(
  (item) =>
    ({
      ...item,
      backgroundColor: item.backgroundColor ?? getBackgroundColor(),
    }) satisfies Person,
);

const includedPeople = ref<string[]>(initialIncludedPeople);

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
  localStorage.setItem("items", JSON.stringify(people.value, null, 2));
});

const getStyle = (index: number) => {
  const rotate = 360 / finalPeople.value.length;
  const rotateDeg = rotate * index;
  const sliceDegree = 180 - rotate;
  return {
    "--slice-degree": `${sliceDegree}deg`,
    "--background": finalPeople.value[index].backgroundColor,
    "--rotate-degree": `${rotateDeg}deg`,
    "--rotate-content": `${-rotateDeg}deg`,
    "--text-position": "4%",
    zIndex: index,
  };
};

const showWinner = () => {
  const index = Math.floor(spinDeg.value / (360 / resultList.value.length));

  const result =
    index < 0
      ? resultList.value[resultList.value.length + index]
      : resultList.value[index];

  const winnerPerson = finalPeople.value.find(
    (person) => person.name === result,
  );
  if (winnerPerson) {
    winner.value = winnerPerson;
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

  showWinner();
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
            :disabled="state === 'spinning'"
            v-model="includedPeople"
            :value="person.name"
          />
        </div>
      </div>
    </fieldset>
  </div>

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
  cursor: pointer;
  user-select: none;
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

.spin-simple-animation {
  animation-duration: v-bind(numberOfRounds * 1.5 + "s");
  animation-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
}

@keyframes spinning {
  from {
    rotate: v-bind(currentDeg + "deg");
  }
  to {
    rotate: var(--spinning-deg);
  }
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
  background: white;
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

import lzString from "lz-string";

export const decode = (input: string) => {
  return JSON.parse(lzString.decompressFromEncodedURIComponent(input));
};

export const encode = (input: object) => {
  return lzString.compressToEncodedURIComponent(JSON.stringify(input));
};

export function createAnimation() {
  const container = document.getElementById("animate");
  const emoji = [
    "🌽",
    "🍇",
    "🍌",
    "🍒",
    "🍕",
    "🍷",
    "🍭",
    "💖",
    "💩",
    "🐷",
    "🐸",
    "🐳",
    "🎃",
    "🎾",
    "🌈",
    "🍦",
    "💁",
    "🔥",
    "😁",
    "😱",
    "🌴",
    "👏",
    "💃",
    "🤘",
    "❤️‍🔥",
    "🥳",
    "🎉",
    "🎡",
    "😇",
    "🤯",
  ];
  const circles: Array<{
    update: () => void;
  }> = [];

  for (let i = 0; i < 14; i++) {
    addCircle(
      i * 150,
      [10 + 0, 300],
      emoji[Math.floor(Math.random() * emoji.length)],
    );
    addCircle(
      i * 150,
      [10 + 0, -300],
      emoji[Math.floor(Math.random() * emoji.length)],
    );
    addCircle(
      i * 150,
      [10 - 200, -300],
      emoji[Math.floor(Math.random() * emoji.length)],
    );
    addCircle(
      i * 150,
      [10 + 200, 300],
      emoji[Math.floor(Math.random() * emoji.length)],
    );
    addCircle(
      i * 150,
      [10 - 400, -300],
      emoji[Math.floor(Math.random() * emoji.length)],
    );
    addCircle(
      i * 150,
      [10 + 400, 300],
      emoji[Math.floor(Math.random() * emoji.length)],
    );
    addCircle(
      i * 150,
      [10 - 600, -300],
      emoji[Math.floor(Math.random() * emoji.length)],
    );
    addCircle(
      i * 150,
      [10 + 600, 300],
      emoji[Math.floor(Math.random() * emoji.length)],
    );
  }

  function addCircle(delay: number, range: [number, number], emoji: string) {
    setTimeout(function () {
      const circle = makeCircle(
        range[0] + Math.random() * range[1],
        80 + Math.random() * 4,
        emoji,
        {
          x: -0.15 + Math.random() * 0.3,
          y: 1 + Math.random() * 1,
        },
        range,
      );
      circles.push(circle);
    }, delay);
  }

  function makeCircle(
    initialX: number,
    initialY: number,
    emoji: string,
    velocity: {
      x: number;
      y: number;
    },
    range: [number, number],
  ) {
    let x = initialX;
    let y = initialY;
    let element = document.createElement("span");
    element.style.opacity = "0";
    element.style.position = "absolute";
    element.style.fontSize = "26px";
    element.style.color = "hsl(" + ((Math.random() * 360) | 0) + ",80%,50%)";
    element.innerHTML = emoji;
    container?.appendChild(element);

    const update = function () {
      if (y > 800) {
        y = 80 + Math.random() * 4;
        x = range[0] + Math.random() * range[1];
      }
      y += velocity.y;
      x += velocity.x;
      element.style.opacity = "1";
      element.style.transform = "translate3d(" + x + "px, " + y + "px, 0px)";
    };

    return {
      update,
    };
  }

  function animate() {
    for (var i in circles) {
      circles[i].update();
    }
    requestAnimationFrame(animate);
  }

  animate();
}

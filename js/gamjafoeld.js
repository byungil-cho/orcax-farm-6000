// 유저 닉네임과 토큰 정보 (임시용 localStorage 또는 URL 파라미터)
const nickname = localStorage.getItem("nickname") || "감자왕";

const seedCountEl = document.getElementById("seed_count");
const fuelCountEl = document.getElementById("fuel_count");
const potatoCountEl = document.getElementById("potato_count");
const orcxCountEl = document.getElementById("orcx_count");
const tiles = document.querySelectorAll(".tile");

// UI 초기화
function initField() {
  fetch(`/farm/records/${nickname}`)
    .then(res => res.json())
    .then(data => {
      data.forEach((plot, idx) => {
        if (plot.status === "harvested") return;
        const tile = tiles[idx];
        tile.innerHTML = `<img src='/img/farm/${plot.status === "growing" ? "sprout.png" : "potato.png"}' /><div>${plot.status === "growing" ? "성장중" : "수확가능"}</div>`;
      });
    });

  fetch(`/user/${nickname}`)
    .then(res => res.json())
    .then(user => {
      const inv = user.inventory || {};
      seedCountEl.textContent = inv["seed"] || 0;
      fuelCountEl.textContent = inv["fuel"] || 0;
      potatoCountEl.textContent = inv["potato"] || 0;
      orcxCountEl.textContent = user.orcx || 0;
    });
}

// 작물 심기
function plantSeed(index) {
  fetch("/farm/plant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nickname,
      seed_item: "seed",
      seed_quantity: 1,
      output_item: "potato",
      output_quantity: 3,
      farming_time_sec: 30
    })
  }).then(() => initField());
}

// 타일 클릭 이벤트 연결
tiles.forEach((tile, idx) => {
  tile.addEventListener("click", () => {
    if (tile.textContent.includes("수확가능")) {
      fetch(`/farm/status/${nickname}`).then(() => initField());
    } else if (tile.textContent.includes("빈 밭") || tile.innerHTML === "") {
      plantSeed(idx);
    }
  });
});

function refreshStatus() {
  fetch(`/farm/status/${nickname}`).then(() => initField());
}

function goBack() {
  window.location.href = "/index.html";
}

// 실행
initField();

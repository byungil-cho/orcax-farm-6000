// 사용자 정보 불러오기
const nickname = localStorage.getItem("nickname") || "보리대장";

const barleyEl = document.getElementById("barley");
const fuelEl = document.getElementById("fuel");
const barleyTeaEl = document.getElementById("barley_tea");
const resultEl = document.getElementById("result");

function loadInventory() {
  fetch(`/user/${nickname}`)
    .then(res => res.json())
    .then(user => {
      const inv = user.inventory || {};
      barleyEl.textContent = inv["barley"] || 0;
      fuelEl.textContent = inv["fuel"] || 0;
      barleyTeaEl.textContent = inv["barley_tea"] || 0;
    });
}

function processBarley() {
  fetch("/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nickname,
      input_item: "barley",
      input_quantity: 3,
      output_item: "barley_tea",
      output_quantity: 1,
      fuel_required: 1,
      processing_time_sec: 60
    })
  })
    .then(res => res.json())
    .then(data => {
      resultEl.textContent = data.message || "가공 완료되었습니다.";
      loadInventory();
    })
    .catch(() => {
      resultEl.textContent = "가공 실패: 재료나 연료를 확인하세요.";
    });
}

function goBack() {
  window.location.href = "/index.html";
}

loadInventory();

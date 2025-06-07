// 사용자 닉네임 정보 불러오기
const nickname = localStorage.getItem("nickname") || "감자장인";

const potatoEl = document.getElementById("potato");
const fuelEl = document.getElementById("fuel");
const chipsEl = document.getElementById("chips");
const resultEl = document.getElementById("result");

function loadInventory() {
  fetch(`/user/${nickname}`)
    .then(res => res.json())
    .then(user => {
      const inv = user.inventory || {};
      potatoEl.textContent = inv["potato"] || 0;
      fuelEl.textContent = inv["fuel"] || 0;
      chipsEl.textContent = inv["chips"] || 0;
    });
}

function processPotato() {
  fetch("/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nickname,
      input_item: "potato",
      input_quantity: 5,
      output_item: "chips",
      output_quantity: 1,
      fuel_required: 1,
      processing_time_sec: 90
    })
  })
    .then(res => res.json())
    .then(data => {
      resultEl.textContent = data.message || "가공 완료! 바삭한 감자칩 생산됨.";
      loadInventory();
    })
    .catch(() => {
      resultEl.textContent = "가공 실패: 감자나 연료를 확인하세요.";
    });
}

function goBack() {
  window.location.href = "/index.html";
}

loadInventory();

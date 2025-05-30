// gamja.js — 감자 메타버스 메인 클라이언트 스크립트

function getNickname() {
  return document.getElementById("nickname")?.value || "고래";
}

function logResult(result) {
  console.log("💬 서버 응답:", result);
}

function showError(error) {
  console.error("❌ 에러:", error);
}

// 감자 수확 요청
async function harvestPotato(count = 5) {
  const nickname = getNickname();
  try {
    const res = await fetch("/api/harvest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, count })
    });
    const data = await res.json();
    logResult(data);
  } catch (e) {
    showError(e);
  }
}

// 제품 만들기
async function createProduct(type = "감자떡") {
  const farm = getNickname();
  try {
    const res = await fetch("/api/create-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, farm })
    });
    const data = await res.json();
    logResult(data);
  } catch (e) {
    showError(e);
  }
}

// 보관소 불러오기
async function loadInventory() {
  const nickname = getNickname();
  try {
    const res = await fetch(`/api/gamja?nickname=${nickname}`);
    const data = await res.json();
    const list = document.getElementById("storage-list");
    if (!data.inventory || data.inventory.length === 0) {
      list.innerHTML = "<li>❌ 감자 없음</li>";
    } else {
      list.innerHTML = data.inventory.map(x => `<li>${x.name} (${x.count})</li>`).join("");
    }
  } catch (e) {
    showError(e);
  }
}

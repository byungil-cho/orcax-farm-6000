import React, { useState } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wallet, setWallet] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(18000);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone || !wallet || quantity <= 0) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    const nft = `${quantity} x ${unitPrice.toLocaleString()} ORCX`;
    setLoading(true);
    try {
      const res = await axios.post("https://orcax-alert-core.onrender.com/order", {
        name,
        phone,
        wallet,
        quantity,
        nft
      });

      if (res.data.success) {
        alert("✅ 주문 접수 완료!");
        setName("");
        setPhone("");
        setWallet("");
        setQuantity(1);
        setUnitPrice(18000);
      } else {
        alert("❌ 실패: " + res.data.error);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ 네트워크 또는 서버 오류!");
    } finally {
      setLoading(false);
    }
  };

  const bonus = Math.floor(quantity / 10);
  const total = quantity * unitPrice;

  return (
    <div style={{ padding: "2rem", background: "#111", color: "#00e0c7", fontFamily: "Arial" }}>
      <h2>OrcaX NFT 쿠폰 주문</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>이름</label><br />
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>전화번호</label><br />
        <input value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>팬텀 지갑 주소</label><br />
        <input value={wallet} onChange={e => setWallet(e.target.value)} />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>쿠폰 종류</label><br />
        <select value={unitPrice} onChange={e => setUnitPrice(parseInt(e.target.value))}>
          <option value={18000}>18000 ORCX (11시 이전)</option>
          <option value={20000}>20000 ORCX (11시~14시)</option>
          <option value={25000}>25000 ORCX (14시 이후)</option>
        </select>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>수량</label><br />
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={e => setQuantity(parseInt(e.target.value))}
        />
      </div>
      <div style={{ margin: "1rem 0" }}>
        <strong>총액:</strong> {total.toLocaleString()} ORCX<br />
        <strong>보너스:</strong> {bonus}장<br />
        <strong>총 NFT 수령 수량:</strong> {quantity + bonus}장
      </div>
      <button
        onClick={handleSubmit}
        style={{ padding: "0.7rem 2rem", fontSize: "1rem", backgroundColor: "#00ffc3", border: "none", borderRadius: "1rem", cursor: "pointer" }}
        disabled={loading}
      >
        {loading ? "처리 중..." : "🛒 주문 제출"}
      </button>
    </div>
  );
}

export default App;

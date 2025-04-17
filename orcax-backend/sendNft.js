const { ethers } = require("ethers");
const abi = require("./abi/erc1155.json");
require("dotenv").config();

// 환경 변수 가져오기
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;

// 전송 실행 함수
async function sendNft(wallet, tokenId, qty) {
  try {
    if (!wallet || !tokenId || !qty) {
      throw new Error("❌ 지갑 주소, 토큰 ID, 수량을 모두 입력해야 합니다.");
    }

    // 프로바이더 및 지갑 설정
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const walletSigner = new ethers.Wallet(PRIVATE_KEY, provider);

    // 컨트랙트 인스턴스
    const nftContract = new ethers.Contract(CONTRACT_ADDRESS, abi, walletSigner);

    const from = await walletSigner.getAddress();

    console.log(`🚀 ${from} → ${wallet} 로 NFT 전송 시작...`);
    const tx = await nftContract.safeTransferFrom(
      from,
      wallet,
      tokenId,
      qty,
      "0x"
    );

    console.log("📦 트랜잭션 전송됨:", tx.hash);
    await tx.wait();
    console.log("✅ NFT 전송 완료!");

    return { success: true, hash: tx.hash };

  } catch (error) {
    console.error("❌ 전송 중 오류 발생:", error.message);
    return { success: false, error: error.message };
  }
}

// API 경로에서 사용하기 위한 express 핸들러
const express = require("express");
const router = express.Router();

router.post("/api/send-nft", async (req, res) => {
  const { wallet, tokenId, qty } = req.body;
  const result = await sendNft(wallet, tokenId, qty);

  if (result.success) {
    res.json({ message: "NFT 전송 완료", txHash: result.hash });
  } else {
    res.status(500).json({ error: result.error });
  }
});

module.exports = router;

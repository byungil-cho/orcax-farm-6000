import { getNickname } from './gamja-utils.js';

export async function fetchFarmStatus() {
  const nickname = getNickname();
  const res = await fetch(`/api/farm/status/${nickname}`);
  return await res.json();
}

export async function useFreeFarm() {
  const nickname = getNickname();
  const res = await fetch('/api/farm/useFree', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname })
  });
  return await res.json();
}

export async function useSeedFarm() {
  const nickname = getNickname();
  const res = await fetch('/api/farm/useSeed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname })
  });
  return await res.json();
}

export async function buySeedAndFarm(quantity = 1) {
  const nickname = getNickname();
  const res = await fetch('/api/farm/buySeed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, quantity })
  });
  return await res.json();
}

export async function processPotato(productName) {
  const nickname = getNickname();
  const res = await fetch('/api/factory/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, productName })
  });
  return await res.json();
}

export async function getProductList() {
  const nickname = getNickname();
  const res = await fetch(`/api/factory/products/${nickname}`);
  return await res.json();
}

export async function registerProduct(productId) {
  const nickname = getNickname();
  const res = await fetch('/api/market/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, nickname })
  });
  return await res.json();
}

export async function getLogs() {
  const nickname = getNickname();
  const res = await fetch(`/api/logs/${nickname}`);
  return await res.json();
}

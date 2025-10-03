import React, { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';

const PIOLockABI = [
  "function lock(uint256 amount, address destination) returns (bytes32)",
  "function approveLock(bytes32 lockId)",
  "function pioToken() view returns (address)",
  "event Locked(bytes32 indexed lockId, address indexed sender, address indexed destination, uint256 amount, uint256 destChainId, uint256 timestamp)"
];

const ERC20ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const PIOMintABI = [
  "function approveMint(bytes32 lockId, address to, uint256 amount)",
  "function balanceOf(address) view returns (uint256)",
  "event Minted(bytes32 indexed lockId, address indexed to, uint256 amount)"
];

export default function Bridge({ lockAddress, mintAddress }) {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState();
  const [amount, setAmount] = useState("");
  const [dest, setDest] = useState("");
  const [lockId, setLockId] = useState("");
  const [status, setStatus] = useState("");

  const lock = useMemo(() => {
    if (!signer || !lockAddress) return null;
    return new ethers.Contract(lockAddress, PIOLockABI, signer);
  }, [signer, lockAddress]);

  const mint = useMemo(() => {
    if (!signer || !mintAddress) return null;
    return new ethers.Contract(mintAddress, PIOMintABI, signer);
  }, [signer, mintAddress]);

  useEffect(() => {
    if (!window.ethereum) return;
    const prov = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(prov);
  }, []);

  const connect = async () => {
    if (!provider) return;
    await provider.send('eth_requestAccounts', []);
    const s = provider.getSigner();
    setSigner(s);
    setAccount(await s.getAddress());
  };

  const doLock = async () => {
    if (!lock) return;
    const tokenAddr = await lock.pioToken();
    const token = new ethers.Contract(tokenAddr, ERC20ABI, signer);
    const decimals = await token.decimals();
    const amt = ethers.utils.parseUnits(amount || "0", decimals);
    setStatus('Approving...');
    await (await token.approve(lock.address, amt)).wait();
    setStatus('Locking...');
    const tx = await lock.lock(amt, dest);
    const rc = await tx.wait();
    const ev = rc.events.find(e => e.event === 'Locked');
    const id = ev.args.lockId;
    setLockId(id);
    setStatus(`Locked: ${id}`);
  };

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>PIO → wPIO Bridge</h2>
      {!account ? <button onClick={connect}>Kết nối ví</button> : <div>Tài khoản: {account}</div>}
      <div style={{ marginTop: 16 }}>
        <input placeholder="Số lượng PIO" value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <input placeholder="Địa chỉ nhận trên Goerli" value={dest} onChange={e => setDest(e.target.value)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={doLock} disabled={!amount || !dest}>Lock</button>
      </div>
      {lockId && <div style={{ marginTop: 12 }}>LockID: {lockId}</div>}
      <div style={{ marginTop: 12, color: '#555' }}>{status}</div>
    </div>
  );
}



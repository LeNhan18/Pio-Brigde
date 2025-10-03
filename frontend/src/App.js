import React from 'react';
import Bridge from './Bridge';

// Điền địa chỉ sau khi deploy thật
const LOCK_ADDRESS = process.env.REACT_APP_LOCK_ADDRESS || '';
const MINT_ADDRESS = process.env.REACT_APP_MINT_ADDRESS || '';

export default function App() {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>PIO Bridge</h1>
      <Bridge lockAddress={LOCK_ADDRESS} mintAddress={MINT_ADDRESS} />
    </div>
  );
}



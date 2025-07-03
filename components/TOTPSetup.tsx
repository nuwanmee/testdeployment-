// components/TOTPSetup.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

export function TOTPSetup() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1); // 1: Show QR, 2: Verify, 3: Success
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleSetup = async () => {
    const res = await fetch('/api/totp/setup');
    const data = await res.json();
    if (data.qrCode) {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep(2);
    }
  };

  const handleVerify = async () => {
    const res = await fetch('/api/totp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (data.success) {
      setBackupCodes(data.backupCodes);
      setStep(3);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {step === 1 && (
        <button 
          onClick={handleSetup}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Set Up Two-Factor Authentication
        </button>
      )}

      {step === 2 && qrCode && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Scan QR Code</h2>
          <Image 
            src={qrCode} 
            alt="TOTP QR Code" 
            width={200} 
            height={200} 
          />
          <p>Or enter this secret manually: <code>{secret}</code></p>
          
          <div className="mt-4">
            <label className="block mb-2">Enter 6-digit code from app:</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="border p-2 w-full"
              maxLength={6}
            />
            <button
              onClick={handleVerify}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
            >
              Verify & Enable
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-green-600">Success!</h2>
          <p>Two-factor authentication is now enabled.</p>
          
          <div className="bg-yellow-50 p-4 rounded">
            <h3 className="font-bold mb-2">Backup Codes</h3>
            <ul className="grid grid-cols-2 gap-2 font-mono">
              {backupCodes.map((code, i) => (
                <li key={i}>{code}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
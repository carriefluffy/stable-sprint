import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useProfile } from '../hooks/useProfile';
import { Panel, StatCard } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { StatusLight } from '../components/StatusLight';

interface ProfileForm {
  username: string;
  twitter: string;
  farcaster: string;
}

interface FormErrors {
  username?: string;
  twitter?: string;
  farcaster?: string;
}

const validateTwitter = (v: string) =>
  v && !/^[a-zA-Z0-9_]{1,15}$/.test(v.trim()) ? 'Use 1–15 letters, numbers, or underscores.' : undefined;
const validateFarcaster = (v: string) =>
  v && !/^[a-zA-Z0-9_.-]{1,20}$/.test(v.trim()) ? 'Use 1–20 letters, numbers, dots, dashes, or underscores.' : undefined;

interface FieldProps {
  name: keyof ProfileForm;
  label: string;
  value: string;
  helper?: string;
  error?: string;
  placeholder?: string;
  prefix?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Field: React.FC<FieldProps> = ({
  name,
  label,
  value,
  helper,
  error,
  placeholder,
  prefix,
  onChange,
}) => (
  <div>
    <label htmlFor={name} className="tech-label text-white/65 block mb-2" style={{ fontSize: '13px' }}>
      {label}
    </label>
    <div className="relative">
      {prefix && (
        <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-arcade" style={{ fontSize: '17px' }}>
          {prefix}
        </span>
      )}
      <input
        id={name}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="sega-input"
        style={prefix ? { paddingLeft: '2.25rem' } : undefined}
      />
    </div>
    {helper && !error && (
      <p className="tech-label text-white/45 mt-1.5" style={{ fontSize: '13px' }}>{helper}</p>
    )}
    {error && (
      <p id={`${name}-error`} className="tech-label text-danger mt-1.5" style={{ fontSize: '13px' }} role="alert">
        ✕ {error}
      </p>
    )}
  </div>
);

export const Profile: React.FC = () => {
  const { address, isConnected, connect, isMiniPayWallet } = useWallet();
  const profile = useProfile();

  const [formData, setFormData] = useState<ProfileForm>({
    username: profile.username ?? '',
    twitter: profile.twitter ?? '',
    farcaster: profile.farcaster ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus('idle');
    if (name === 'twitter') setErrors((p) => ({ ...p, twitter: validateTwitter(value) }));
    if (name === 'farcaster') setErrors((p) => ({ ...p, farcaster: validateFarcaster(value) }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connect();
      return;
    }
    const twitterErr = validateTwitter(formData.twitter);
    const farcasterErr = validateFarcaster(formData.farcaster);
    setErrors({ twitter: twitterErr, farcaster: farcasterErr });
    if (twitterErr || farcasterErr) {
      setStatus('error');
      return;
    }
    setStatus('saving');
    try {
      profile.updateProfile(formData);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2400);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center py-10 px-4 max-w-xl mx-auto w-full">
      <header className="text-center mb-8 w-full">
        <div className="machine-label machine-label--yellow mb-3" style={{ display: 'inline-block' }}>PLAYER&nbsp;CARD</div>
        <h1 className="pixel-title mb-3" style={{ fontSize: '35px' }}>Player&nbsp;profile</h1>
        <p className="text-white/65 mx-auto" style={{ fontSize: '17px', lineHeight: 1.35, maxWidth: '44ch' }}>
          Manage your credentials, link your web3 socials, and verify your on-chain standing.
        </p>
      </header>

      {/* Player card — summary header */}
      <Panel variant="featured" className="w-full mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Alias" value={formData.username || '—'} />
          <StatCard
            label="Wallet state"
            value={isConnected ? <Badge status="verified" label="Connected" /> : <Badge status="soon" label="Offline" />}
          />
          <StatCard label="Top score" value="—" hint="Submit a run" />
          <StatCard label="Best rank" value="—" hint="Unranked" />
        </div>
      </Panel>

      {/* Wallet connection panel */}
      <section className="w-full mb-6" aria-label="Wallet connection">
        <h2 className="tech-label text-white/45 mb-3" style={{ fontSize: '13px' }}>Wallet</h2>
        <Panel variant={isConnected ? 'default' : 'locked'}>
          {isConnected && address ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <StatusLight kind="live" label={isMiniPayWallet ? 'Minipay' : 'Injected'} hideLabel />
                <div>
                  <div className="tech-value text-cream font-bold" style={{ fontSize: '15px' }}>
                    {address.slice(0, 6)}…{address.slice(-4)}
                  </div>
                  <div className="tech-label text-success" style={{ fontSize: '13px' }}>
                    Connected via {isMiniPayWallet ? 'MiniPay' : 'injected wallet'}
                  </div>
                </div>
              </div>
              <Badge status="verified" label="Verified" />
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-3">
              <StatusLight kind="soon" label="No wallet connected" />
              <p className="text-white/70" style={{ fontSize: '15px', lineHeight: 1.3, maxWidth: '40ch' }}>
                Connect your wallet to save scores on-chain and register your arcade player.
              </p>
              <Button onClick={connect}>{isMiniPayWallet ? 'Reconnect' : 'Connect wallet'}</Button>
            </div>
          )}
        </Panel>
      </section>

      {/* Social registry form */}
      <section className="w-full">
        <h2 className="tech-label text-white/45 mb-3" style={{ fontSize: '13px' }}>Social registry</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <Panel>
            <div className="flex flex-col gap-5">
              <Field
                name="username"
                label="Arcade alias"
                value={formData.username}
                placeholder="e.g. Satoshi"
                helper="Shown beside your scores on the leaderboard."
                error={errors.username}
                onChange={handleChange}
              />
              <Field
                name="twitter"
                label="X (Twitter)"
                value={formData.twitter}
                placeholder="username"
                prefix="@"
                helper="Link your X account so the leaderboard can verify you off-chain."
                error={errors.twitter}
                onChange={handleChange}
              />
              <Field
                name="farcaster"
                label="Farcaster"
                value={formData.farcaster}
                placeholder="username"
                prefix="@"
                helper="Link your Farcaster identity for cross-client socials."
                error={errors.farcaster}
                onChange={handleChange}
              />
            </div>
          </Panel>

          {/* Save-state alerts */}
          {status === 'error' && (
            <Panel variant="locked" role="alert" className="flex items-start gap-3">
              <span aria-hidden="true" className="text-danger font-bold" style={{ fontSize: '17px' }}>✕</span>
              <div>
                <p className="tech-label font-bold text-danger mb-1" style={{ fontSize: '13px' }}>Profile not saved</p>
                <p className="text-white/70" style={{ fontSize: '15px', lineHeight: 1.3 }}>Fix the form errors above and try again.</p>
              </div>
            </Panel>
          )}
          {status === 'saved' && (
            <Panel role="status" className="flex items-start gap-3">
              <span aria-hidden="true" className="text-success font-bold" style={{ fontSize: '17px' }}>✓</span>
              <div>
                <p className="tech-label font-bold text-success mb-1" style={{ fontSize: '13px' }}>Registry secured</p>
                <p className="text-white/70" style={{ fontSize: '15px', lineHeight: 1.3 }}>Your arcade profile was saved.</p>
              </div>
            </Panel>
          )}

          <Button
            type="submit"
            loading={status === 'saving'}
            fullWidth
            variant={status === 'saved' ? 'secondary' : 'primary'}
          >
            {status === 'saving' ? '' : status === 'saved' ? '✓ Registry secured' : !isConnected ? 'Connect & save profile' : 'Save profile'}
          </Button>
        </form>
      </section>
    </div>
  );
};

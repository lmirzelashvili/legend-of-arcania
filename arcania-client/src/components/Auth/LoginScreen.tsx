import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI } from '@/services/api.service';
import { useSoundEffects, useBackgroundMusic, startBackgroundMusic } from '@/hooks/useSoundEffects';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const { playClick, playSuccess, playError } = useSoundEffects();
  const { isPlaying, toggleMusic } = useBackgroundMusic();
  const musicStartedRef = useRef(false);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Start background music on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!musicStartedRef.current) {
        musicStartedRef.current = true;
        startBackgroundMusic();
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      }
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    playClick();

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(formData.email, formData.password);
      } else {
        response = await authAPI.register(
          formData.email,
          formData.username,
          formData.password
        );
      }

      playSuccess();
      setToken(response.token);
      setUser(response.user);
      navigate('/character-select');
    } catch (err: any) {
      playError();
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black font-pixel"
    >

      {/* Scanline Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      ></div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Modal Border */}
        <div className="absolute inset-0 border border-white/[0.08]"></div>
        <div className="absolute inset-[1px] bg-black"></div>

        {/* Content */}
        <div className="relative p-8">
          {/* Title Section */}
          <div className="text-center mb-8">
            {/* Main Title */}
            <div className="relative mb-6">
              <div className="text-amber-500 text-2xl tracking-wider mb-2" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
                ARCANIA
              </div>
              <div className="text-amber-400/60 text-[8px] tracking-[0.3em]">
                LEGENDS AWAIT
              </div>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-[2px] w-16 bg-gradient-to-r from-transparent to-amber-600"></div>
              <div className="text-amber-500 text-xs">◆</div>
              <div className="h-[2px] w-16 bg-gradient-to-l from-transparent to-amber-600"></div>
            </div>

            {/* Subtitle */}
            <div className="text-gray-500 text-[8px] tracking-widest">
              {isLogin ? 'ENTER THE REALM' : 'CREATE YOUR LEGEND'}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600" style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 2px, 2px 2px, 2px calc(100% - 2px), 100% calc(100% - 2px), 100% 100%, 0 100%, 0 calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 2px, 0 2px)'
              }}></div>
              <div className="absolute inset-[2px] bg-red-950"></div>
              <div className="relative px-4 py-3">
                <p className="text-red-400 text-[8px]">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-[8px] mb-2 text-amber-500 tracking-widest">
                EMAIL
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600" style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 2px, 2px 2px, 2px calc(100% - 2px), 100% calc(100% - 2px), 100% 100%, 0 100%, 0 calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 2px, 0 2px)'
                }}></div>
                <div className="absolute inset-[2px] bg-gray-950/[0.98]"></div>
                <input
                  type="email"
                  className="relative w-full bg-transparent px-4 py-3 text-white text-[10px] focus:outline-none placeholder-gray-600 font-pixel"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Username Field (Register Only) */}
            {!isLogin && (
              <div className="animate-pulse-once">
                <label className="block text-[8px] mb-2 text-amber-500 tracking-widest">
                  USERNAME
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600" style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 2px, 2px 2px, 2px calc(100% - 2px), 100% calc(100% - 2px), 100% 100%, 0 100%, 0 calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 2px, 0 2px)'
                  }}></div>
                  <div className="absolute inset-[2px] bg-gray-950/[0.98]"></div>
                  <input
                    type="text"
                    className="relative w-full bg-transparent px-4 py-3 text-white text-[10px] focus:outline-none placeholder-gray-600 font-pixel"
                    placeholder="Choose your name"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-[8px] mb-2 text-amber-500 tracking-widest">
                PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600" style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 2px, 2px 2px, 2px calc(100% - 2px), 100% calc(100% - 2px), 100% 100%, 0 100%, 0 calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 2px, 0 2px)'
                }}></div>
                <div className="absolute inset-[2px] bg-gray-950/[0.98]"></div>
                <input
                  type="password"
                  className="relative w-full bg-transparent px-4 py-3 text-white text-[10px] focus:outline-none placeholder-gray-600 font-pixel"
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="relative w-full mt-8 group"
              disabled={loading}
            >
              <div className={`absolute inset-0 ${loading ? 'bg-gray-700' : 'bg-gradient-to-b from-amber-600 to-amber-700 group-hover:from-amber-500 group-hover:to-amber-600'} transition-colors`} style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 3px, 3px 3px, 3px calc(100% - 3px), 100% calc(100% - 3px), 100% 100%, 0 100%, 0 calc(100% - 3px), calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) 3px, 0 3px)'
              }}></div>
              <div className={`absolute inset-[3px] ${loading ? 'bg-gray-900' : 'bg-gradient-to-b from-amber-950 to-black'}`}></div>
              <div className={`relative py-4 text-[10px] ${loading ? 'text-gray-500' : 'text-amber-400 group-hover:text-amber-300'} transition-colors tracking-widest`}>
                {loading ? 'LOADING...' : isLogin ? '► ENTER NEXUS' : '► CREATE HERO'}
              </div>
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                playClick();
                setIsLogin(!isLogin);
              }}
              className="text-[8px] text-gray-500 hover:text-amber-500 transition-colors tracking-wider"
            >
              {isLogin
                ? 'NEW ADVENTURER? CREATE ACCOUNT'
                : '← ALREADY HAVE AN ACCOUNT?'}
            </button>
          </div>

          {/* Back to Landing */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                playClick();
                navigate('/');
              }}
              className="text-[8px] text-gray-600 hover:text-gray-400 transition-colors tracking-wider"
            >
              ← BACK TO MAIN
            </button>
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-4 left-4 text-amber-600/30 text-[10px]">◆</div>
          <div className="absolute top-4 right-4 text-amber-600/30 text-[10px]">◆</div>
          <div className="absolute bottom-4 left-4 text-amber-600/30 text-[10px]">◆</div>
          <div className="absolute bottom-4 right-4 text-amber-600/30 text-[10px]">◆</div>
        </div>
      </div>

      {/* Vignette Effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.8) 100%)',
        }}
      ></div>

      {/* Music Toggle */}
      <button
        onClick={() => {
          playClick();
          toggleMusic();
        }}
        className="absolute bottom-4 left-4 z-10 text-[8px] text-white/70 hover:text-amber-400 transition-colors flex items-center gap-2"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
      >
        <span className="text-lg">{isPlaying ? '♪' : '♪̸'}</span>
        <span className="tracking-wider">{isPlaying ? 'MUSIC ON' : 'MUSIC OFF'}</span>
      </button>

      {/* Version Tag */}
      <div
        className="absolute bottom-4 right-4 text-[6px] text-white/50 tracking-widest z-10"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
      >
        v0.1.0 ALPHA
      </div>
    </div>
  );
};

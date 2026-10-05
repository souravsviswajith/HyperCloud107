import { describe, expect, it } from 'vitest';
import { DefaultPlatformBindingResolver } from '../../src/platform/bindings';

describe('Terminal107 platform binding resolver', () => {
  const resolver = new DefaultPlatformBindingResolver();

  it('prefers AVF VM on Android when available', () => {
    const binding = resolver.resolve({
      platform: 'android' as NodeJS.Platform,
      env: { ANDROID_ROOT: '/system', TERMINAL107_AVF_VM: '1' }
    });

    expect(binding.id).toBe('android-avf-vm');
  });

  it('falls back to Termux on Android', () => {
    const binding = resolver.resolve({
      platform: 'android' as NodeJS.Platform,
      env: { TERMUX_VERSION: '0.118' }
    });

    expect(binding.id).toBe('termux');
  });

  it('falls back to Android shell', () => {
    const binding = resolver.resolve({
      platform: 'android' as NodeJS.Platform,
      env: { ANDROID_ROOT: '/system' }
    });

    expect(binding.id).toBe('android-shell');
  });

  it('does not select Termux on ordinary Linux', () => {
    const binding = resolver.resolve({ platform: 'linux', env: {} });
    expect(binding.id).toBe('linux-posix');
  });
});

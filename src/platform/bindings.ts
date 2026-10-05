export type PlatformBindingId =
  | 'android-avf-vm'
  | 'termux'
  | 'android-shell'
  | 'linux-posix'
  | 'wsl'
  | 'windows-native'
  | 'macos-native';

export interface PlatformBinding {
  id: PlatformBindingId;
  platform: 'android' | 'linux' | 'windows' | 'macos';
  isolation: 'vm' | 'userspace' | 'os-process';
  priority: number;
  capabilities: readonly string[];
}

export interface PlatformBindingEnvironment {
  platform: NodeJS.Platform;
  env?: Record<string, string | undefined>;
  files?: ReadonlySet<string>;
}

export interface PlatformBindingResolver {
  resolve(environment?: PlatformBindingEnvironment): PlatformBinding;
  list(environment?: PlatformBindingEnvironment): PlatformBinding[];
}

const bindings: readonly PlatformBinding[] = [
  { id: 'android-avf-vm', platform: 'android', isolation: 'vm', priority: 100, capabilities: ['linux', 'vm-isolation'] },
  { id: 'termux', platform: 'android', isolation: 'userspace', priority: 80, capabilities: ['linux', 'userspace'] },
  { id: 'android-shell', platform: 'android', isolation: 'os-process', priority: 40, capabilities: ['android-shell'] },
  { id: 'linux-posix', platform: 'linux', isolation: 'os-process', priority: 70, capabilities: ['linux', 'posix'] },
  { id: 'wsl', platform: 'windows', isolation: 'vm', priority: 70, capabilities: ['linux', 'wsl'] },
  { id: 'windows-native', platform: 'windows', isolation: 'os-process', priority: 60, capabilities: ['windows'] },
  { id: 'macos-native', platform: 'macos', isolation: 'os-process', priority: 60, capabilities: ['macos', 'posix'] }
];

function isAndroid(env: PlatformBindingEnvironment): boolean {
  return env.platform === 'android' || env.env?.ANDROID_ROOT !== undefined || env.env?.TERMUX_VERSION !== undefined;
}

function hasTermux(env: PlatformBindingEnvironment): boolean {
  return env.env?.TERMUX_VERSION !== undefined || env.env?.PREFIX?.includes('/com.termux/') === true;
}

function hasAvf(env: PlatformBindingEnvironment): boolean {
  return env.env?.TERMINAL107_AVF_VM === '1';
}

function available(binding: PlatformBinding, env: PlatformBindingEnvironment): boolean {
  if (binding.id === 'android-avf-vm') return isAndroid(env) && hasAvf(env);
  if (binding.id === 'termux') return isAndroid(env) && hasTermux(env);
  if (binding.id === 'android-shell') return isAndroid(env);
  if (binding.id === 'wsl') return env.platform === 'win32' && env.env?.WSL_DISTRO_NAME !== undefined;
  if (binding.id === 'linux-posix') return env.platform === 'linux';
  if (binding.id === 'windows-native') return env.platform === 'win32';
  if (binding.id === 'macos-native') return env.platform === 'darwin';
  return false;
}

export class DefaultPlatformBindingResolver implements PlatformBindingResolver {
  list(environment: PlatformBindingEnvironment = { platform: process.platform, env: process.env }): PlatformBinding[] {
    return bindings.filter((binding) => available(binding, environment)).sort((a, b) => b.priority - a.priority);
  }

  resolve(environment: PlatformBindingEnvironment = { platform: process.platform, env: process.env }): PlatformBinding {
    const selected = this.list(environment)[0];
    if (!selected) {
      throw new Error(`No supported Terminal107 platform binding for ${environment.platform}`);
    }
    return selected;
  }
}

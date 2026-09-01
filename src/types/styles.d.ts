declare module '*.css';

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module '*.svg' {
  import type { ComponentType } from 'react';
  import type { SvgProps } from 'react-native-svg';

  const SvgComponent: ComponentType<SvgProps>;
  export default SvgComponent;
}

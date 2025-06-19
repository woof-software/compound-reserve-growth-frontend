declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_LOCAL_DOMAIN_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

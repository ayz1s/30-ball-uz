export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        colorScheme?: "light" | "dark";
        onEvent?: (event: string, handler: () => void) => void;
        offEvent?: (event: string, handler: () => void) => void;
        ready?: () => void;
        expand?: () => void;
        BackButton?: {
          show: () => void;
          hide: () => void;
          onClick: (handler: () => void) => void;
          offClick: (handler: () => void) => void;
        };
      };
    };
  }
}

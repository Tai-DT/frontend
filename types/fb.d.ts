interface FacebookInitOptions {
  appId?: string;
  version?: string;
  cookie?: boolean;
  status?: boolean;
  xfbml?: boolean;
  autoLogAppEvents?: boolean;
}

interface Window {
  FB?: {
    init: (options: FacebookInitOptions) => void;
    XFBML: {
      parse: (element?: HTMLElement | null) => void;
    };
    CustomerChat?: {
      show: (shouldShowDialog?: boolean) => void;
      hide: () => void;
      showDialog: () => void;
      hideDialog: () => void;
    };
  };
}

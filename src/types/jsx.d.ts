// Custom-element JSX augmentation. `<model-viewer>` is a web component loaded
// from @google/model-viewer; React doesn't know its props, so declare them as
// permissive HTML attributes here.

import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          "camera-controls"?: boolean;
          "auto-rotate"?: boolean;
          poster?: string;
          ar?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

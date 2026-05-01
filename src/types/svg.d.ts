declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.wasm' {
  const value: WebAssembly.Module;
  export default value;
}

declare module '*.json' {
  const value: any;
  export default value;
}

declare module 'upng-js' {
  interface UPNGImage {
    width: number;
    height: number;
    data: Uint8Array;
    depth: number;
    ctype: number;
    tabs: Record<string, any>;
    frames: any[];
  }

  const UPNG: {
    decode(data: Uint8Array | ArrayBuffer): UPNGImage;
    toRGBA8(img: UPNGImage): ArrayBuffer[];
    encode(bufs: Array<Uint8Array | ArrayBuffer>, w: number, h: number, cnum: number): Uint8Array;
  };

  export default UPNG;
}
const runtimeUrl = new URL('../vendor/dotlottie/0.9.17/index.js', import.meta.url);
const wasmUrl = new URL('../vendor/dotlottie/0.9.17/dotlottie-player.wasm', import.meta.url);

let runtimePromise;
let wasmPreloadPromise;

export const loadDotLottie = () => {
  runtimePromise ??= import(runtimeUrl.href)
    .then(async (runtime) => {
      runtime.setWasmUrl(wasmUrl.href);
      await customElements.whenDefined('dotlottie-wc');
      return runtime;
    })
    .catch((error) => {
      runtimePromise = undefined;
      throw error;
    });

  return runtimePromise;
};

export const prewarmDotLottie = () => {
  wasmPreloadPromise ??= fetch(wasmUrl.href, { cache: 'force-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`Unable to preload dotLottie WASM: ${response.status}`);
      return response.arrayBuffer();
    })
    .then(() => undefined)
    .catch((error) => {
      wasmPreloadPromise = undefined;
      throw error;
    });

  return Promise.all([loadDotLottie(), wasmPreloadPromise]);
};

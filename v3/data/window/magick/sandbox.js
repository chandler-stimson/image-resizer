window.onmessage = async e => {
  const request = e.data;

  if (request.method === 'convert') {
    const script = await fetch('magick.js').then(r => r.text());
    const wasm = await fetch('magick.wasm').then(r => r.blob()).then(blob => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    });
    const href = URL.createObjectURL(new Blob([script.replace('magick.wasm', wasm)], {
      type: 'application/javascript'
    }));
    const worker = new Worker(href);
    worker.onmessage = e => {
      top.postMessage(e.data, '*');
    };
    request.args = request.args.map(String);
    worker.postMessage(request);
  }
};

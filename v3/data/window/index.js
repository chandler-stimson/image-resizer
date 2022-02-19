const files = [];

const value = (id, mandatory = false) => {
  let v = document.getElementById(id).value.trim();
  if (v.endsWith('%') === false) {
    v = parseInt(v);
  }
  if (mandatory && isNaN(parseInt(v))) {
    throw Error(`"${id}" is mandatory`);
  }
  return v;
};

const convert = (file, args) => new Promise(resolve => {
  args = [...args];
  // input files
  const pre = (Math.random() + 1).toString(36).substring(7) + '-';
  const fname = pre + file.name;
  args.unshift(fname);

  const frame = document.createElement('iframe');
  frame.src = 'magick/sandbox.html';
  window.onmessage = ({data}) => {
    frame.remove();
    if (data.stderr && data.stderr.length) {
      alert(data.stderr.join('\n'));
    }
    else if (data.outputFiles.length === 0) {
      alert('There is no output file');
    }
    else {
      for (const file of data.outputFiles) {
        const a = document.createElement('a');
        a.download = file.name.replace(pre, '').replace('-output.', '.');

        const extension = file.name.slice((file.name.lastIndexOf('.') - 1 >>> 0) + 2) || 'png';
        const mime = extension === 'pdf' ? 'application/pdf' : 'image/' + extension;

        const blob = new Blob([file.buffer], {
          type: mime
        });
        const href = URL.createObjectURL(blob);
        a.href = href;
        a.click();
        URL.revokeObjectURL(href);
      }
    }
    resolve();
  };
  frame.onload = async () => {
    const job = {
      method: 'convert',
      files: [],
      args,
      requestNumber: 1
    };

    const ab = file instanceof File ? await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsArrayBuffer(file);
    }) : await fetch(file).then(r => r.arrayBuffer());

    job.files.push({
      content: new Uint8Array(ab),
      name: fname
    });
    frame.contentWindow.postMessage(job, '*');
  };
  document.body.appendChild(frame);
});

document.getElementById('convert').onclick = async e => {
  const args = [];

  if (document.getElementById('resize').checked) {
    args.push('-resize');

    const width = value('resize-width', true);
    const height = value('resize-height');

    if (height) {
      args.push(width + 'x' + height);
    }
    else {
      args.push(width);
    }
  }
  if (document.getElementById('crop').checked) {
    const width = value('crop-width', true);
    const height = value('crop-height', true);
    const x = value('crop-x', true);
    const y = value('crop-y', true);

    // (width)x(height)+(x)+y
    args.push('-crop');
    args.push(`${width}x${height}${x >= 0 ? '+' + x : x}${y >= 0 ? '+' + y : y}`);
  }
  if (document.getElementById('flip-vertically').checked) {
    args.push('-flip');
  }
  if (document.getElementById('flip-horizonally').checked) {
    args.push('-flop');
  }
  if (document.getElementById('flip-transpose').checked) {
    args.push('-transpose');
  }
  if (document.getElementById('flip-transverse').checked) {
    args.push('-transverse');
  }
  if (value('rotate')) {
    args.push('-rotate');
    args.push(value('rotate'));
  }
  if (document.getElementById('remove').checked) {
    args.push('-fuzz', document.getElementById('background-fuzz').value + '%');
    args.push('-transparent', document.getElementById('remove-color').value);
  }
  if (document.getElementById('extent').checked) {
    if (document.getElementById('background').checked) {
      args.push('-background', document.getElementById('background-color').value);
    }

    const width = value('canvas-width');
    const height = value('canvas-height');
    if (width && height) {
      args.push('-gravity', document.getElementById('gravity').value.toLowerCase());
      args.push('-extent', `${width}x${height}`);
    }
    else if (width) {
      args.push('-gravity', document.getElementById('gravity').value.toLowerCase());
      args.push('-extent', width);
    }
  }
  // density
  if (document.getElementById('density').value) {
    args.push('-density', value('density'));
  }
  // resample
  if (document.getElementById('resample').value) {
    args.push('-resample', value('resample'));
  }
  // color management
  if (document.getElementById('color-management').value) {
    args.push(...document.getElementById('color-management').value.split(' '));
  }

  if (args.length) {
    // output files
    const format = document.getElementById('format').value;
    // http://www.imagemagick.org/script/escape.php
    args.push('-set', 'filename:f', '%t');
    args.push('-set', 'filename:e', '%e');
    if (format) {
      args.push('%[filename:f]-output.' + format);
    }
    else {
      args.push('%[filename:f]-output.%[filename:e]');
    }

    e.target.disabled = true;
    e.target.value = 'Please wait ...';
    for (const file of files) {
      await convert(file, args);
    }
    e.target.disabled = false;
    e.target.value = 'Convert';
  }
  else {
    alert('nothing to do!');
  }
};

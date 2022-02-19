/* global files */

document.getElementById('fill-resize').onclick = () => {
  const img = new Image();
  img.onload = () => {
    document.getElementById('resize-width').value = img.naturalWidth;
    document.getElementById('resize-height').value = img.naturalHeight;
  };
  img.onerror = () => alert('Cannot Extract Metadata Image');
  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
  };
  reader.readAsDataURL(files[0]);
};

document.getElementById('fill-crop').onclick = () => {
  const img = new Image();
  img.onload = () => {
    document.getElementById('crop-width').value = img.naturalWidth;
    document.getElementById('crop-height').value = img.naturalHeight;
  };
  img.onerror = () => alert('Cannot Extract Metadata Image');
  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
  };
  reader.readAsDataURL(files[0]);
};

document.addEventListener('input', e => {
  if (e.target.type !== 'checkbox') {
    const g = e.target.closest('fieldset');
    const input = g?.querySelector('legend input');
    if (input) {
      input.checked = true;
    }
  }
});

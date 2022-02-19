/* global files */

document.ondragover = e => e.preventDefault();
document.ondrop = e => {
  e.preventDefault();

  if (e.dataTransfer.files.length) {
    files.push(...e.dataTransfer.files);
    document.getElementById('convert').disabled = false;
    document.getElementById('fill-resize').disabled = false;
    document.getElementById('fill-crop').disabled = false;

    document.title = 'Image Magic - Working on ' + files.length + ' Image Files';
  }
};

'use strict';

class Resize {
  image(src) {
    return new Promise((resolve, reject) => {
      const m = new Image();
      m.onload = () => resolve(m);
      m.onerror = reject;
      m.src = src;
    });
  }
  width(source) {
    return source.naturalWidth || source.width;
  }
  height(source) {
    return source.naturalHeight || source.height;
  }
  scale(source, width, height) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(source, 0, 0, width, height);

    return canvas;
  }
  canvas(source, job, img) {
    let width = job.canvas.width.value;
    if (job.canvas.width.unit === '%') {
      width = this.width(img) * width / 100;
    }
    if (!width) {
      width = job.image.width.value;
      if (job.image.width.unit === '%') {
        width = this.width(img) * width / 100;
      }
    }
    let height = job.canvas.height.value;
    if (job.canvas.height.unit === '%') {
      height = this.height(img) * height / 100;
    }
    if (!height) {
      height = job.image.height.value;
      if (job.image.height.unit === '%') {
        height = this.height(img) * height / 100;
      }
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.globalAlpha = job.opacity;
    ctx.fillStyle = job.color;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    const x = (width - this.width(source)) / 2;
    const y = (height - this.height(source)) / 2;
    ctx.drawImage(source, x, y);

    return canvas;
  }
  resize(img, job) {
    let width = job.image.width.value;
    if (job.image.width.unit === '%') {
      width = this.width(img) * width / 100;
    }
    let height = job.image.height.value;
    if (job.image.height.unit === '%') {
      height = this.height(img) * height / 100;
    }
    width = width || this.width(img);
    height = height || this.height(img) / this.width(img) * width;

    console.log(width, height);

    let w = this.width(img);
    let h = this.width(img);
    let source = img;
    if (w > width || h > height) {
      while (w >= 2 * width && h >= 2 * height) {
        source = this.scale(source, w / 2, h / 2);
        w = source.width;
        h = source.height;
      }
    }
    else {
      while (width >= 2 * w && height >= 2 * h) {
        source = this.scale(source, w * 2, h * 2);
        w = source.width;
        h = source.height;
      }
    }
    if (this.width(source) !== width || this.height(source) !== height) {
      source = this.scale(source, width, height);
    }

    source = this.canvas(source, job, img);
    return source;
  }
}

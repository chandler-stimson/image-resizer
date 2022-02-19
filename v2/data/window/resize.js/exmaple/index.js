/* global Resize */

(async resize => {
  let canvas = await resize.image('../256.png');
  document.body.appendChild(canvas);
  canvas = resize.resize(canvas, 16, 32);


  document.body.appendChild(canvas);
  console.log(123);
})(new Resize());

/* global Resize */
'use strict';

const resize = new Resize();
const images = [];
const ondrop = (...files) => {
  files = files.filter(f => f.type.startsWith('image/'));
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = async () => {
      const img = await resize.image(reader.result);
      img.filename = file.name;
      const index = images.push(img);
      if (index === 1) {
        document.getElementById('image').appendChild(img);
        const iw = document.getElementById('iw');
        const ih = document.getElementById('ih');
        if (!iw.value) {
          iw.value = img.naturalWidth;
          document.querySelector('#content input[name=iw]').click();
        }
        if (!ih.value) {
          ih.value = img.naturalHeight;
          document.querySelector('#content input[name=ih]').click();
        }
      }
      if (index === images.length) {
        document.getElementById('image').dataset.msg = index > 1 ? `...and ${index - 1} more` : '';
      }
      document.getElementById('image').dataset.count = images.length;
      document.querySelector('#jobs input[type=submit]').disabled = images.length === 0 || jobs.length === 0;
      document.getElementById('boxes').dispatchEvent(new Event('input'));
    };
    reader.readAsDataURL(file);
  }
};
document.querySelector('#image input').addEventListener('change', e => {
  ondrop(...e.target.files);
});

document.body.addEventListener('dragover', e => e.preventDefault());
document.body.addEventListener('drop', e => {
  e.preventDefault();
  ondrop(...e.dataTransfer.files);
});

const jobs = [];
document.getElementById('content').addEventListener('submit', e => {
  e.preventDefault();
  const o = {
    image: {
      width: {
        value: Number(document.getElementById('iw').value),
        unit: document.querySelector('#content input[name=iw]:checked').value
      },
      height: {
        value: Number(document.getElementById('ih').value),
        unit: document.querySelector('#content input[name=ih]:checked').value
      }
    },
    canvas: {
      width: {
        value: Number(document.getElementById('cw').value),
        unit: document.querySelector('#content input[name=cw]:checked').value
      },
      height: {
        value: Number(document.getElementById('ch').value),
        unit: document.querySelector('#content input[name=ch]:checked').value
      }
    },
    opacity: Number(document.getElementById('opacity').value) / 100,
    quality: Number(document.getElementById('quality').value) / 100,
    color: document.getElementById('color').value
  };

  const t = document.getElementById('job');
  const clone = document.importNode(t.content, true);
  clone.querySelector('span').textContent =
    `(${o.image.width.value}${o.image.width.unit}, ${o.image.height.value}${o.image.height.unit})@${o.quality}`;
  clone.querySelector('div').job = o;
  document.querySelector('#jobs [data-id="jobs"]').appendChild(clone);
  const index = jobs.push(o);
  if (index === 1) {
    document.querySelector('#jobs input[type=submit]').disabled = images.length === 0;
    document.getElementById('add-profile').disabled = false;
  }
  if (e.submitter.dataset.command === 'run') {
    document.querySelector('#jobs input[type=submit]').click();
  }
  if (document.activeElement.type === 'number') {
    document.activeElement.select();
  }
});

document.getElementById('jobs').addEventListener('submit', e => {
  e.preventDefault();
  const format = document.getElementById('format').value;
  for (const img of images) {
    for (const job of jobs) {
      const canvas = resize.resize(img, job);

      const ext = /\.\w{1,6}$/.exec(img.filename);
      const name = ext ? img.filename.replace(ext, '') : img.filename;
      chrome.downloads.download({
        filename: name + ` - ${canvas.width}x${canvas.height}.` + format,
        url: canvas.toDataURL('image/' + format, job.quality)
      });
    }
  }
});

// key press select
document.getElementById('boxes').addEventListener('keyup', e => {
  if (e.code === 'Space') {
    e.target.click();
  }
});

// proportional
document.getElementById('boxes').addEventListener('click', e => {
  const {command} = e.target.dataset;

  if (command === 'toggle-proportional') {
    e.target.classList.toggle('active');
  }
});
document.getElementById('boxes').addEventListener('input', ({target}) => {
  const {id} = target;
  if (id === 'iw' || id === 'ih' || id === 'cw' || id === 'ch') {
    const p = document.getElementById(`${id[0]}wh`).classList.contains('active');
    const r = images.length ? (
      document.querySelector(`#boxes [name=${id[0]}w][value="px"]`).checked ?
        images[0].naturalWidth / images[0].naturalHeight : 1
    ) : 1;
    if (p && id[1] === 'w') {
      document.getElementById(id[0] + 'h').value = parseFloat((target.value / r).toFixed(3));
    }
    else if (p) {
      document.getElementById(id[0] + 'w').value = parseFloat((target.value * r).toFixed(3));
    }
  }
});
document.getElementById('boxes').addEventListener('change', e => {
  if (e.target.type === 'radio') {
    const id = e.target.name;
    const p = document.getElementById(`${id[0]}wh`).classList.contains('active');
    if (p) {
      const name = id[0] + (id[1] === 'w' ? 'h' : 'w');
      document.querySelector(`#boxes input[type=radio][name="${name}"][value="${e.target.value}"]`).click();
    }
  }
});

// remove job
document.getElementById('jobs').addEventListener('click', e => {
  const command = e.target.dataset.command;
  if (command === 'remove') {
    const div = e.target.closest('div');
    const job = div.job;
    const index = jobs.indexOf(job);
    if (index !== -1) {
      jobs.splice(index, 1);
      div.remove();
      document.querySelector('#jobs input[type=submit]').disabled = jobs.length === 0;
      document.getElementById('add-profile').disabled = jobs.length === 0;
    }
  }
});

// add and run
document.getElementById('boxes').addEventListener('input', () => {
  const b = document.getElementById('iw').value && document.getElementById('ih').value;
  if (b === '') {
    document.querySelector('input[type=submit][data-command=add]').disabled = true;
    document.querySelector('input[type=submit][data-command=run]').disabled = true;
  }
  else {
    document.querySelector('input[type=submit][data-command=add]').disabled = false;
    document.querySelector('input[type=submit][data-command=run]').disabled = images.length === 0;
  }
});

// add
{
  const map = new WeakMap();
  const profiles = {};
  const add = (name, jobs) => {
    if (profiles[name]) {
      map.set(jobs, map.get(profiles[name]));
      profiles[name] = jobs;
    }
    else {
      const option = document.createElement('option');
      option.value = option.textContent = name;
      map.set(jobs, option);
      profiles[name] = jobs;
      document.getElementById('profiles').appendChild(option);
    }
  };
  document.getElementById('add-profile').addEventListener('click', () => {
    const name = window.prompt('Profile Name', document.getElementById('profiles').value);
    if (name) {
      add(name, [...jobs]);
      chrome.storage.local.set({
        profiles
      });
      document.getElementById('profiles').dispatchEvent(new Event('change'));
    }
  });
  document.getElementById('remove-profile').addEventListener('click', () => {
    const name = document.getElementById('profiles').value;
    const option = map.get(profiles[name]);
    delete profiles[name];
    chrome.storage.local.set({
      profiles
    });
    option.remove();
    document.getElementById('profiles').dispatchEvent(new Event('change'));
  });
  document.getElementById('load-profile').addEventListener('click', () => {
    jobs.length = 0;
    document.querySelector('#jobs [data-id="jobs"]').textContent = '';

    const name = document.getElementById('profiles').value;
    for (const job of profiles[name]) {
      if (job.image.width.value === job.image.height.value && job.image.width.unit === job.image.height.unit) {
        document.getElementById('iwh').classList.add('active');
      }
      else {
        document.getElementById('iwh').classList.remove('active');
      }
      document.getElementById('iw').value = job.image.width.value;
      document.querySelector(`input[name=iw][value="${job.image.width.unit}"]`).click();
      document.getElementById('ih').value = job.image.height.value;
      document.querySelector(`input[name=ih][value="${job.image.height.unit}"]`).click();

      if (job.canvas.width.value === job.canvas.height.value && job.canvas.width.unit === job.canvas.height.unit) {
        document.getElementById('cwh').classList.add('active');
      }
      else {
        document.getElementById('cwh').classList.remove('active');
      }
      document.getElementById('cw').value = job.canvas.width.value || '';
      document.querySelector(`input[name=cw][value="${job.canvas.width.unit}"]`).click();
      document.getElementById('ch').value = job.canvas.height.value || '';
      document.querySelector(`input[name=ch][value="${job.canvas.height.unit}"]`).click();

      document.getElementById('color').value = job.color;
      document.getElementById('opacity').value = (job.opacity * 100).toFixed(0);
      document.getElementById('quality').value = (job.quality * 100).toFixed(0);

      document.getElementById('iw').dispatchEvent(new Event('input', {
        bubbles: true
      }));
      document.querySelector('#add input[type=submit][data-command=add]').click();
    }
  });
  chrome.storage.local.get({
    profiles
  }, prefs => {
    Object.entries(prefs.profiles).forEach(([name, jobs]) => add(name, jobs));
    document.getElementById('profiles').dispatchEvent(new Event('change'));
  });
}
document.getElementById('profiles').addEventListener('change', e => {
  document.getElementById('remove-profile').disabled = e.target.value === '';
  document.getElementById('load-profile').disabled = e.target.value === '';
});


const _buffer = require("./buffer");

const buffer = _buffer();

let page = 0;

buffer.startStream();

const pushMock = () => {
  let items = [];
  for (let i = 0; i < 10; i++) {
    items.push(10 * page + i + 1);
  }

  const curBuffer = buffer.push(items);
  page++;

  if (curBuffer.length > 800) return;

  setTimeout(() => {
    pushMock();
  }, Math.random() * 1000);
};

pushMock();

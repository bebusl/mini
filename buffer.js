// const fs = require("fs");
// const util = require("util");

// // 로그 파일 스트림 생성
// const logFile = fs.createWriteStream("log_proxy.txt", { flags: "a" });

// // 원본 console.log 저장
// const originalLog = console.log;

// // Proxy로 감싼 log 함수 만들기
// const logProxy = new Proxy(originalLog, {
//   apply(target, thisArg, args) {
//     const message = util.format(...args);

//     // 콘솔 출력
//     Reflect.apply(target, thisArg, args);

//     // 파일 저장
//     logFile.write(message + "\n");
//   },
// });

// 프록시를 console.log에 덮어씌움
// console.log = logProxy;

const buffered = () => {
  const bufferLog = new Set();
  const buffer = [];
  let inputSizes = [];
  let isStreaming = false;

  const streamNextChunk = () => {
    if (!isStreaming || inputSizes.length === 0 || buffer.length === 0) {
      isStreaming = false;
      return;
    }

    const curSize = inputSizes.shift();
    const interval = 1000 / curSize;
    let count = 0;

    const processChunk = () => {
      //   if (!isStreaming || count >= curSize || buffer.length === 0) {
      if (!isStreaming || buffer.length === 0) {
        // 다음 chunk로
        streamNextChunk();
        return;
      }

      console.log(buffer.shift());
      count++;
      setTimeout(processChunk, interval);
    };

    processChunk();
  };

  return {
    getBuffer: () => buffer,
    getInputSizes: () => inputSizes,
    push: (input) => {
      if (Array.isArray(input)) {
        input.forEach((item) => {
          if (bufferLog.has(item)) {
            console.warn("중복된 아이템이 버퍼에 쌓였음 :: ", item);
            bufferLog.add(item);
          }
        });

        buffer.push(...input);
        inputSizes.push(input.length);
        if (!isStreaming) {
          isStreaming = true;
          streamNextChunk();
        }
      }
      return buffer;
    },
    startStream: () => {
      if (!isStreaming) {
        isStreaming = true;
        streamNextChunk();
      }
    },
    stopStream: () => {
      isStreaming = false;
    },
  };
};

module.exports = buffered;

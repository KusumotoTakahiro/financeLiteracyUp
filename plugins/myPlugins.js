export const isMail = (address) => {
  if (!address) {
    return false;
  }
  let regex = new RegExp(
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  );
  if (address.match(regex)) {
    return true;
  }
  return false;
};

export const isNumber = (address) => {
  if (!address) {
    return false;
  }
  let regex = new RegExp(
    /^([1-9]\d*|0)$/
  );
  if (address.match(regex)) {
    return true;
  }
  return false;
};

export const isHalf = (text) => {
  if (!text) {
    return false;
  }
  //半角英数字空文字NG
  let regex = new RegExp(
    /^[0-9a-zA-Z]+$/
  );
  if (text.match(regex)) {
    return true;
  }
  return false;
};

export const checkFile = (csv_data, original_data) => {
  if (original_data.length > csv_data.length) {
    return `入力数が少ないです．ファイルが異なる可能性があります．`;
  }
  if (original_data.length < csv_data.length) {
    return `入力数が多いです．ファイルが異なる可能性があります．`;
  }
  for (let i = 0; i < csv_data.length; i++) {
    let flag = false;
    for (let j = 0; j < original_data.length; j++) {
      if (Object.keys(csv_data).indexOf('did') !== -1) {
        return `ファイルの形式が異なります．`;
      }
      else {
        if (csv_data[i].did===original_data[j].id) {
          flag = true;
        }
      }
      
    }
    if (!flag) {
      return `もとのID以外のデータが増えています．`;
    }
  }
  return "";
};

export const myPromiseAll = async (arr, anyfunc) => {
  await Promise.all(arr.map(async arrItem => await anyfunc(arrItem)));
  console.log('my PromiseAll done!!');
};


export const myPromise = (anyfunc, funcName) => {
  return new Promise(resolve => {
    setTimeout(()=> {
      console.log(funcName); //確認のため
      anyfunc();
    }, 2000);
  })
};
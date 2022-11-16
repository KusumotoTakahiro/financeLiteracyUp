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

export const myPromiseAll = async (arr, anyfunc) => {
  await Promise.all(arr.map(async arrItem => await anyfunc(arrItem)));
  console.log('my PromiseAll done!!');
}


export const myPromise = (anyfunc, funcName) => {
  return new Promise(resolve => {
    setTimeout(()=> {
      console.log(funcName); //確認のため
      anyfunc();
    }, 2000);
  })
}
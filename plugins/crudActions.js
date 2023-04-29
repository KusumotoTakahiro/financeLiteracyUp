import '@/plugins/typeDefine';
import * as func from "@/plugins/myPlugins";
import {
  collection,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  fireStore,
} from "~/plugins/firebase";
import { authStateChanged } from '@/plugins/auth';
import EventBus from '@/plugins/event-bus';


/**
 * jspreadsheetでの保存ボタンを押下時に実行される関数.
 * @param {Array<TableRow>} modified_data - myTableに記録されている[内容,報酬]の配列の全データ．
 * @param {Array<Work>} original_data - DBに登録されているworksの全データを取得．
 * @param {string} subject - 対象がworksなのかshopsなのかfinesなのか．
 */
export async function save_data_by_jspreadsheet(modified_data, original_data, subject) {
  let error = false;
  let message = '';
  const check_duplicate = check_content_is_duplicate(modified_data);
  const check_brank = check_missing_entries_myTable(modified_data);
  const check_format = check_format_myTableCells(modified_data);
  if (check_duplicate) {
    error = true;
    message = '入力に重複する内容が含まれています．';
  }
  if (check_brank) {
    error = true;
    message = '入力に漏れがあります．'
  }
  if (check_format.error) {
    error = true;
    message = check_format.message;
  }
  if (error) {
    return {error, message}
  } else {
    /**
     * firebaseでユーザーのログイン状態を監視し，結果が格納される．
     * @type {Object} user 
     */
    const user = await authStateChanged();
    await create_and_update_by_myTable(user, subject, original_data, modified_data)
    .then(async res => {
      if (res) error = res
      else {
        await delete_by_myTable(user, subject, original_data, modified_data)
        .then(res => error=res)
      }
    })
    return {error, 'message': '正常に更新しました'};
  }
}


/**
 * jspreadsheetでの保存ボタンを押下時に実行される関数.presentsのp.vue用に変更．
 * @param {Array<TableRow>} modified_data - myTableに記録されている[内容,報酬]の配列の全データ．
 * @param {Array<Object>} original_data - DBに登録されている情報（worksなど）の全データを取得．
 * @param {Array<Object>} children_data - 子供の情報.
 * @param {string} subject - 対象がworksなのかshopsなのかfinesなのか．
 */
export async function save_data_by_jspreadsheet_for_presents(modified_data, original_data, children_data, subject) {
  let error = false;
  let message = '';
  // たぶん重複は許すしかない．だめそうなら別途関数を作り直す．
  // const check_duplicate = check_content_is_duplicate(modified_data);
  const check_brank = check_missing_entries_myTable_for_presents(modified_data);
  const check_format = check_format_myTableCells_for_presents(modified_data);
  if (check_brank) {
    error = true;
    message = '入力に漏れがあります．'
  }
  if (check_format.error) {
    error = true;
    message = check_format.message;
  }
  if (error) {
    return {error, message}
  } else {
    /**
     * firebaseでユーザーのログイン状態を監視し，結果が格納される．
     * @type {Object} user 
     */
    const user = await authStateChanged();
    await create_by_myTable_for_presents(user, subject, original_data, modified_data, children_data)
    .then(async res => {
      if (res) error = res
      else {
        await delete_by_myTable_for_presents(user, subject, original_data, modified_data)
        .then(res => error=res)
      }
    })
    return {error, 'message': '正常に更新しました'};
  }
}


/**
 * 一括編集機能を行う前に，myTableに同一名のお仕事が重複して登録されていないかを確認する関数．
 * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
 * @returns {boolean} - コンテンツ名が重複していればTrue，いなければFalseを返す.
 */
function check_content_is_duplicate(modified_data) {
  const modified_data_length = modified_data.length
  for (let i = 0; i < modified_data_length; i++) {
    let content_is_duplicate = false;
    for (let j = 0; j < modified_data_length; j++) {
      if ((i !== j)&&(modified_data[i][0]===modified_data[j][0])) {
        if (modified_data[i][0] !== '') {
          content_is_duplicate = true;
        }
      }
    }
    if (content_is_duplicate) {
      return content_is_duplicate;
    }
  }
  return false;
}


/**
 * 一括編集機能を行う前に，myTableに記入漏れがないかを確認する関数.
 * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
 * @returns {boolean} - 内容に記入漏れがないかを確認し，あればTrue，なければFalseを返す.
 * @description modified_dataの内，両方が空白のものは記入漏れとみなさない．
 * 片方が記入されているが，もう片方が空白のもののみ記入漏れとみなし，Trueを返す．
 */
function check_missing_entries_myTable(modified_data) {
  for (let i = 0; i < modified_data.length; i++) {
    const content_isEmpty = modified_data[i][0].trim() === '';
    const price_isEmpty = String(modified_data[i][1]).trim() === '';
    if (content_isEmpty || price_isEmpty) {
      if (!(content_isEmpty && price_isEmpty)) {
        return true;
      } 
    }
  }
  return false;
}


/**
 * 一括編集機能を行う前に，myTableに記入漏れがないかを確認する関数.記入漏れがあればtrueを返す．
 * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
 * @returns {boolean} - 内容に記入漏れがないかを確認し，あればTrue，なければFalseを返す.
 * @description modified_dataの内，全てが空白のものは記入漏れとみなさない．
 * いつくかは記入されているが，一つ以上が空白のものを記入漏れとみなし，Trueを返す．
 */
function check_missing_entries_myTable_for_presents(modified_data) {
  for (let i = 0; i < modified_data.length; i++) {
    const content_isEmpty = modified_data[i][0].trim() === '';
    const forWhom_isEmpty = modified_data[i][1].trim() === '';
    const price_isEmpty = String(modified_data[i][2]).trim() === '';
    const all_empty = content_isEmpty && forWhom_isEmpty && price_isEmpty;
    const all_entered = !content_isEmpty && !forWhom_isEmpty && !price_isEmpty;
    if (all_empty || all_entered) {
      console.log('all clear');
    } else {
      return true;
    }
  }
  return false;
}


/**
 * テーブル内のcellでそれぞれ入力の状態に問題がないかを確認する関数
 * @param {TableRow[]} modified_data - table内のデータ
 * @returns {Object} - cell内の形式に問題があれば，error=false,なければtrueを返す.
 * trueの場合は追加でmessageを返す.
 */
function check_format_myTableCells(modified_data) {
  for (let i = 0; i < modified_data.length; i++) {
    /**
     * 変更後のcontent(仕事名や商品名)
     * @type {String} modified_content
     */
    const modified_content = String(modified_data[i][0]);
    /**
     * 変更後のprice（パパ円)
     * @type {Number} modified_price
     */
    const modified_price = Number(modified_data[i][1]);
    const result = data_check(modified_content, modified_price);
    if (result.error) {
      return {'error': true, message: result.message}
    }
  }
  return {'error': false};
}


/**
 * テーブル内のcellでそれぞれ入力の状態に問題がないかを確認する関数
 * presentsのp.vue用
 * @param {TableRow[]} modified_data - table内のデータ
 * @returns {Object} - cell内の形式に問題があれば，error=false,なければtrueを返す.
 * trueの場合は追加でmessageを返す.
 */
function check_format_myTableCells_for_presents(modified_data) {
  for (let i = 0; i < modified_data.length; i++) {
    /**
     * 変更後のcontent(仕事名や商品名)
     * @type {String} modified_content
     */
    const modified_content = String(modified_data[i][0]);
    /**
     * 変更後のprice（パパ円)
     * @type {Number} modified_price
     */
    const modified_price = Number(modified_data[i][2]);
    const result = data_check(modified_content, modified_price);
    if (result.error) {
      return {'error': true, message: result.message}
    }
  }
  return {'error': false};
}


/**
 * 一括編集機能として，「DB上の保存済みデータとmyTableの差分を新規追加または報酬のみ変更」する関数.
 * @param {Object} user
 * @param {string} subject - 対象がworksなのかshopsなのかfinesなのか．
 * @param {Array<Work>} original_data - DB上のWorkに登録されているデータ．
 * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
 * @returns {Boolean} - 正常に終了すればTrue，しなければFalseを返す.
 */
async function create_and_update_by_myTable(user, subject, original_data, modified_data) {
  /**
   * 途中でdata_check()に引っかかったかどうかを判定するフラグ
   * @type {Boolean} error
   */
  let error = false;
  for (let i = 0; i < modified_data.length; i++) {
    /**
     * 変更後のcontent(仕事名や商品名)
     * @type {String} modified_content
     */
    const modified_content = String(modified_data[i][0]);
    /**
     * 変更後のprice（パパ円)
     * @type {Number} modified_price
     */
    const modified_price = Number(modified_data[i][1]);
    /**
     * 変更後のcontentが変更前から存在していたcontentなのかどうか．
     * @type {Boolean} modified_content_isExist
     */
    let modified_content_isExist = false;
    for (let j = 0; j < original_data.length; j++) {
      /**
       * 変更前のcontent(仕事名や商品名)
       * @type {string} original_content
       */
      const original_content = String(original_data[j].content);
      /**
       * 変更前のprice(パパ円)
       * @type {Number} original_price 
       */
      const original_price = Number(original_data[j].price);
      // modified_contentがもともとあったcontentなのかを調べている．
      if (modified_content === original_content) {
        modified_content_isExist = true;
        // priceのみが変更されている場合.それ以外はそのまま．
        if (original_price !== modified_price) {
          await update_item(user, subject, original_data[j].id, original_content, modified_price)
          .then(result => {
            if (result) error = true;
          })
        }
      }
    }
    // myTableにしか載っていないcontentを新規データとしてDBに登録する
    if (!modified_content_isExist) {
      // 空白チェック済みのため，両方空白か両方埋まってるかのどちらかしかない．
      // ⇩そのため，両方空白かは片方確認するだけで済んでいる
      if (!(modified_content.trim() === '')) {
        await create_item(user, subject, modified_content, modified_price)
        .then(result => {
          if (result.error) error = true;
        })
      }
    }
  }
  return error;
}


/**
 * 一括編集機能として，「DB上の保存済みデータとmyTableの差分を新規追加または報酬のみ変更」する関数.
 * @param {Object} user
 * @param {string} subject - 対象がworksなのかshopsなのかfinesなのか．
 * @param {Array<Work>} original_data - DB上のWorkに登録されているデータ．
 * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
 * @param {Array<Object>} children - childrenデータ
 * @returns {Boolean} - 正常に終了すればTrue，しなければFalseを返す.
 */
async function create_by_myTable_for_presents(user, subject, original_data, modified_data, children) {
  /**
   * 途中でdata_check()に引っかかったかどうかを判定するフラグ
   * @type {Boolean} error
   */
  let error = false;
  for (let i = 0; i < modified_data.length; i++) {
    /**
     * 変更後のcontent(仕事名や商品名)
     * @type {String} modified_content
     */
    const modified_content = String(modified_data[i][0]);
    /**
     * 変更後のforWhom(対象者)
     * @type {String} modified_forWhom
     */
    const modified_forWhom = String(modified_data[i][1]);
    /**
     * 変更後のprice（パパ円)
     * @type {Number} modified_price
     */
    const modified_price = Number(modified_data[i][2]);
    /**
     * 変更後のcontentが変更前から存在していたcontentなのかどうか．
     * @type {Boolean} modified_content_isExist
     */
    let modified_content_isExist = false;
    for (let j = 0; j < original_data.length; j++) {
      /**
       * 変更前のcontent(仕事名や商品名)
       * @type {string} original_content
       */
      const original_content = String(original_data[j].content);
      /**
       * 変更前のforWhom(対象者)
       * @type {string} original_forWhom
       */
      const original_forWhom = String(original_data[j].forWhom.name);
      /**
       * 変更前のprice(パパ円)
       * @type {Number} original_price 
       */
      const original_price = Number(original_data[j].price);
      // modified_contentがもともとあったcontentなのかを調べている．
      if ( original_content === modified_content) {
        if (original_forWhom === modified_forWhom) {
          if (original_price === modified_price) {
            modified_content_isExist = true;
          }
        }
      }
    }
    // myTableにしか載っていないcontentを新規データとしてDBに登録する
    if (!modified_content_isExist) {
      // 空白チェック済みのため，全て空白か全て埋まってるかのどちらかしかない．
      // ⇩そのため，全て空白かは片方確認するだけで済んでいる
      if (!(modified_content.trim() === '')) {
        let forWhomData = []
        for (let k = 0; k < children.length; k++) {
          if (children[k].data.name === modified_forWhom) {
            forWhomData.push(children[k]);
          }
        }
        await create_item_for_presents(
          user, subject, modified_content, modified_price, forWhomData)
        .then(result => {
          if (result.error) error = true;
        })
      }
    }
  }
  return error;
}


/**
 * DB内の既存contentのpriceを修正する関数.
 * @param {String} docid - documentID．DB上での保存場所を一意に指定している．
 * @param {Object} user - 現在ログインしているuserの情報
 * @param {String} subject - 現在変更対象のDB上のcollection(WorksやShopなど)
 * @param {Number} newPrice - 更新する（修正する金額）
 * @param {String} nowContent - 更新対象のcontent
 * @returns {boolean} - 正常に更新できたかをerrorフラグで返す.
 */
async function update_item(user, subject, docid, nowContent, newPrice) {
  let error = false;
  try {
    await getContentDocRef(user, subject, docid)
    .then(docRef => {
      updateDoc(docRef, { price: Number(newPrice) })
    })
  }
  catch(e) {
    error = true;
    const error_message = '『'+String(e) + '』が発生しました';
  }
  return error;
}


/**
 * DB上にcontentとpriceの組で一つ登録する関数.
 * @param {Object} user 
 * @param {string} subject 
 * @param {string} content 
 * @param {number} price 
 * @returns {Object} - errorがあればtrue,なければfalseを返す．
 * また，messageも合わせて返す.
 */
export async function create_item(user, subject, content, price) {
  let error = false;
  let message = '項目を追加しました！';
  let result = data_check(content, price);
  if (!result.error) {
    try {
      await getCollectionRef(user, subject)
      .then(docRef => {
        addDoc(docRef, {content, price})
      })
    }
    catch(e) {
      error = true;
      message = '『'+String(e) + '』が発生しました';
    }
  } else {
    error = true;
    message = result.message;
  }
  return {error, message}
}


/**
 * DB上にcontent, price, forWhomのデータを一組で登録する．
 * @param {Object} user 
 * @param {string} subject 
 * @param {string} content 
 * @param {number} price 
 * @param {Array} forWhom - {name, uid, attribute}で構成されたobjectを要素に持つArray
 * @returns {Object} - errorがあればtrue,なければfalseを返す．
 * また，messageも合わせて返す.
 */
export async function create_item_for_presents(user, subject, content, price, forWhom) {
  let error = false;
  let message = '項目を追加しました！';
  let result = data_check_for_presents(content, price, forWhom);
  if (!result.error) {
    for (let i = 0; i < forWhom.length; i++) {
      let oneOfForWhom = forWhom[i];
      try {
        await getCollectionRef(user, subject)
        .then(docRef => {
          addDoc(docRef, {
            content,
            price,
            forWhom: {
              name: oneOfForWhom.data.name,
              uid: oneOfForWhom.uid,
              attribute: oneOfForWhom.data.attribute //属性は確認用
            }
          })
        })
      }
      catch(e) {
        error = true;
        message = '『'+String(e) + '』が発生しました';
      }
    }
  } else {
    error = true;
    message = result.message;
  }
  return {error, message}
}


/**
 * DB上にcontent, price, forWhomのデータを一組で登録する．
 * @param {Object} user 
 * @param {string} subject 
 * @param {string} content 
 * @param {number} price 
 * @param {Array} forWhom - {name, uid, attribute}で構成されたobjectを要素に持つArray
 * @returns {Object} - errorがあればtrue,なければfalseを返す．
 * また，messageも合わせて返す.
 */
export async function create_item_for_freeTrades(user, subject, content, price, forWhom, tradeType) {
  let error = false;
  let message = '項目を追加しました！';
  let result = data_check_for_presents(content, price, forWhom);
  console.log(user)
  if (!result.error) {
    for (let i = 0; i < forWhom.length; i++) {
      let oneOfForWhom = forWhom[i];
      try {
        await getCollectionRef(user, subject)
        .then(docRef => {
          addDoc(docRef, {
            content,
            price,
            fromWhom: {
              name: user.displayName,
              uid: user.uid
            },
            forWhom: {
              name: oneOfForWhom.data.name,
              uid: oneOfForWhom.uid,
              attribute: oneOfForWhom.data.attribute //属性は確認用
            },
            tradeType
          })
        })
      }
      catch(e) {
        error = true;
        message = '『'+String(e) + '』が発生しました';
      }
    }
  } else {
    error = true;
    message = result.message;
  }
  return {error, message}
}


/**
 * 一括編集機能として，「DB上の保存済みデータにあるが，myTableにないデータを削除する」関数.
 * @param {object} user - 現在のログインuserの情報
 * @param {string} subject - works, shops, fines など
 * @param {Array<Work>} original_data - DB上のWorkに登録されているデータ．
 * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
 * @returns {boolean} errorの有無を返す．errorがあればtrue,なければfalse
 */
async function delete_by_myTable(user, subject, original_data, modified_data) {
  let error = false;
  for (let i = 0; i < original_data.length; i++) {
    /**
     * もともとDBにあったデータが変更後のJspreadSheetに残っているか．
     * @type {boolean} - original_content_isExist
     */
    let original_content_isExist = false;
    for (let j = 0; j < modified_data.length; j++) {
      if (original_data[i].content === modified_data[j][0]) {
        original_content_isExist = true;
      }
    }
    //myTableにはなくなっていて，DBにだけ残ってるデータを削除する．
    if (!original_content_isExist) {
      try {
        await getContentDocRef(user, subject, original_data[i].id)
        .then(docRef => {
          deleteDoc(docRef);
        })
      }
      catch(e) {
        const message = '『'+String(e) + '』が発生しました';
        error = true;
      }
    }
  }
  return error;
}


/**
 * 一括編集機能として，「DB上の保存済みデータにあるが，myTableにないデータを削除する」関数.
 * @param {object} user - 現在のログインuserの情報
 * @param {string} subject - works, shops, fines など
 * @param {Array<Work>} original_data - DB上のWorkに登録されているデータ．
 * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
 * @returns {boolean} errorの有無を返す．errorがあればtrue,なければfalse
 */
async function delete_by_myTable_for_presents(user, subject, original_data, modified_data) {
  let error = false;
  for (let i = 0; i < original_data.length; i++) {
    /**
     * もともとDBにあったデータが変更後のJspreadSheetに残っているか．
     * 三つの要素（contents, forWhom, price)の完全一致で確認する．
     * @type {boolean} - original_content_isExist
     */
    let original_content_isExist = false;
    for (let j = 0; j < modified_data.length; j++) {
      if (original_data[i].content === modified_data[j][0]) {
        if (original_data[i].forWhom.name === modified_data[j][1]) {
          if (original_data[i].price === modified_data[j][2]) {
            original_content_isExist = true;
          }
        }
      }
    }
    //myTableにはなくなっていて，DBにだけ残ってるデータを削除する．
    if (!original_content_isExist) {
      try {
        await getContentDocRef(user, subject, original_data[i].id)
        .then(docRef => {
          deleteDoc(docRef);
        })
      }
      catch(e) {
        const message = '『'+String(e) + '』が発生しました';
        error = true;
      }
    }
  }
  return error;
}


/**
 * 既にDBに登録されているアイテムのうち選択したものを削除
 * @param {string} subject 
 * @param {Array} selectedItems
 * @returns {Object} - errorがあるかどうかとエラーメッセージ
 */
export async function delete_items(subject, selectedItems){
  const count = String(Object.keys(selectedItems).length);
  if (Number(count) === 0) {
    return {
      error: true,
      message: '削除する項目が選択されていません'
    }
  }
  const user = await authStateChanged();
  let obj = selectedItems;
  let error = false;
  let message = '';
  for(let key in obj) {
    if(obj.hasOwnProperty(key)) {
      try {
        await getContentDocRef(user, subject, obj[key].id)
        .then(docRef => {
          deleteDoc(docRef);
        })
      }
      catch(e) {
        error = true;
        console.log(e);
        message = '『'+String(e) + '』が発生しました';
      }
    }
  }
  if (!error) {
    message = count + '件のデータを削除しました!';
  }
  return {error, message}
}


/**
 *DBからworksを再取得するための関数(主に，データ更新時に利用する)
 *@param {Collection} collectionReference - DBの参照先.参照するコレクションを指定する
 *@returns {Array} - DBから指定されたコレクションのデータを取り出して返す．
 */
export async function fetch_items(collectionReference) {
  const all_items = await getDocs(collectionReference);
  let items = [];
  all_items.forEach(doc => {
    //ここでworksを更新する =>データがテーブルに反映されるはず
    try {
      let data = doc.data();
      data.id = doc.id;
      items.push(data);
    }
    catch(e) {
      const error_message = '『'+String(e) + '』が発生しました';
    }
  })
  return items;
}


/**
 * DBからchildデータを取得するための関数(presents.p.vueで使用する)
 * @param {Collection} collectionReference 
 * @returns {Array} - DBから取得したChild属性のmemberを取ってくる.
 */
export async function fetch_children(collectionReference) {
  const all_member = await getDocs(collectionReference);
  let children = [];
  for (let i = 0; i < all_member.docs.length; i++) {
    let one_member = all_member.docs[i].data();
    if (one_member.attribute === 'child') {
      try {
        const childRef = doc(fireStore, "users", one_member.uid);
        const childData = await getDoc(childRef);
        let child = {}
        child.data = childData.data();
        child.uid = one_member.uid;
        children.push(child);
      }
      catch(e) {
        const error_message = '『'+String(e) + '』が発生しました';
        console.log(error_message);
      }
    }
  }
  return children;
}


/**
 * DBからchildデータを取得するための関数(presents.p.vueで使用する)
 * @param {Collection} collectionReference 
 * @returns {Array} - DBから取得したChild属性のmemberを取ってくる.
 */
export async function fetch_parents(collectionReference) {
  const all_member = await getDocs(collectionReference);
  let parents = [];
  for (let i = 0; i < all_member.docs.length; i++) {
    let one_member = all_member.docs[i].data();
    if (one_member.attribute !== 'child') {
      try {
        const parentRef = doc(fireStore, "users", one_member.uid);
        const parentData = await getDoc(parentRef);
        let parent = {}
        parent.data = parentData.data();
        parent.uid = one_member.uid;
        parents.push(parent);
      }
      catch(e) {
        const error_message = '『'+String(e) + '』が発生しました';
        console.log(error_message);
      }
    }
  }
  return parents;
}


/**
 * DBの登録前にcontent(内容)とprice(報酬)の入力内容に関して，
 * content，priceの記入漏れチェック,
 * contentが1文字でないか,
 * 金額入力時の半角チェックを行う関数
 * @param {string} content - 内容であり，短すぎる（一文字）のものはエラーで変えす．
 * @param {number} price - 半角数字のみを許容する．かつ金額の限度は決めてない．
 * @returns {Object} - errorの有無をbooleanで返す.また，error=trueの時はmessageも返す
 * @property {boolean} error - 問題なければfalse，あればtrueを返す．
 * @property {string} message - error=trueの時にerror内容を返す.
 */
function data_check(content, price) {
  let error = false;
  let message = '';
  if (!is_written(content, price)) {
    error = true;
    message = '記入漏れがあります';
  }
  else if (!is_long(content)) {
    error = true;
    message = '内容の説明が短いです';
  }
  else if (!func.isNumber(String(price))) {
    error = true;
    message = '金額は半角数字で入力してください';
  }
  return {error, message}
}


/**
 * DBの登録前にcontent(内容)とprice(報酬)の入力内容に関して，
 * content，priceの記入漏れチェック,
 * contentが1文字でないか,
 * 金額入力時の半角チェックを行う関数
 * @param {string} content 
 * @param {number} price 
 * @param {Object} forWhom 
 */
function data_check_for_presents(content, price, forWhom) {
  let error = false;
  let message = '';
  if (!is_written(content, price)) {
    error = true;
    message = '記入漏れがあります';
  }
  else if (!is_long(content)) {
    error = true;
    message = '内容の説明が短いです';
  }
  else if (!func.isNumber(String(price))) {
    error = true;
    message = '金額は半角数字で入力してください';
  }
  if (forWhom.length === 0) {
    error = true;
    message = '対象者が選択されていません';
  }
  return {error, message}
}


/**
 * DBの登録前にcontetnとpriceのどちからの入力が空白でないかを確認する関数．
 * 片方が空白の時のみfalseを返す．両方が空白または記入済みの場合はtrueを返す．
 * @param {string} content
 * @param {number} price 
 * @returns {boolean} - 記入漏れがないかをtrue,falseで返す
 */
function is_written(content, price) {
  let ok = true;
  const content_is_brank =  content.trim() === '';
  const price_is_brank = String(price).trim() === '0';
  if (!content_is_brank && price_is_brank) {
    ok = false;
  }
  if (content_is_brank && !price_is_brank) {
    ok = false;
  }
  return ok;
}


/**
 * contentの長さを調べる関数
 * @param {String} content 
 * @returns 
 */
function is_long(content) {
  let ok = true;
  if (content.length==1) ok = false;
  return ok;
}


/**
 * 現在のログインuserのsubject(worksやshops)に含まれる任意のdocumentまでのReferenceを返す．
 * @param {Object} user 
 * @param {string} subject 
 * @returns {String} - subject内の任意のdocumentの参照パス.
 */
async function getContentDocRef(user, subject, docid) {
  const userDocRef = doc(fireStore, "users", user.uid);
  const querySnapshot = await getDoc(userDocRef);
  const roomPath = querySnapshot.data().group;
  const contentDocRef = doc(fireStore, 'groups', roomPath, subject, docid);
  return contentDocRef;
}


/**
 * 現在のログインuserのsubject(worksやshops)までのReferenceを返す．
 * @param {Ojbect} user 
 * @param {string} subject 
 * @returns {string} - subjectまでのcollectionの参照パス.
 */
async function getCollectionRef(user, subject) {
  const userDocRef = doc(fireStore, "users", user.uid);
  const querySnapshot = await getDoc(userDocRef);
  const roomPath = querySnapshot.data().group;
  const collectionRef = collection(fireStore, 'groups', roomPath, subject);
  return collectionRef;
}


/**
 * EventBus関数.EventBusを経由することで，
 * @param {string} bus_name - 識別するための名前.
 * @param {Any} data_for_sending - 送るデータ.
 * @returns {EventBus} - 上記で設定したEventBus
 */
function Ebus(bus_name, data_for_sending) {
  EventBus.$emit(bus_name, data_for_sending)
}


/**
 * JspreadSheetを使ってexcelライクなTableを作成する関数.
 * @param {Array<Object>} datas_from_DB - worksやshopsなどのDBからのデータ
 * @param {Array<Object>} table_columns 
 * @param {string} subject - worksやshopsなどのカテゴリー．
 * @return {JspreadSheet} - myTable（JspreadSheetオブジェクト）を返す
 */
export function create_myTable(datas_from_DB, table_columns) {
  //datas_from_DBからmyTable_dataを形成(または,再形成)
  let table_data = [];
  for (let i = 0; i < datas_from_DB.length; i++) {
    const item = datas_from_DB[i];
    if ('content' in item) {
      if ('price' in item) {
        if ('forWhom' in item) {
          let tableRowData = [item.content, item.forWhom.name, item.price];
          table_data.push(tableRowData);
        }
        else {
          let tableRowData = [item.content, item.price];
          table_data.push(tableRowData);
        }
      } else {
        console.log('priceの記入がない');
      }
    } else {
      console.log('contentの記入がない');
    }
  }
  const limitNum = 5;  //初期行数分の初期化
  if (datas_from_DB.length < limitNum) {
    if (table_columns.length === 2) { // works,fines,shops用
      const len = limitNum - datas_from_DB.length;
      for (let i = 0; i < len; i++) {
        table_data.push(['', undefined]);
      }
    }
    else if (table_columns.length === 3) { // presentsページ用
      const len = limitNum - datas_from_DB.length;
      for (let i = 0; i < len; i++) {
        table_data.push(['', undefined, undefined]);
      }
    }
  }
  const id = 'mytable';
  const myTable = jspreadsheet(document.getElementById(id), {
    data: table_data,
    columns: table_columns,
    contextMenu: (obj, row) => {
      return getContextMenu(obj, row);
    },
    toolbar: [
      {type: 'i', content: 'undo', onclick: ()=>myTable.undo()},
      {type: 'i', content: 'redo', onclick: ()=>myTable.redo()},
      {type: 'i', content: 'save', onclick: ()=> {
          console.log('save')
          const result = {
            'data': myTable.getData(),
            'type': 'save'
          }
          Ebus('res', result);
        }
      },
      {type: 'i', content: 'close', onclick: ()=>Ebus('res', 'close')},
    ]
  });
  return myTable;
}


/**
 * JspreadSheet内のcontextmenuを作る関数
 * @param {Object} obj - JspreadSheet内部のパラメータ．組込メソッドを持つ.
 * @param {Array} row - JspreadSheet内部のパラメータ．行を意味する
 * @returns {Array} - tableに格納されるデータ
 */
function getContextMenu(obj, row) {
  let items = [];
  // Insert new row
  items.push({
    title: T('新しい行を追加'),
    onclick: function() {
      obj.insertRow(1, parseInt(row), 1); //要修正
    }
  });
  items.push({
    title: T('行の削除'),
    onclick: function() {
      obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
    }
  });
  // Save
  items.push({
    title: T('保存'),
    icon: 'save',
    shortcut: 'Ctrl + S',
    onclick: function() {
      obj.download();
    }
  });
  return items;
}


/**
 * jspreadSheetでのコンテキストメニューを作る際に内部で使用しているTitle作成関数
 * @param {string} t - タイトルを書く．e.g. save as や insert new row など
 * @returns {string} - 正直良く分からん．とりあえず，Titleように変換してくれるっぽい．
 */
function T(t) {
  return jSuites.translate(t);
}


/**
 * myTableを初期化するための関数.idで指定した要素の子要素を全消しした状態で複製する．
 * @param {string} id - idで指定した要素を初期化できる．defaultは'mytable'．
 */
export function clear_myTable(id='mytable') {
  let parent = document.getElementById(id);
  if ('cloneNode' in parent) {
    const cloneParent = parent.cloneNode(false); //外側だけ複製
    parent.parentNode.replaceChild(cloneParent, parent);
  }
}


export async function caluculateBalance(nowItem, attribute) {
  let error = false;
  let name = 'none';
  let uid = null;
  if (attribute==='parent') {
    name = nowItem.fromWhom.name;
    uid = nowItem.fromWhom.uid;
  }
  else { // attribute='child'のとき
    name = nowItem.forWhom.name;
    uid = nowItem.forWhom.uid;
  }
  let message = '正常に'+ name +'の残高を更新しました．';
  const ref = doc(fireStore, "users", uid);
  const querySnapshot = await getDoc(ref);
  const balance = querySnapshot.data().balance;
  if (nowItem.tradeType === 'plus') {
    try {
      await updateDoc(ref, {
        balance: Math.floor(Number(balance) + Number(nowItem.price))
      })
      .then(delete_items('freeTrades', [nowItem]))
    }
    catch (e) {
      error = true;
      message = e;
      console.log(e);
    }
  }
  else if (nowItem.tradeType === 'minus') {
    try {
      await updateDoc(ref, {
        balance: Math.floor(Number(balance) - Number(nowItem.price))
      })
      .then(delete_items('freeTrades', [nowItem]))
    }
    catch (e) {
      error = true;
      message = e;
      console.log(e);
    }
  }
  return {error, message}
}

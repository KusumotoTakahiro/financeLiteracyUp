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
  if (check_content_is_duplicate(modified_data)) {
    error = true;
    message = '入力に重複する内容が含まれています．';
  }
  else {
    //ここに空白チェック関数を入れる．
    if (check_missing_entries_myTable(modified_data)) {
      error = true;
      message = '入力に漏れがあります．'
    }
    else {
      /**
       * firebaseでユーザーのログイン状態を監視し，結果が格納される．
       * @type {Object} user 
       */
      const user = await authStateChanged();
      await create_and_update_by_myTable(user, subject, original_data, modified_data)
      .then(async created_updated => {
        if (!created_updated.error) {
          await delete_by_myTable(user, subject, original_data, modified_data)
          .then(deleted => {
            if (deleted.error) {
              error = true;
              message = deleted.message;
            }
          })
        }
        error = created_updated.error;
        message = created_updated.message;
      })
    }
  }
  return {error, message};
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
 * 一括編集機能として，「DB上の保存済みデータとmyTableの差分を新規追加または報酬のみ変更」する関数.
 * @param {Object} user
 * @param {string} subject - 対象がworksなのかshopsなのかfinesなのか．
 * @param {Array<Work>} original_data - DB上のWorkに登録されているデータ．
 * @param {Array<TableRow>} modified_data - myTableに記録されているデータ．
 * @returns {Object} - data_check()の結果とmessageを返す.
 * @property {Boolean} can_finish_successfully - 問題なければTrue，あればFalse
 * @property {string} message - ユーザ向けの通知文
 */
async function create_and_update_by_myTable(user, subject, original_data, modified_data) {
  /**
   * 途中でdata_check()に引っかかったかどうかを判定するフラグ
   * @type {Boolean} error
   */
  let error = false;
  /**
   * ユーザ向けの通知文
   * @type {string} message
   */
  let message = '正常に更新しました';
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

      // modified_contentがもともと有ったcontentなのかを調べている．
      if (modified_content === original_content) {
        modified_content_isExist = true;
        // priceのみが変更されている場合.それ以外はそのまま．
        if (original_price !== modified_price) {
          const result = data_check(original_content, modified_price)
          if (!result.error) {
            await update_item(user, subject, original_data[j].id, original_content, modified_price);
          }
          else {
            error = true;
            message = result.message;
            break;
          }
        }
      }
    }
    // myTableにしか載っていないcontentを新規データとしてDBに登録する
    if (!modified_content_isExist) {
      // 既に空白チェック済みなので，contentが空白かどうかをみれば，両方が空白かどうかは判断がつく．
      if (!(modified_content.trim() === '')) {
        const result = data_check(modified_content, modified_price);
        if (!result.error) {
          await create_item(user, subject, modified_content, modified_price);
        }
        else {
          error = true;
          message = result.message;
          break;
        }
      }
    }
  }
  return {error, message};
}


/**
 * DB内の既存contentのpriceを修正する関数.
 * @param {String} docid - documentID．DB上での保存場所を一意に指定している．
 * @param {Object} user - 現在ログインしているuserの情報
 * @param {String} subject - 現在変更対象のDB上のcollection(WorksやShopなど)
 * @param {Number} newPrice - 更新する（修正する金額）
 * @param {String} nowContent - 更新対象のcontent
 */
async function update_item(user, subject, docid, nowContent, newPrice) {
  try {
    await getContentDocRef(user, subject, docid)
    .then(docRef => {
      updateDoc(docRef, { price: newPrice })
    })
  }
  catch(e) {
    const error_message = '『'+String(e) + '』が発生しました';
  }
}


/**
 * DB上にcontentとpriceの組で一つ登録する関数.
 * @param {Object} user 
 * @param {string} subject 
 * @param {string} newContent 
 * @param {number} newPrice 
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
      console.log(e);
      message = '『'+String(e) + '』が発生しました';
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
 * @returns {Object}
 * @property {boolean} error
 * @property {string} message
 */
async function delete_by_myTable(user, subject, original_data, modified_data) {
  let error = false;
  let message = '';
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
        message = '『'+String(e) + '』が発生しました';
        error = true;
      }
    }
  }
  return {error, message};
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
      message(error_message, 3)
    }
  })
  return items;
}


/**
 * DBの登録前にcontent(内容)とprice(報酬)の入力内容に関して，
 * content，priceの記入漏れチェック,
 * contentが1文字でないか,
 * 金額入力時の半角チェックを行う関数
 * @param {String} content - 内容であり，短すぎる（一文字）のものはエラーで変えす．
 * @param {Number} price - 半角数字のみを許容する．かつ金額の限度は決めてない．
 * @returns {Object} - 問題なければerror=falseを返す．問題があればerror=trueを返す． 
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
 * DBの登録前にcontetnとpriceの入力内容をチェックする関数
 * @param {String} content 
 * @param {Number} price 
 * @returns {boolean} - 記入漏れがないかをtrue,falseで返す
 */
function is_written(content, price) {
  let ok = true;
  if (!content) {
    ok = false;
  }
  if (!price) {
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
export function create_myTable(datas_from_DB, table_columns, subject) {
  //datas_from_DBからmyTable_dataを形成(または,再形成)
  let table_data = [];
  for (let i = 0; i < datas_from_DB.length; i++) {
    const item = datas_from_DB[i];
    table_data.push([item.content, item.price]);
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
      {type: 'i', content: 'save', onclick: ()=>Ebus('res', 'save')},
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

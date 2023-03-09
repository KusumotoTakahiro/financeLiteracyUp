/**
  * DB上のWorkで保存されているObject型の詳細
  * @typedef {Object} Work
  * @property {string} content - お仕事の内容
  * @property {number} price - お仕事の報酬
  * @property {string} id - お仕事のfirebaseDB上のDocumentID
*/

/**
 * JspreadSheet内でTableに保存されているArray型.一行単位で保存される．
 * @typedef {[string, number]} TableRow
 * @description TableRowは，2つの要素を持っています．最初の要素がお仕事の内容（string)で，二番目の要素がお仕事の報酬（price）です．
 */
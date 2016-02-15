/*
 * Returns value of nested attribute within object by string reference
 *
 * e.g. Object.valueByString(object, 'childArrayOfObjects[1].name');
 *
 * From http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key 
*/
Object.valueByString = function(o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, '');           // strip a leading dot
  var a = s.split('.');
  for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
          o = o[k];
      } else {
          return;
      }
  }
  return o;
}
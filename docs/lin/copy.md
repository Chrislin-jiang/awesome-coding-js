第二十二篇: JS中浅拷贝的手段有哪些？
重要: 什么是拷贝？
首先来直观的感受一下什么是拷贝。
let arr = [1, 2, 3];
let newArr = arr;
newArr[0] = 100;

console.log(arr);//[100, 2, 3]
复制代码
这是直接赋值的情况，不涉及任何拷贝。当改变newArr的时候，由于是同一个引用，arr指向的值也跟着改变。
现在进行浅拷贝:
let arr = [1, 2, 3];
let newArr = arr.slice();
newArr[0] = 100;

console.log(arr);//[1, 2, 3]
复制代码
当修改newArr的时候，arr的值并不改变。什么原因?因为这里newArr是arr浅拷贝后的结果，newArr和arr现在引用的已经不是同一块空间啦！
这就是浅拷贝！
但是这又会带来一个潜在的问题:
let arr = [1, 2, {val: 4}];
let newArr = arr.slice();
newArr[2].val = 1000;

console.log(arr);//[ 1, 2, { val: 1000 } ]
复制代码
咦!不是已经不是同一块空间的引用了吗？为什么改变了newArr改变了第二个元素的val值，arr也跟着变了。
这就是浅拷贝的限制所在了。它只能拷贝一层对象。如果有对象的嵌套，那么浅拷贝将无能为力。但幸运的是，深拷贝就是为了解决这个问题而生的，它能
解决无限极的对象嵌套问题，实现彻底的拷贝。当然，这是我们下一篇的重点。 现在先让大家有一个基本的概念。
接下来，我们来研究一下JS中实现浅拷贝到底有多少种方式？
1. 手动实现
const shallowClone = (target) => {
  if (typeof target === 'object' && target !== null) {
    const cloneTarget = Array.isArray(target) ? []: {};
    for (let prop in target) {
      if (target.hasOwnProperty(prop)) {
          cloneTarget[prop] = target[prop];
      }
    }
    return cloneTarget;
  } else {
    return target;
  }
}
复制代码
2. Object.assign
但是需要注意的是，Object.assgin() 拷贝的是对象的属性的引用，而不是对象本身。
let obj = { name: 'sy', age: 18 };
const obj2 = Object.assign({}, obj, {name: 'sss'});
console.log(obj2);//{ name: 'sss', age: 18 }
复制代码
3. concat浅拷贝数组
let arr = [1, 2, 3];
let newArr = arr.concat();
newArr[1] = 100;
console.log(arr);//[ 1, 2, 3 ]
复制代码
4. slice浅拷贝
开头的例子不就说的这个嘛！
5. ...展开运算符
let arr = [1, 2, 3];
let newArr = [...arr];//跟arr.slice()是一样的效果
复制代码
第二十三篇: 能不能写一个完整的深拷贝？
上一篇已经解释了什么是深拷贝，现在我们来一起实现一个完整且专业的深拷贝。
1. 简易版及问题
JSON.parse(JSON.stringify());
复制代码
估计这个api能覆盖大多数的应用场景，没错，谈到深拷贝，我第一个想到的也是它。但是实际上，对于某些严格的场景来说，这个方法是有巨大的坑的。问题如下：


无法解决循环引用的问题。举个例子：


const a = {val:2};
a.target = a;
复制代码
拷贝a会出现系统栈溢出，因为出现了无限递归的情况。


无法拷贝一写特殊的对象，诸如 RegExp, Date, Set, Map等。




无法拷贝函数(划重点)。


因此这个api先pass掉，我们重新写一个深拷贝，简易版如下:
const deepClone = (target) => {
  if (typeof target === 'object' && target !== null) {
    const cloneTarget = Array.isArray(target) ? []: {};
    for (let prop in target) {
      if (target.hasOwnProperty(prop)) {
          cloneTarget[prop] = deepClone(target[prop]);
      }
    }
    return cloneTarget;
  } else {
    return target;
  }
}
复制代码
现在，我们以刚刚发现的三个问题为导向，一步步来完善、优化我们的深拷贝代码。
2. 解决循环引用
现在问题如下:
let obj = {val : 100};
obj.target = obj;

deepClone(obj);//报错: RangeError: Maximum call stack size exceeded
复制代码
这就是循环引用。我们怎么来解决这个问题呢？
创建一个Map。记录下已经拷贝过的对象，如果说已经拷贝过，那直接返回它行了。
const isObject = (target) => (typeof target === 'object' || typeof target === 'function') && target !== null;

const deepClone = (target, map = new Map()) => { 
  if(map.get(target))  
    return target; 
 
 
  if (isObject(target)) { 
    map.set(target, true); 
    const cloneTarget = Array.isArray(target) ? []: {}; 
    for (let prop in target) { 
      if (target.hasOwnProperty(prop)) { 
          cloneTarget[prop] = deepClone(target[prop],map); 
      } 
    } 
    return cloneTarget; 
  } else { 
    return target; 
  } 
}
复制代码
现在来试一试：
const a = {val:2};
a.target = a;
let newA = deepClone(a);
console.log(newA)//{ val: 2, target: { val: 2, target: [Circular] } }
复制代码
好像是没有问题了, 拷贝也完成了。但还是有一个潜在的坑, 就是map 上的 key 和 map 构成了强引用关系，这是相当危险的。我给你解释一下与之相对的弱引用的概念你就明白了：

在计算机程序设计中，弱引用与强引用相对，

是指不能确保其引用的对象不会被垃圾回收器回收的引用。 一个对象若只被弱引用所引用，则被认为是不可访问（或弱可访问）的，并因此可能在任何时刻被回收。 --百度百科
说的有一点绕，我用大白话解释一下，被弱引用的对象可以在任何时候被回收，而对于强引用来说，只要这个强引用还在，那么对象无法被回收。拿上面的例子说，map 和 a一直是强引用的关系，
在程序结束之前，a 所占的内存空间一直不会被释放。
怎么解决这个问题？
很简单，让 map 的 key 和 map 构成弱引用即可。ES6给我们提供了这样的数据结构，它的名字叫WeakMap，它是一种特殊的Map, 其中的键是弱引用的。其键必须是对象，而值可以是任意的。
稍微改造一下即可:
const deepClone = (target, map = new WeakMap()) => {
  //...
}
复制代码
3. 拷贝特殊对象
可继续遍历
对于特殊的对象，我们使用以下方式来鉴别:
Object.prototype.toString.call(obj);
复制代码
梳理一下对于可遍历对象会有什么结果：
["object Map"]
["object Set"]
["object Array"]
["object Object"]
["object Arguments"]
复制代码
好，以这些不同的字符串为依据，我们就可以成功地鉴别这些对象。
const getType = Object.prototype.toString.call(obj);

const canTraverse = {
  '[object Map]': true,
  '[object Set]': true,
  '[object Array]': true,
  '[object Object]': true,
  '[object Arguments]': true,
};

const deepClone = (target, map = new Map()) => {
  if(!isObject(target)) 
    return target;
  let type = getType(target);
  let cloneTarget;
  if(!canTraverse[type]) {
    // 处理不能遍历的对象
    return;
  }else {
    // 这波操作相当关键，可以保证对象的原型不丢失！
    let ctor = target.prototype;
    cloneTarget = new ctor();
  }

  if(map.get(target)) 
    return target;
  map.put(target, true);

  if(type === mapTag) {
    //处理Map
    target.forEach((item, key) => {
      cloneTarget.set(deepClone(key), deepClone(item));
    })
  }
  
  if(type === setTag) {
    //处理Set
    target.forEach(item => {
      target.add(deepClone(item));
    })
  }

  // 处理数组和对象
  for (let prop in target) {
    if (target.hasOwnProperty(prop)) {
        cloneTarget[prop] = deepClone(target[prop]);
    }
  }
  return cloneTarget;
}
复制代码
不可遍历的对象
const boolTag = '[object Boolean]';
const numberTag = '[object Number]';
const stringTag = '[object String]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const regexpTag = '[object RegExp]';
const funcTag = '[object Function]';
复制代码
对于不可遍历的对象，不同的对象有不同的处理。
const handleRegExp = (target) => {
  const { source, flags } = target;
  return new target.constructor(source, flags);
}

const handleFunc = (target) => {
  // 待会的重点部分
}

const handleNotTraverse = (target, tag) => {
  const Ctor = targe.constructor;
  switch(tag) {
    case boolTag:
    case numberTag:
    case stringTag:
    case errorTag: 
    case dateTag:
      return new Ctor(target);
    case regexpTag:
      return handleRegExp(target);
    case funcTag:
      return handleFunc(target);
    default:
      return new Ctor(target);
  }
}
复制代码
4. 拷贝函数
虽然函数也是对象，但是它过于特殊，我们单独把它拿出来拆解。
提到函数，在JS种有两种函数，一种是普通函数，另一种是箭头函数。每个普通函数都是
Function的实例，而箭头函数不是任何类的实例，每次调用都是不一样的引用。那我们只需要
处理普通函数的情况，箭头函数直接返回它本身就好了。
那么如何来区分两者呢？
答案是: 利用原型。箭头函数是不存在原型的。
代码如下:
const handleFunc = (func) => {
  // 箭头函数直接返回自身
  if(!func.prototype) return func;
  const bodyReg = /(?<={)(.|\n)+(?=})/m;
  const paramReg = /(?<=\().+(?=\)\s+{)/;
  const funcString = func.toString();
  // 分别匹配 函数参数 和 函数体
  const param = paramReg.exec(funcString);
  const body = bodyReg.exec(funcString);
  if(!body) return null;
  if (param) {
    const paramArr = param[0].split(',');
    return new Function(...paramArr, body[0]);
  } else {
    return new Function(body[0]);
  }
}
复制代码
到现在，我们的深拷贝就实现地比较完善了。不过在测试的过程中，我也发现了一个小小的bug。
5. 小小的bug
如下所示:
const target = new Boolean(false);
const Ctor = target.constructor;
new Ctor(target); // 结果为 Boolean {true} 而不是 false。
复制代码
对于这样一个bug，我们可以对 Boolean 拷贝做最简单的修改，
调用valueOf: new target.constructor(target.valueOf())。
但实际上，这种写法是不推荐的。因为在ES6后不推荐使用【new 基本类型()】这
样的语法，所以es6中的新类型 Symbol 是不能直接 new 的，只能通过 new Object(SymbelType)。
因此我们接下来统一一下:
const handleNotTraverse = (target, tag) => {
  const Ctor = targe.constructor;
  switch(tag) {
    case boolTag:
      return new Object(Boolean.prototype.valueOf.call(target));
    case numberTag:
      return new Object(Number.prototype.valueOf.call(target));
    case stringTag:
      return new Object(String.prototype.valueOf.call(target));
    case errorTag: 
    case dateTag:
      return new Ctor(target);
    case regexpTag:
      return handleRegExp(target);
    case funcTag:
      return handleFunc(target);
    default:
      return new Ctor(target);
  }
}
复制代码
6. 完整代码展示
OK!是时候给大家放出完整版的深拷贝啦:
const getType = obj => Object.prototype.toString.call(obj);

const isObject = (target) => (typeof target === 'object' || typeof target === 'function') && target !== null;

const canTraverse = {
  '[object Map]': true,
  '[object Set]': true,
  '[object Array]': true,
  '[object Object]': true,
  '[object Arguments]': true,
};
const mapTag = '[object Map]';
const setTag = '[object Set]';
const boolTag = '[object Boolean]';
const numberTag = '[object Number]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const regexpTag = '[object RegExp]';
const funcTag = '[object Function]';

const handleRegExp = (target) => {
  const { source, flags } = target;
  return new target.constructor(source, flags);
}

const handleFunc = (func) => {
  // 箭头函数直接返回自身
  if(!func.prototype) return func;
  const bodyReg = /(?<={)(.|\n)+(?=})/m;
  const paramReg = /(?<=\().+(?=\)\s+{)/;
  const funcString = func.toString();
  // 分别匹配 函数参数 和 函数体
  const param = paramReg.exec(funcString);
  const body = bodyReg.exec(funcString);
  if(!body) return null;
  if (param) {
    const paramArr = param[0].split(',');
    return new Function(...paramArr, body[0]);
  } else {
    return new Function(body[0]);
  }
}

const handleNotTraverse = (target, tag) => {
  const Ctor = target.constructor;
  switch(tag) {
    case boolTag:
      return new Object(Boolean.prototype.valueOf.call(target));
    case numberTag:
      return new Object(Number.prototype.valueOf.call(target));
    case stringTag:
      return new Object(String.prototype.valueOf.call(target));
    case symbolTag:
      return new Object(Symbol.prototype.valueOf.call(target));
    case errorTag: 
    case dateTag:
      return new Ctor(target);
    case regexpTag:
      return handleRegExp(target);
    case funcTag:
      return handleFunc(target);
    default:
      return new Ctor(target);
  }
}

const deepClone = (target, map = new WeakMap()) => {
  if(!isObject(target)) 
    return target;
  let type = getType(target);
  let cloneTarget;
  if(!canTraverse[type]) {
    // 处理不能遍历的对象
    return handleNotTraverse(target, type);
  }else {
    // 这波操作相当关键，可以保证对象的原型不丢失！
    let ctor = target.constructor;
    cloneTarget = new ctor();
  }

  if(map.get(target)) 
    return target;
  map.set(target, true);

  if(type === mapTag) {
    //处理Map
    target.forEach((item, key) => {
      cloneTarget.set(deepClone(key, map), deepClone(item, map));
    })
  }
  
  if(type === setTag) {
    //处理Set
    target.forEach(item => {
      cloneTarget.add(deepClone(item, map));
    })
  }

  // 处理数组和对象
  for (let prop in target) {
    if (target.hasOwnProperty(prop)) {
        cloneTarget[prop] = deepClone(target[prop], map);
    }
  }
  return cloneTarget;
}

作者：神三元
链接：https://juejin.cn/post/6844903986479251464
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
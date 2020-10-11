// 创建新对象，原型指向数组原型，再扩展新方法不会影响数组原型
const arrayProto = Object.create(Array.prototype);

['push', 'pop', 'shift', 'unshift', 'splice'].forEach(methodName => {
  arrayProto[methodName] = function() {
    // 触发更新视图
    updateView();

    Array.prototype[methodName].call(this, arguments);
  }
})

/*
 * 初始化监听函数 
 */
function observer(target) {
  if (typeof target !== 'object' || target === null) {
    // 不是数组或者对象不进行监听
    return target;
  }

  // 重写数组原型，因为 Object.defineProperty 无法监听数组
  if (Array.isArray(target)) {
    target.__proto__ = arrayProto;
  }

  // 重新定义各个属性（for in 也可以遍历数组）
  for (let key in target) {
    defineReactive(target, key, target[key]);
  }
}

/*
 * 监听逻辑 
 */
function defineReactive(target, key, value) {
  // 深度监听，如 data.info
  observer(value);

  // 核心 API
  Object.defineProperty(target, key, {
    get() {
      return value;
    },

    set(newValue) {
      if (newValue !== value) {
        // 深度监听，如由初始类型突然变为引用类型
        observer(newValue);

        // 设置新值，注意 value 一直在闭包中，此处设置完成后，再 get 时候也是拿到的最新值
        value = newValue;

        // 触发更新视图
        updateView();
      }
    }
  })
}

/*
 * 视图更新器
 */
function updateView() {
  console.log('更新视图')
}

// 测试数据
const data = {
  name: 'zhangsan',
  age: 20,
  info: {
    address: '杭州', // 需要深度监听,需要递归到底，一次性计算量大
  },
  nums: [10, 20, 30],
}

// 开始监听
observer(data);

// 不需要深度监听
data.name = 'allen';
// console.log('name', data.name);

// 不需要深度监听
data.age = { num: 21 };
// console.log('age.num', data.age.num);

// 不需要深度监听
data.age = { num: 23 };
// console.log('age.num', data.age.num);

// 需要深度监听
data.age.num = 22;
// console.log('age.num', data.age.num);

// 需要深度监听
data.info.address = '上海';
// console.log('info.address', data.info.address);

// 监听数组
data.nums.push(4);
// console.log('nums', data.nums);

// 无法监听新增/删除属性(Vue.set、Vue.delete)
data.city = '杭州';
delete data.name;
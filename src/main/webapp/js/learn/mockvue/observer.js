function defineReactive(data, key, value) {
    observer(value);
    let dep = new Dep();
    Object.defineProperty(data, key, {
        configurable: true,
        enumerable: true,
        get: function () {
            if ( Dep.target ) {
                dep.addSub(Dep.target);
            }
            return value;
        },
        set: function (newVal) {
            if ( newVal === value ) {
                return;
            }
            value = newVal;
            console.log("监听到属性：" + key + "已经变更，新值为：" + newVal);
            dep.notify();
        }
    });
}

Dep.target = null;

function observer(data) {
    if ( !data || typeof data != 'object' ) {
        return;
    }
    Object.keys(data).forEach(function (key) {
        defineReactive(data, key, data[key]);
    });
}

function Dep() {
    this.subs = [];
}

Dep.prototype = {
    addSub: function (sub) {
        this.subs.push(sub);
    },
    notify: function () {
        this.subs.forEach(function (sub) {
            sub.update();
        })
    }
};
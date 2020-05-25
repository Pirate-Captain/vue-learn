function SelfVue(options) {
    const self = this;
    this.data = options.data;
    this.vm = this;
    this.methods = options.methods;

    Object.keys(options.data).forEach(function (key) {
        self.proxyKeys(key);
    });

    observer(options.data);
    new Compile(options.el, this.vm);
    options.mounted.call(this);
    return this;
}

SelfVue.prototype = {
    proxyKeys: function (key) {
        const self = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function getter() {
                return self.data[key];
            },
            set: function setter(newValue) {
                self.data[key] = newValue;
            }
        });
    }
};
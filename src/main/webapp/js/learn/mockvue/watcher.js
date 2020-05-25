function Watcher(vm, watchData, executionF) {
    this.vm = vm;
    this.watchData = watchData;
    this.executionF = executionF;
    this.value = this.get();
}

Watcher.prototype = {
    update: function () {
        this.run();
    },
    run: function () {
        var value = this.vm.data[this.watchData];
        var oldValue = this.value;
        if ( value !== oldValue ) {
            this.value = value;
            this.executionF.call(this.vm, value, oldValue);
        }
    },
    get: function () {
        Dep.target = this;
        var value = this.vm.data[this.watchData];
        Dep.target = null;
        return value;
    }
};
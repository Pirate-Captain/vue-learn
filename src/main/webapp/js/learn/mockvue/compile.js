function Compile(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init();
}

Compile.prototype = {
    init : function () {
        if ( !this.el ) {
            console.log("Dom元素不存在");
            return;
        }
        this.fragment = this.nodeToFragment(this.el);
        this.compileElement(this.fragment);
        this.el.appendChild(this.fragment);
    },
    nodeToFragment: function (el) {
        let fragment = document.createDocumentFragment();
        let child = el.firstChild;
        while ( child ) {
            fragment.appendChild(child);
            child = el.firstChild;
        }
        return fragment;
    },
    compileElement : function (el) {
        let childNodes = el.childNodes;
        let self = this;
        [].slice.call(childNodes).forEach(function (node) {
            let reg =  /{{(.*)}}/;
            let text = node.textContent;

            if (self.isElementNode(node)) {
                self.compile(node);
            } else if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node, reg.exec(text)[1]);
            }

            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node);
            }
        });
    },
    compile: function(node) {
        var nodeAttrs = node.attributes;
        var self = this;
        Array.prototype.forEach.call(nodeAttrs, function(attr) {
            var attrName = attr.name;
            if (self.isDirective(attrName)) {
                var exp = attr.value;
                var dir = attrName.substring(2);
                if (self.isEventDirective(dir)) {  // 事件指令
                    self.compileEvent(node, self.vm, exp, dir);
                } else {  // v-model 指令
                    self.compileModel(node, self.vm, exp, dir);
                }
                node.removeAttribute(attrName);
            }
        });
    },
    compileText : function(node, exp) {
        let self = this;
        let innerText = this.vm.data[exp];
        this.updateText(node, innerText);
        new Watcher(this.vm, exp, function (value) {
            self.updateText(node, value);
        })
    },
    compileEvent: function (node, vm, exp, dir) {
        var eventType = dir.split(':')[1];
        var cb = vm.methods && vm.methods[exp];

        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    },
    compileModel: function (node, vm, exp, dir) {
        var self = this;
        var val = this.vm[exp];
        this.modelUpdater(node, val);
        new Watcher(this.vm, exp, function (value) {
            self.modelUpdater(node, value);
        });

        node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            self.vm[exp] = newValue;
            val = newValue;
        });
    },
    modelUpdater: function(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    },
    updateText : function(node, innerText) {
        node.textContent = typeof innerText == 'undefined' ? "" : innerText;
    },
    isDirective: function(attr) {
        return attr.indexOf('v-') === 0;
    },
    isEventDirective: function(dir) {
        return dir.indexOf('on:') === 0;
    },
    isElementNode: function (node) {
        return node.nodeType === 1;
    },
    isTextNode : function (node) {
        return node.nodeType === 3;
    }
};
var asyncComputed = function(f, options){
    options = options || {};

    var valueHolder = ko.observable(options.initialValue);
    valueHolder.loading = ko.observable(false);
    valueHolder.version = 0;

    var suspend = options.suspend || ko.observable(false);

    var computer;

    suspend.subscribe(function(v){
        if(!v){
            if(!computer){
                computer = ko.computed(function(){
                    if(!suspend.peek()){
                        valueHolder.version++;
                        var version = valueHolder.version;

                        valueHolder.loading(true);
                        f(function(data){
                            if(valueHolder.version == version){
                                valueHolder.loading(false);
                                valueHolder(data);
                            } else {
                                /* console.log("Throwing out", data, "because of non-actual"); */
                            }
                        });
                    } else {
                        computer.dispose();
                        computer = null;
                    }
                });
            }
        }
    });

    suspend.notifySubscribers(suspend());

    return valueHolder;
}
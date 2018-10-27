$(function(){
    var vm;
    ko.applyBindings(window.vm = vm = new (function(){
        var self = this;

        this.page = ko.observable();
        this.groups = ko.observable();

        this.goto = function(location){
            window.location.hash = location;
        }

        this.membersInput = ko.observable();
        this.members = ko.computed(function(){
            return (self.membersInput() || "").split(",").map(function(s){ return s.trim() }).filter(function(s){ return s.length > 0 });
        });

        this.tabuInput = ko.observable();
        this.tabu = ko.computed(function(){
            var members = self.members();
            return _.chain((self.tabuInput() || "").split(",")).map(function(s){
                var splitted = s.split("<->");
                if(splitted.length == 2){
                    var l = splitted[0].trim();
                    var r = splitted[1].trim();
                    return [[l, r], [r, l]];
                }
                splitted = s.split("->");
                if(splitted.length == 2){
                    var l = splitted[0].trim();
                    var r = splitted[1].trim();
                    return [[l, r]];
                }
                splitted = s.split("<-");
                if(splitted.length == 2){
                    var l = splitted[0].trim();
                    var r = splitted[1].trim();
                    return [[r, l]];
                }
            }).filter(_.isArray).flatten(true).filter(function(pair){
                return pair && pair[0] != pair[1] && _.contains(members, pair[0]) && _.contains(members, pair[1])
            }).value();
        });

        this.save = function(){
            var members = self.members();
            if(members.length > 1){
                $.ajax("rest/santa/save", {
                    data : JSON.stringify({members: members, tabu: self.tabu()}),
                    contentType : "application/json",
                    type : "POST",
                    success: function(data){
                        self.createdMembers(data.members);
                        self.goto("created");
                    },
                    error: function(err){
                        toastr["error"](err.responseText);
                    }
                });
            }
        }

        this.createdMembers = ko.observable();

        toastr.options = {
          "closeButton": false,
          "debug": false,
          "newestOnTop": false,
          "progressBar": false,
          "positionClass": "toast-bottom-center",
          "preventDuplicates": true,
          "onclick": null,
          "showDuration": "300",
          "hideDuration": "1000",
          "timeOut": "5000",
          "extendedTimeOut": "1000",
          "showEasing": "swing",
          "hideEasing": "linear",
          "showMethod": "fadeIn",
          "hideMethod": "fadeOut"
        }

        this.copy = function(){
            var textarea = $("<textarea>");
            textarea.text(self.createdMembers().map(function(member){
                return [member.member, " - ", member.password].join("")
            }).join("\n"));
            $("body").append(textarea);
            textarea.select();
            var success = document.execCommand("copy");
            textarea.remove();
            if(success){
                toastr["info"]("Скопировано!");
            } else {
                toastr["error"]("Не получилось скопировать:( Скопируй сам");
            }
        }

        this.password = ko.observable();
        this.join = function(){
            var password = self.password();
            if(password){
                self.goto(["join", password].join("/"));
                self.password("");
            }
        }

        this.joinPassword = asyncComputed(function(done){
            done(self.groups()[1]);
        }, { suspend: ko.computed(function(){ return !_.contains(["^join/([^/]+)$"], self.page()) }) });

        this.receiver = asyncComputed(function(done){
            done("");
            var joinPassword = self.joinPassword();
            if(joinPassword){
                $.ajax("rest/santa/getReceiver", {
                    data : JSON.stringify({password: joinPassword}),
                    contentType : "application/json",
                    type : "POST",
                    success: function(data){
                        done(data);
                    }
                });
            }
        }, {suspend: ko.computed(function(){ return !_.contains(["^join/([^/]+)$"], self.page()) })});

    })());

    $(window).on("hashchange", function(){
        $("div[data-page]").hide().each(function(i, div){
            div = $(div);
            var page = div.data("page");
            var regExp = new RegExp(page);
            var groups = regExp.exec(location.hash.substring(1));
            if(groups){
                div.show();
                vm.groups(groups);
                vm.page(page);
                return false;
            }

        });
    });
    $(window).trigger("hashchange");
});
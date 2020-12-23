(function() {
  
    document.addEventListener('DOMContentLoaded',function(){
  
      var lazyLoadNodes = document.getElementsByClassName("load-onscroll");
      var breakpoints = {};
      var waiting = false;      
            
      for (var i = 0; i < lazyLoadNodes.length; i++) {
          var node = lazyLoadNodes[i];
          var depth = node.dataset.depth ? parseInt(node.dataset.depth) : 0;
          breakpoints[depth] = Array.isArray(breakpoints[depth]) ? breakpoints[depth].push(node) : [node];
      }   
    
  
      function loadScriptsWithClass(cls) {
          var lazyLoadNodes = document.getElementsByClassName(cls);
          loadScripts(lazyLoadNodes);
      }
  
      function loadScripts(lazyLoadNodes) {
          for (var i = 0; i < lazyLoadNodes.length; i++) {
              var lazyloadNode = lazyLoadNodes[i];
              var replacement = document.createElement("div");
              replacement.innerHTML = lazyloadNode.textContent;
  
              var scriptNode = replacement.firstElementChild;
              var s = document.createElement('script');
              s.type = 'text/javascript';
              s.async = true;
              for (var j = 0; j < scriptNode.attributes.length; j++) {
                s.setAttribute(scriptNode.attributes[j].nodeName,
                                scriptNode.attributes[j].nodeValue);
              }

            if (!s.src) {
                var b = new Blob([scriptNode.innerHTML], { type: 'text/javascript' });
                var u = URL.createObjectURL(b);
                s.src = u;
                s.async = false;                
            }

              lazyloadNode.parentNode.insertBefore(s, lazyloadNode);
              lazyloadNode.parentElement.removeChild(lazyloadNode);
          }
      }
  
      function loadOnScroll() {
        throttle( function(){
                    var body = document.body,
                  html = document.documentElement,
                  docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
                  winHeight = window.innerHeight || html.clientHeight,
                  scrollTop = body.scrollTop || html.scrollTop,
                  scrollDistance = scrollTop + winHeight;
  
                  var scrollPercentage = scrollDistance/(docHeight-5)*100;
  
                  var keys = Object.keys(breakpoints);
              
                  for (var key of keys) {
                      if (key <= scrollPercentage) {
                          loadScripts(breakpoints[key]);
                          delete breakpoints[key];
                      }
                  }
                  if (Object.keys(breakpoints).length == 0) {
                      window.removeEventListener('scroll', loadOnScroll);
                  }
        },500);
                    
      }
  
      function throttle (callback, limit) {
          if (!waiting) {
            waiting = true;
            setTimeout(function () {
              waiting = false;
            }, limit);
            callback();
          }
            return;   
      }
  
  
      window.addEventListener('scroll', loadOnScroll);
  
      // Load on user action (touch / click)
      var userEvents = {
          touch: ["touchmove", "touchend"],
          mouse: ["mousemove", "click", "keydown", "scroll"]
      };
  
      function isTouch() {
          var touchIdentifiers = " -webkit- -moz- -o- -ms- ".split(" ");
          if ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch) {
              return true;
          }
          var query = ["(", touchIdentifiers.join("touch-enabled),("), "hsterminal", ")"].join("");
          return window.matchMedia(query).matches;
      }
      
      var events = isTouch() ? userEvents.touch : userEvents.mouse;
  
      function loadOnUserAction() {
          loadScriptsWithClass("load-onaction");
          //deregister all events
          events.forEach(function (userEvent) {
              document.removeEventListener(userEvent, loadOnUserAction);
          });
      }
  
      events.forEach(function (userEvent) {
          document.addEventListener(userEvent, loadOnUserAction);
      });
      
    
    });
  
  
})();
  
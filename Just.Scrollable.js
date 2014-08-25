/**
 * JustJS Scrollable
 *
 * This components transforms every properly formatted DOM-Element into a scrollable stage
 */
JustJS.Scrollable = {
    Stage: Base.extend({
        domElem:    null,
        currentIdx: 0,
        scrollable: null,
        working:    false,
        buttons:    [],
        constructor: function( domElem ) {
            if(domElem.children.length > 0) {
                if(domElem.children[0].children.length > 0) {
                    var width = 0;
                    // determine width of the scrollable object
                    for(var i = 0; i < domElem.children[0].children.length; i++) {
                        width += JustJS.dom.outerWidth(domElem.children[0].children[i], true);
                    }
                    // if the scrollable container is wider than the stage, enable scrolling
                    if(domElem.clientWidth < width) {
                        domElem.children[0].style.width = width + 'px';

                        // wrap the scrollable object into a stage object
                        var stage           = document.createElement('div');
                        stage.className     = 'scrollable stage';
                        stage.style.position = 'relative'; 
                        stage.innerHTML     = domElem.outerHTML;

                        var parent          = domElem.parentNode;

                        domElem.parentNode.replaceChild(stage, domElem);
                        // save references
                        this.domElem    = parent.querySelector('.scrollable.wrapper');
                        this.scrollable = this.domElem.children[0];                        

                        // button: previous
                        var previous        = document.createElement('a');
                        previous.className  = 'button previous inactive test';
                        previous.innerHTML  = '<span class="text">&laquo;</span>';
                        previous.Stage = this;
                        this.buttons[0]     = previous; 
                        stage.appendChild(previous);
                        // event handler
                        previous.addEventListener('click', this.scroll, false);
                        
                        // button: next
                        var next            = document.createElement('a');
                        next.className      = 'button next active test';
                        next.innerHTML      = '<span class="text">&raquo;</span>';
                        next.Stage          = this;
                        this.buttons[1]     = next; 
                        stage.appendChild(next);
                        next.addEventListener('click', this.scroll, false);
                    }
                }
            }
        },
        scroll: function( e ) {
            var node, nextNode = null;
            if (e.srcElement)   node = e.srcElement;
            else if (e.target)  node = e.target;

            if(node !== null) {
                // workaround to get the link node
                while(node.nodeName !== 'A') {
                    if(node.parentNode.nodeName !== 'BODY') {
                        node = node.parentNode;
                    } else {
                        break;
                    }
                }
                if(node.nodeName === 'A' && node.Stage && node.Stage.working === false) {
                    node.Stage.working = true;

                    var stageWidth  = JustJS.dom.outerWidth( node.Stage.domElem );
                    var offset      = JustJS.dom.getPropertyAsPixelValue( node.Stage.scrollable, 'left' );
                    var visible     = 0;

                    for(var i = node.Stage.currentIdx; i < node.Stage.scrollable.children.length; i++) {
                        if((JustJS.dom.outerWidth( node.Stage.scrollable.children[i] ) + node.Stage.scrollable.children[i].offsetLeft + offset)
                                <= stageWidth) {
                            visible++;
                        } else {
                            break;
                        }
                    }

                    // scroll left
                    if(JustJS.dom.hasClass(node, 'previous')) {
                        // one element, partially visible
                        if(visible === 0) {

                        // all other cases
                        } else {
                            if(node.Stage.currentIdx > 0) {
                                var scrollWidth = 0;
                                if(node.Stage.currentIdx == 1
                                    && (node.Stage.scrollable.children[0].offsetLeft + JustJS.dom.outerWidth(node.Stage.scrollable.children[0])) > -offset) {
                                    scrollWidth = -offset;
                                } else {
                                    scrollWidth = JustJS.dom.outerWidth(node.Stage.scrollable.children[node.Stage.currentIdx], true);    
                                }

                                JustJS.fx.animate( node.Stage.scrollable, { left: '+='+scrollWidth }, { duration: 200 } );
                                node.Stage.currentIdx--;
                                // show/hide buttons
                                if(node.Stage.currentIdx === 0) {
                                    JustJS.dom.removeClass(node.Stage.buttons[0], 'active');
                                    JustJS.dom.addClass(node.Stage.buttons[0], 'inactive');
                                } else {
                                    if(JustJS.dom.hasClass(node.Stage.buttons[1], 'inactive')) {
                                        JustJS.dom.removeClass(node.Stage.buttons[1], 'inactive');
                                        JustJS.dom.addClass(node.Stage.buttons[1], 'active');
                                    }
                                }
                            }
                        }
                    // scroll right
                    } else if(JustJS.dom.hasClass(node, 'next')) {
                        var lastIdx     = node.Stage.scrollable.children.length-1;
                        var scrollWidth = 0; 
                        // one element, partially visible
                        if(visible === 0) {

                        // all other cases
                        } else {
                            if(node.Stage.currentIdx + visible < node.Stage.scrollable.children.length) {
                                if(node.Stage.currentIdx+visible == lastIdx
                                    && (node.Stage.scrollable.children[lastIdx].offsetLeft + offset) <= stageWidth ) {
                                    // if the last element is partially visible, scroll to show it fully
                                    scrollWidth = JustJS.dom.getPropertyAsPixelValue( node.Stage.scrollable, 'width' ) + offset - stageWidth;
                                } else {
                                    scrollWidth = node.Stage.scrollable.children[node.Stage.currentIdx+1].offsetLeft - node.Stage.scrollable.children[node.Stage.currentIdx].offsetLeft;
                                }
                                JustJS.fx.animate( node.Stage.scrollable, { left: '-='+scrollWidth }, { duration: 200 } );
                                node.Stage.currentIdx++;
                                // show/hide buttons
                                if(node.Stage.currentIdx+visible === node.Stage.scrollable.children.length) {
                                        JustJS.dom.removeClass(node.Stage.buttons[1], 'active');
                                        JustJS.dom.addClass(node.Stage.buttons[1], 'inactive');
                                } else {
                                    if(JustJS.dom.hasClass(node.Stage.buttons[0], 'inactive')) {
                                        JustJS.dom.removeClass(node.Stage.buttons[0], 'inactive');
                                        JustJS.dom.addClass(node.Stage.buttons[0], 'active');
                                    }
                                }
                            }
                        }
                    }
                    node.Stage.working = false;
                }
            }
        },
    }),
    init: function() {
        elements = document.querySelectorAll('.scrollable.wrapper');
        for(var i = 0; i < elements.length; i++) {
            new JustJS.Scrollable.Stage( elements[i] );
        }
    }
};

JustJS.ready(function() {
    JustJS.Scrollable.init();
})
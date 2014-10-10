/**
 * JustJS SimpleGallery, version 0.1, Copyright 2014 by Daniel Schlessmann <info@eldanilo.de>
 * License: http://www.opensource.org/licenses/mit-license.php
 */
JustJS.SimpleGallery = {
    /**
     * Holds galleries as array in the SimpleGallery Object
     * @type {Array}
     */
    galleries: [],
    /**
     * Gallery Class
     */
    Gallery: Base.extend({
        id:     null,
        images: [],
        showLabels: false,
        showQuickNavigation: false,
        /**
         * @param  {integer}    id          Resource id of the SimpleGalleryContainer
         * @param  {Array}      images      Images for this gallery as array
         * @param  {boolean}    showLabels  Determines if the gallery should show labels in the DOM
         */
        constructor: function( id, images ) {
            this.id         = id;
            this.images     = images;
        }
    }),
    /**
     * Image Class
     */
    Image: Base.extend({
        id:             null,
        title:          '',
        description:    '',
        url:            '',
        object:         null,
        parent:         null,
        /**
         * @param  {integer}    id
         * @param  {string}     title       
         * @param  {string}     description
         * @param  {string}     url
         */
        constructor: function( id, title, description, url ) {
            this.id             = id;
            this.title          = title;
            this.description    = description;
            this.url            = url;
        }
    }),
    /**
     * Superclass for all DOM-Galleries
     *
     * @param  {SimpleGallery.Gallery}    gallery
     */
    GalleryDomObject: Base.extend({
        gallery:        null,
        domNode:        null,
        container:      null,
        containerHeight:null,
        stage:          null,
        objects:        [],
        active:         0,
        switching:      false,
        constructor:    function( gallery ) {
            this.gallery        = gallery;
            this.domNode        = document.querySelector('.simplegallery[data-simplegallery="'+gallery.id+'"]');
            if(JustJS.dom.hasClass( this.domNode, 'show-titles' )) {
                this.gallery.showLabels = true;
            }
            if(JustJS.dom.hasClass( this.domNode, 'show-quicknav' )) {
                this.gallery.showQuickNavigation = true;
            }
            this.container      = this.domNode.querySelector('.simplegallery-container');
            this.containerHeight= JustJS.dom.innerHeight( this.container );
            this.stage          = this.container.querySelector('.simplegallery-content');
            this.objects        = this.stage.children;
            // prepare container and stage
            this.stage.style.width      = JustJS.dom.innerWidth( this.container ) * 3 +'px';
            this.stage.style.position   = 'absolute';
            this.stage.style.left       = -JustJS.dom.innerWidth( this.container )+'px';
        },
        loadImage: function( index, image ) {
            // we use == as comparison operator on purpose!
            if(image == null) {
                image = new Image();
            }
            image.onload                = this.imageLoadedHandler;
            image.title                 = this.gallery.images[index].title;
            image.alt                   = this.gallery.images[index].title;
            image.style.display         = 'none';
            image.GalleryDomObject      = this;
            image.SimpleGalleryIndex    = index;
            image.SimpleGalleryImage    = this.gallery.images[index];
            if (/^https?:\/\//i.test(this.gallery.images[index].url)) {
                image.src = this.gallery.images[index].url;
            } else {
                image.src = './' + this.gallery.images[index].url;
            }
            return image;
        },
        imageLoadedHandler: function( e ) {
            // dummy function, which should be overwritten in child classes
        }
    }),
    addGallery: function ( id, images ) {
        JustJS.SimpleGallery.galleries[id] = new JustJS.SimpleGallery.Gallery( id, JustJS.SimpleGallery.parseImagesFromJson(images) );
    },
    parseImagesFromJson: function ( json ) {
        var imgs = [];
        if(Object.prototype.toString.call( json ) === '[object Array]') {
            for(var i = 0; i < json.length; i++) {
                imgs.push( new JustJS.SimpleGallery.Image( json[i].id, json[i].title, json[i].description, json[i].image ));
            }
        }
        return imgs;
    },
    init: function() {
        var nodes = document.querySelectorAll('.simplegallery[data-simplegallery]');

        for(var i = 0; i < nodes.length; i++) {
            var id = nodes[i].getAttribute('data-simplegallery');
            if(id !== null && id !== '') {
                var gallery = null;

                if( JustJS.SimpleGallery.galleries[id] ) {
                    gallery = JustJS.SimpleGallery.galleries[id];
                } else {
                    gallery = JustJS.SimpleGallery.galleries[id] = new JustJS.SimpleGallery.Gallery( id, [] );;
                }

                if(gallery !== null) {
                    if( JustJS.dom.hasClass( nodes[i], 'image-slider') ) {
                        new JustJS.SimpleGallery.ImageSlider( gallery );
                    } else if( JustJS.dom.hasClass( nodes[i], 'image-carousel' ) ) {
                        new JustJS.SimpleGallery.ImageCarousel( gallery );
                    }
                }
            }
        }
    }
};

/**
 * ImageSlider definition
 */
JustJS.SimpleGallery.ImageSlider = JustJS.SimpleGallery.GalleryDomObject.extend({
    linkPrev:       null,
    linkNext:       null,
     constructor: function( gallery ) {
        // call superclass constructor
        this.base( gallery );

        this.linkPrev = this.domNode.querySelector('.link.prev');
        this.linkNext = this.domNode.querySelector('.link.next');
        // add navigation handlers 
        this.linkPrev.ImageSlider = this;
        this.linkPrev.addEventListener('click', this.slideLeft, false);
        this.linkNext.ImageSlider = this;
        this.linkNext.addEventListener('click', this.slideRight, false);
        this.init();
    },
    init: function() {
        if(this.objects.length > 0) {
            // to be done
        } else {
            var sliderStageNodeName = this.stage.nodeName;

            if(this.gallery.images.length > 0) {
                // create domnodes for all images
                for(var i = 0; i < this.gallery.images.length; i++) {
                    if(sliderStageNodeName === 'UL') {
                        var node = document.createElement('li');
                        node.className      = 'loading';
                        node.style.position = 'absolute';
                        node.style.left     = (i === 0 ? JustJS.dom.innerWidth( this.container ) +'px' : '0px');
                        node.style.width    = JustJS.dom.innerWidth( this.container ) + 'px';
                        node.innerHTML = '<span class="title"></span>';

                        this.gallery.images[i].parent = node;
                        this.stage.appendChild(node);
                    }
                    // load images: first, first+1 and last
                    if(i === 0 || i === 1 || i === this.gallery.images.length-1) {
                        this.gallery.images[i].object = this.loadImage( i, this.gallery.images[i].object );
                    }
                }
            }
        }
    },
    imageLoadedHandler: function( e ) {
        // this => img
        var i       = this.SimpleGalleryIndex;
        var that    = this;
        if( JustJS.dom.hasClass(this.SimpleGalleryImage.parent, 'loading') ) {
            this.SimpleGalleryImage.parent.appendChild(this.SimpleGalleryImage.object);
            JustJS.dom.removeClass( this.SimpleGalleryImage.parent, 'loading' );
            if(this.GalleryDomObject.gallery.showLabels) {
                this.SimpleGalleryImage.parent.querySelector('.title').innerHTML = this.SimpleGalleryImage.title;
            }

            if(this.SimpleGalleryImage.object.height === 0) {
                if(typeof this.SimpleGalleryImage.object.naturalHeight === 'undefined') {
                    var img = new Image();
                    img.src = this.SimpleGalleryImage.object.src;
                    this.SimpleGalleryImage.object.height = img.height;
                } else {
                    this.SimpleGalleryImage.object.height = this.SimpleGalleryImage.object.naturalHeight;
                }
            }
            
            this.SimpleGalleryImage.object.style.position   = 'relative';
            this.SimpleGalleryImage.object.style.top        = '50%';
            this.SimpleGalleryImage.object.style.marginTop  = -parseInt(Math.ceil((this.SimpleGalleryImage.object.height/2)), 10)+'px';

            if(this.SimpleGalleryIndex === this.GalleryDomObject.active && !this.GalleryDomObject.switching) {
                if(this.height > this.GalleryDomObject.containerHeight) {
                    this.GalleryDomObject.containerHeight = this.height;
                }
                JustJS.fx.animate( this.GalleryDomObject.container, {
                    height: this.GalleryDomObject.containerHeight
                },{
                    easing:     'swing',
                    duration:   600,
                    complete: function() {
                        JustJS.fx.fadeIn(that.SimpleGalleryImage.object, {
                            easing:     'swing',
                            duration:   600,
                            complete: function() {
                                that.GalleryDomObject.toggleNavigation(that.GalleryDomObject);
                            }
                        });
                        if(that.GalleryDomObject.gallery.showLabels) {
                            JustJS.fx.fadeIn(that.SimpleGalleryImage.parent.querySelector('.title'), {
                                duration: 600
                            });
                        }
                    }
                });
            } else {
                this.SimpleGalleryImage.object.style.display = 'inline';
            }
        }
    },
    toggleNavigation: function(object) {
        if(object.gallery.images.length > 1) {
            JustJS.fx.fadeIn(object.linkNext, { duration: 100 });
            JustJS.fx.fadeIn(object.linkPrev, { duration: 100 });
        }
    },
    slideLeft: function( e ) {
        var node = null;
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
            if(node.nodeName === 'A' && node.ImageSlider) {
                var ImageSlider     = node.ImageSlider;
                if(ImageSlider.switching === false) {
                    ImageSlider.switching = true;
                    var active      = ImageSlider.gallery.images[ImageSlider.active];
                    var prevIndex   = ImageSlider.active > 0 ? ImageSlider.active - 1 : ImageSlider.gallery.images.length - 1;
                    var prev        = ImageSlider.gallery.images[prevIndex];
                    var prevOfPrevIdx = prevIndex > 0 ? prevIndex - 1 : ImageSlider.gallery.images.length - 1;
                    var prevOfPrev  = ImageSlider.gallery.images[prevOfPrevIdx];
                    // preload predecessor of predecessor if not loaded
                    // we have to use == as comparison on purpose
                    if(ImageSlider.gallery.images[prevOfPrevIdx].object == null) {
                        ImageSlider.gallery.images[prevOfPrevIdx].object = ImageSlider.loadImage( prevOfPrevIdx, null );
                    }
                    // move previous image left of stage
                    prev.parent.style.left = '0';
                    // slide both, active and previous right
                    active.parent.querySelector('.title').style.display = 'none';

                    JustJS.fx.animate(active.parent, {
                        left: JustJS.dom.innerWidth( ImageSlider.container ) * 2 
                    },{ 
                        easing:     'swing',
                        duration:   450 
                    });

                    JustJS.fx.animate(prev.parent, {
                        left: JustJS.dom.innerWidth( ImageSlider.container ) 
                    },{ 
                        easing:     'swing',
                        duration:   450,
                        complete:   function() {
                            if( !JustJS.dom.hasClass( prev.parent, 'loading' )) {
                                if(ImageSlider.gallery.showLabels) {
                                    JustJS.fx.fadeIn( prev.parent.querySelector('.title'),
                                    { 
                                            duration: 400 
                                    });
                                }
                                if(prev.object.height > ImageSlider.containerHeight) {
                                    ImageSlider.containerHeight = prev.object.height;
                                    JustJS.fx.animate(ImageSlider.container, {
                                        height: ImageSlider.containerHeight
                                    },{
                                        duration: 700
                                    });
                                }
                            }
                            ImageSlider.active = prevIndex;
                            ImageSlider.switching = false;
                        }
                    });
                }
            }
        }
    },
    slideRight: function( e ) {
        var node = null;
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
            if(node.nodeName === 'A' && node.ImageSlider) {
                var ImageSlider     = node.ImageSlider;
                if(ImageSlider.switching === false) {
                    ImageSlider.switching = true;
                    var active      = ImageSlider.gallery.images[ImageSlider.active];
                    var nextIndex   = ImageSlider.active < ImageSlider.gallery.images.length-1 ? ImageSlider.active + 1 : 0;
                    var next        = ImageSlider.gallery.images[nextIndex];
                    var nextOfNextIdx = nextIndex < ImageSlider.gallery.images.length-1 ? nextIndex + 1 : 0;
                    var nextOfNext  = ImageSlider.gallery.images[nextOfNextIdx];
                    // preload successor of successor if not loaded
                    // we have to use == as comparison on purpose
                    if(ImageSlider.gallery.images[nextOfNextIdx].object == null) {
                        ImageSlider.gallery.images[nextOfNextIdx].object = ImageSlider.loadImage( nextOfNextIdx, null );
                    }
                    // move next image right of stage
                    next.parent.style.left = JustJS.dom.innerWidth( ImageSlider.container ) * 2 +'px';
                    // slide both, active and previous right
                    if(ImageSlider.gallery.showLabels) {
                        active.parent.querySelector('.title').style.display = 'none';
                    }

                    JustJS.fx.animate(active.parent, {
                        left:       0
                    },{
                        easing:     'swing',
                        duration:   450,
                    });

                    JustJS.fx.animate(next.parent, {
                        left:       JustJS.dom.innerWidth( ImageSlider.container )
                    },{
                        easing:     'swing',
                        duration:   450,
                        complete:   function() {
                            if( !JustJS.dom.hasClass(next.parent, 'loading') ) {
                                if(ImageSlider.gallery.showLabels) {
                                    JustJS.fx.fadeIn(next.parent.querySelector('.title'), {
                                        duration: 400
                                    });
                                }
                                if(next.object.height > ImageSlider.containerHeight) {
                                    ImageSlider.containerHeight = next.object.height;
                                    JustJS.fx.animate( ImageSlider.container, {
                                        height: ImageSlider.containerHeight
                                    },{
                                        duration: 700
                                    });
                                }
                            }
                            ImageSlider.active = nextIndex;
                            ImageSlider.switching = false;
                        }
                    });
                }
            }
        }
    }
});
/**
 * ImageCarousel definition
 */
JustJS.SimpleGallery.ImageCarousel = JustJS.SimpleGallery.GalleryDomObject.extend({
    navigation:     null,
    timer:          null,
    constructor:    function( gallery ) {
        this.base( gallery );
        this.init();
    },
    init: function() {
        if(this.objects.length > 0 || this.gallery.images.length > 0) {
            // create domnode for switch navigation and append to container
            this.navigation             = document.createElement('ul');
            this.navigation.className   = 'simplegallery-navigation quickswitch';
            this.navigation.style.display = 'none';
            this.container.appendChild(this.navigation);

            // parse dom objects to images and format them correctly
            if(this.objects.length > 0 && this.gallery.images.length === 0) {
                for(var i = 0; i < this.objects.length; i++) {
                    if(this.objects[i].nodeName === 'LI') {
                        this.objects[i].style.position = 'absolute';
                        this.objects[i].style.left  = JustJS.dom.innerWidth( this.container ) + 'px';
                        this.objects[i].style.width = JustJS.dom.innerWidth( this.container ) + 'px';

                        // create corresponding nav link
                        var navLink         = document.createElement('a');
                        navLink.GalleryDomObject  = this;
                        navLink.imageIndex  = i;
                        navLink.innerHTML   = '<span>'+(i+1)+'</span>';
                        navLink.addEventListener('click', this.navigationClickHandler, false);
                        var navNode         = document.createElement('li');
                        if(i === 0) {
                            navNode.className = 'active';
                        }
                        navNode.appendChild(navLink);
                        this.navigation.appendChild(navNode);

                        // parse image and title
                        var title = this.objects[i].querySelector('span.title'); 
                        var image = this.objects[i].querySelector('img');
                        if(image && title) {
                            image.style.position   = 'relative';
                            image.style.top        = '50%';
                            image.GalleryDomObject = this
                            if(image.complete) {
                                image.style.marginTop  = -parseInt(Math.ceil((image.height/2)), 10)+'px';
                            } else {
                                image.style.marginTop  = -parseInt(Math.ceil((this.containerHeight/2)), 10)+'px';
                                image.onload  = this.imageLoadedSetSizeHandler;
                            }
                            if(i === this.active) {
                                image.style.zIndex = 3;
                            }
                            if(image.height > this.containerHeight) {
                                this.containerHeight = image.height;
                                this.container.style.height = image.height + 'px';
                            }

                            this.gallery.images[i]          = new JustJS.SimpleGallery.Image(i, title.innerHTML, image.alt, image.src );
                            this.gallery.images[i].object   = image;
                            this.gallery.images[i].parent   = this.objects[i];
                        }
                    }
                }
                this.toggleNavigation(this);
                this.startAutoSwitching();
            } else if(this.gallery.images.length > 0) {
                var stageNodeName = this.stage.nodeName;

                // create domnode for switch navigation and append to container
                this.navigation             = document.createElement('ul');
                this.navigation.className   = 'simplegallery-navigation quickswitch';
                this.navigation.style.display = 'none';
                this.container.appendChild(this.navigation);

                // create domnodes for all images
                for(var i = 0; i < this.gallery.images.length; i++) {
                    if(stageNodeName === 'UL') {
                        // create image container
                        var node = document.createElement('li');
                        node.className      = 'loading';
                        node.style.position = 'absolute';
                        node.style.left     = this.container.clientWidth + 'px';
                        node.style.width    = this.container.clientWidth + 'px';
                        node.innerHTML = '<span class="title"></span>';
                        // create the corresponding element in the navigation
                        var navLink         = document.createElement('a');
                        navLink.GalleryDomObject  = this;
                        navLink.imageIndex  = i;
                        navLink.innerHTML   = '<span>'+(i+1)+'</span>';
                        navLink.addEventListener('click', this.navigationClickHandler, false);
                        var navNode         = document.createElement('li');
                        if(i === 0) {
                            navNode.className = 'active';
                        }
                        navNode.appendChild(navLink);
                        this.navigation.appendChild(navNode);

                        this.gallery.images[i].parent = node;
                        this.stage.appendChild(node);
                    }
                    this.gallery.images[i].object = this.loadImage( i, this.gallery.images[i].object );
                }                
            }
        }
    },
    imageLoadedSetSizeHandler: function( e ) {
        if(!this.style.marginTop) {
            this.style.marginTop = -parseInt(Math.ceil((this.height/2)), 10)+'px';
            if(this.height > this.GalleryDomObject.containerHeight) {
                this.GalleryDomObject.container.style.height = this.height + 'px';
                this.GalleryDomObject.containerHeight = this.height;
            }
        }
    },
    imageLoadedHandler: function( e ) {
        // this => img
        var i       = this.SimpleGalleryIndex;
        var that    = this;
        if( JustJS.dom.hasClass( this.SimpleGalleryImage.parent, 'loading') ) {
            this.SimpleGalleryImage.parent.appendChild(this.SimpleGalleryImage.object);
            JustJS.dom.removeClass( this.SimpleGalleryImage.parent, 'loading');
            if(this.GalleryDomObject.gallery.showLabels) {
                this.SimpleGalleryImage.parent.querySelector('.title').innerHTML = this.SimpleGalleryImage.title;
            }

            if(this.SimpleGalleryImage.object.height === 0) {
                if(typeof this.SimpleGalleryImage.object.naturalHeight === 'undefined') {
                    var img = new Image();
                    img.src = this.SimpleGalleryImage.object.src;
                    this.SimpleGalleryImage.object.height = img.height;
                } else {
                    this.SimpleGalleryImage.object.height = this.SimpleGalleryImage.object.naturalHeight;
                }
            }

            this.SimpleGalleryImage.object.style.position   = 'relative';
            this.SimpleGalleryImage.object.style.top        = '50%';
            this.SimpleGalleryImage.object.style.marginTop  = -parseInt(Math.ceil((this.SimpleGalleryImage.object.height/2)), 10)+'px';

            if(this.SimpleGalleryIndex === this.GalleryDomObject.active && !this.GalleryDomObject.switching) {
                if(this.height > this.GalleryDomObject.containerHeight) {
                    this.GalleryDomObject.containerHeight = this.height;
                }
                JustJS.fx.animate(this.GalleryDomObject.container, {
                    height: this.GalleryDomObject.containerHeight
                },{
                    duration: 800,
                    complete: function() {
                        JustJS.fx.fadeIn(that.SimpleGalleryImage.object, {
                            duration: 800,
                            complete: function() {
                                that.SimpleGalleryImage.object.style.zIndex = 3;
                                that.GalleryDomObject.toggleNavigation(that.GalleryDomObject);
                                that.GalleryDomObject.startAutoSwitching();
                            }
                        });
                        if(that.GalleryDomObject.gallery.showLabels) {
                            JustJS.fx.fadeIn(that.SimpleGalleryImage.parent.querySelector('.title'), {
                                duration: 800
                            });
                        }
                    }
                });
            }
        }
    },
    toggleNavigation: function(object) {
        if(object.gallery.images.length > 1 && object.gallery.showQuickNavigation) {
            JustJS.fx.fadeIn(object.navigation, { duration: 100 });
        }
    },
    navigationClickHandler: function( e ) {
        var GalleryDomObject, node = null;
        if (e.srcElement)   node = e.srcElement;
        else if (e.target)  node = e.target;
        if(node !== null) {
            while(node.nodeName !== 'A') {
                if(node.parentNode.nodeName !== 'BODY') {
                    node = node.parentNode;
                } else {
                    break;
                }
            }
            if(node.nodeName === 'A' && node.GalleryDomObject) {
                node.GalleryDomObject.switchImage( node.imageIndex, false );
                node.addEventListener('mouseout', node.GalleryDomObject.navigationMouseOutHandler, false);
            }
        }
    },
    navigationMouseOutHandler: function( e ) {
        var GalleryDomObject, node = null;
        if (e.srcElement)   node = e.srcElement;
        else if (e.target)  node = e.target;
        if(node !== null) {
            while(node.nodeName !== 'A') {
                if(node.parentNode.nodeName !== 'BODY') {
                    node = node.parentNode;
                } else {
                    break;
                }
            }
            if(node.nodeName === 'A' && node.GalleryDomObject) {
                node.GalleryDomObject.switchImage( node.imageIndex, false );
                node.GalleryDomObject.startAutoSwitching();
                node.removeEventListener('mouseout', node.GalleryDomObject.navigationMouseOutHandler, false);
            }
        }
    },
    switchImage: function( index, startTimer ) {
        if(index === this.active) {
            return;
        }
        if(this.switching === false) {
            this.switching = true;
            if(this.timer !== null) {
                clearInterval(this.timer);
            }
            var active  = this.gallery.images[this.active];
            var next    = this.gallery.images[index];
            var that    = this;

            JustJS.dom.removeClass( that.navigation.children[that.active], 'active' );
            JustJS.dom.addClass( that.navigation.children[index], 'active' );

            next.object.style.zIndex    = '2';
            next.object.style.display   = 'block';

            JustJS.fx.fadeOut(active.object, {
                duration: 2500,
                complete: function() {
                    active.object.style.zIndex  = '1';
                    next.object.style.zIndex    = '3';

                    that.active     = index;
                    that.switching  = false;
                    if(startTimer) {
                        that.startAutoSwitching();
                    }
                }
            });
        }
    },
    startAutoSwitching: function() {
        var that = this;
        that.timer = setInterval(function() {
            var current = that.active;
            var next    = (current === that.gallery.images.length - 1) ? 0 : ++current;
            that.switchImage(next, true);
        }, 5000);
    }
});

JustJS.ready(function() {
    JustJS.SimpleGallery.init();
});
(function($) {
  'use strict';

  // StyleHatch Object
  window.StyleHatch = window.StyleHatch || {};

  /**
   * Sections
   * ---------------------------------------------------------------------------
   * Constructors, instances and events for the Shopify Theme Editor
   */
  StyleHatch.Sections = function Sections() {
    this.constructors = {};
    this.instances = [];

    $(document)
      .on('shopify:section:load', this._onSectionLoad.bind(this))
      .on('shopify:section:unload', this._onSectionUnload.bind(this))
      .on('shopify:section:select', this._onSelect.bind(this))
      .on('shopify:section:deselect', this._onDeselect.bind(this))
      .on('shopify:section:reorder', this._onReorder.bind(this))
      .on('shopify:block:select', this._onBlockSelect.bind(this))
      .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
  };
  /**
   * Prototypes to extend sections
   */
  StyleHatch.Sections.prototype = $.extend({}, StyleHatch.Sections.prototype, {
    _createInstance: function(container, constructor) {
      var $container = $(container);
      var id = $container.attr('data-section-id');
      var type = $container.attr('data-section-type');

      constructor = constructor || this.constructors[type];

      if (typeof constructor === 'undefined') {
        return;
      }

      var instance = $.extend(new constructor(container), {
        id: id,
        type: type,
        container: container,
      });

      this.instances.push(instance);
    },

    _onSectionLoad: function(evt) {
      var container = $('[data-section-id]', evt.target)[0];
      if (container) {
        this._createInstance(container);
      }
    },

    _onSectionUnload: function(evt) {
      var instance = slate.utils.findInstance(
        this.instances,
        'id',
        evt.detail.sectionId
      );

      if (!instance) {
        return;
      }

      if (typeof instance.onUnload === 'function') {
        instance.onUnload(evt);
      }

      this.instances = slate.utils.removeInstance(
        this.instances,
        'id',
        evt.detail.sectionId
      );
    },

    _onSelect: function(evt) {
      var instance = slate.utils.findInstance(
        this.instances,
        'id',
        evt.detail.sectionId
      );

      if (instance && typeof instance.onSelect === 'function') {
        instance.onSelect(evt);
      }

      if ($('body').hasClass('panel-open')) {
        StyleHatch.closePanelMenu();
        $('html, body').addClass('scroll-lock');
        // Prevent theme editor issues
        setTimeout(function() {
          $('html, body').removeClass('scroll-lock');
          $('html, body').animate(
            {
              scrollTop: instance.$container.offset().top, // - fixedOffset
            },
            600
          );
        }, 400);
      }
    },

    _onDeselect: function(evt) {
      var instance = slate.utils.findInstance(
        this.instances,
        'id',
        evt.detail.sectionId
      );

      if (instance && typeof instance.onDeselect === 'function') {
        instance.onDeselect(evt);
      }

      if ($('body').hasClass('panel-open')) {
        StyleHatch.closePanelMenu();
      }
    },

    _onReorder: function(evt) {
      var instance = slate.utils.findInstance(
        this.instances,
        'id',
        evt.detail.sectionId
      );

      if (instance && typeof instance.onReorder === 'function') {
        instance.onReorder(evt);
      }
    },

    _onBlockSelect: function(evt) {
      var instance = slate.utils.findInstance(
        this.instances,
        'id',
        evt.detail.sectionId
      );

      if (instance && typeof instance.onBlockSelect === 'function') {
        instance.onBlockSelect(evt);
      }
    },

    _onBlockDeselect: function(evt) {
      var instance = slate.utils.findInstance(
        this.instances,
        'id',
        evt.detail.sectionId
      );

      if (instance && typeof instance.onBlockDeselect === 'function') {
        instance.onBlockDeselect(evt);
      }
    },

    register: function(type, constructor) {
      this.constructors[type] = constructor;

      $('[data-section-type=' + type + ']').each(
        function(index, container) {
          this._createInstance(container, constructor);
        }.bind(this)
      );
    },
  });

  /**
   * Cache common selectors
   */
  StyleHatch.cacheSelectors = function() {
    StyleHatch.cache = {
      // General
      $body: $('body'),
      $html: $('html'),

      // Util header
      $util: $('header.util'),
      $header: $('header.site-header'),
      $siteNav: $('header.site-header ul.site-nav'),
      $featuredCollection: $('.featured-collection'),

      $addToCartForm: $('#AddToCartForm'),
      $addToCartButton: $('#AddToCart'),
      $cartButton: $('#CartButton'),

      // Customer Pages
      $recoverPasswordLink: $('#RecoverPassword'),
      $hideRecoverPasswordLink: $('#HideRecoverPasswordLink'),
      $recoverPasswordForm: $('#RecoverPasswordForm'),
      $customerLoginForm: $('#CustomerLoginForm'),
      $passwordResetSuccess: $('#ResetSuccess'),
    };
  };

  StyleHatch.init = function() {
    var doc = document.documentElement;
    doc.setAttribute('data-useragent', navigator.userAgent);

    StyleHatch.cacheSelectors();

    function is_touch_enabled() { 
        return ( 'ontouchstart' in window ) ||  
               ( navigator.maxTouchPoints > 0 ) || 
               ( navigator.msMaxTouchPoints > 0 ); 
    }
    if(is_touch_enabled()) {
      theme.Helpers.setTouch();
    }


    // Set up width levels
    StyleHatch.largeMobile = 700;

    /**
     * Set up sections
     */
    var sections = new StyleHatch.Sections();
    // Fixed theme sections
    sections.register('promos-section', StyleHatch.PromosSection);
    sections.register('header-section', StyleHatch.HeaderSection);
    sections.register('footer-section', StyleHatch.FooterSection);
    // Index sections
    sections.register('slideshow-section', StyleHatch.SlideshowSection);
    sections.register('hero-video-section', StyleHatch.HeroVideoSection);
    sections.register(
      'featured-collection-section',
      StyleHatch.FeaturedCollectionSection
    );
    sections.register(
      'simple-collection-section',
      StyleHatch.SimpleCollectionSection
    );
    sections.register('featured-text-section', StyleHatch.PageSection);
    sections.register('custom-content-section', StyleHatch.PageSection);
    sections.register('looks', StyleHatch.LooksSection);
    sections.register('featured-blog-section', StyleHatch.GenericSection);
    sections.register('map', StyleHatch.Maps);
    // Template sections
    sections.register('product-template', StyleHatch.Product);
    sections.register(
      'product-recommendations',
      StyleHatch.ProductRecommendations
    );
    sections.register('store-availability', theme.StoreAvailability);
    sections.register('collection-template', StyleHatch.Collection);
    sections.register('collection-list-template', StyleHatch.Collection);
    sections.register('list-collections-template', StyleHatch.ListCollections);
    sections.register('blog-template', StyleHatch.BlogArticle);
    sections.register('article-template', StyleHatch.BlogArticle);
    sections.register('password-template', StyleHatch.Password);
    sections.register('cart-template', StyleHatch.Cart);

    StyleHatch.AjaxCart.init();
    StyleHatch.loginForms();
    StyleHatch.videoLayout();
    StyleHatch.initTemplates();

    // Flickity iOS 13 fix
    var touchingCarousel = false,
      touchStartCoords;
    document.body.addEventListener('touchstart', function(e) {
      if (e.target.closest('[data-flickity-options]')) {
        touchingCarousel = true;
      } else {
        touchingCarousel = false;
        return;
      }

      touchStartCoords = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY,
      };
    });
    document.body.addEventListener(
      'touchmove',
      function(e) {
        if (!(touchingCarousel && e.cancelable)) {
          return;
        }

        var moveVector = {
          x: e.touches[0].pageX - touchStartCoords.x,
          y: e.touches[0].pageY - touchStartCoords.y,
        };
        if (Math.abs(moveVector.x) > 5) e.preventDefault();
      },
      {
        passive: false,
      }
    );
  };

  /**
   * Section - Modules
   * ---------------------------------------------------------------------------
   * Set up core functionality for fixed global (all template) modules
   */

  /**
   * Promos - header
   */
  StyleHatch.PromosSection = (function() {
    function PromosSection(container) {
      var $container = (this.$container = $(container));
      var id = $container.attr('data-section-id');
      StyleHatch.Promos.init();
    }

    return PromosSection;
  })();
  StyleHatch.PromosSection.prototype = $.extend(
    {},
    StyleHatch.PromosSection.prototype,
    {
      onUnload: function() {
        StyleHatch.Promos.unload();
      },
      onBlockSelect: function(evt) {
        StyleHatch.Promos.blockSelect(evt);
      },
      onBlockDeselect: function(evt) {
        StyleHatch.Promos.blockDeselect(evt);
      },
    }
  );
  // Promos Class
  StyleHatch.Promos = (function() {
    var selectors = {
      body: 'body',
      page: '#page',
      promos: '#shopify-section-promos',
      promoBar: 'header.promo-bar',
      bottomContainer: '.promo-bar-container.bottom',
      popup: '.promo-popup',
    };

    var config = {};
    config = {
      scrollLock: false,
      fixToZIndex: 992,
      hideTimers: [],
      slideSpeed: 400,
    };

    var cache = {};

    function init() {
      cacheSelectors();

      config.scrollLock = cache.$promos.find('>*:first').data('scroll-lock');

      initPromoBars();
      initPopups();

      StyleHatch.Header.rebuildFixTo();
    }

    function cacheSelectors() {
      cache = {
        $body: $(selectors.body),
        $promos: $(selectors.promos),
        $promosContainer: $(selectors.promos).find('>*:first'),
        $promoBar: $(selectors.promoBar),
        $bottomContainer: $(selectors.bottomContainer),
        $popup: $(selectors.popup),
      };
    }

    // Core functions
    /*
     * Promo bar
     * Announcement bar
     */
    function initPromoBars() {
      if (cache.$promoBar.length) {
        // Loop through each
        cache.$promoBar.each(function() {
          var $promoBar = $(this);
          var hideDelay = $promoBar.data('hide-delay');
          var barPlacement = $promoBar.data('bar-placement');

          // Check for errors
          var $errors = $promoBar.find('div.errors');
          if ($errors.length) {
            $errors.prependTo($promoBar);
          }

          // Create and group together bottom bars
          if (barPlacement == 'bottom') {
            if (!cache.$bottomContainer.length) {
              cache.$promosContainer.append(
                '<div class="promo-bar-container bottom"></div>'
              );
              cache.$bottomContainer = $(selectors.bottomContainer);
            }
            $promoBar.appendTo(cache.$bottomContainer);

            // Calculate height and offset bottom padding
            cache.$bottomContainer.resize(function() {
              var bottomHeight = $(this).height() + 'px';
              cache.$body.css({
                'margin-bottom': bottomHeight,
              });
            });
          }

          if ($promoBar.hasClass('signup-bar')) {
            $promoBar.showPopup();
          }

          // Hide the bar after ms delay (hideDelay)
          if (hideDelay !== 'no-delay') {
            config.hideTimers.push(
              setTimeout(function() {
                if (!$promoBar.data('pause-hide')) {
                  $promoBar.promoSlideUp();
                }
              }, hideDelay)
            );
          }
        });

        destroyFixTo();
        fixTo();
      }
    }
    function destroyFixTo() {
      if (cache.$promos.data('fixtoInstance')) {
        cache.$promos.fixTo('destroy');
      }
    }
    function refreshFixTo() {
      if (cache.$promos.data('fixtoInstance')) {
        cache.$promos.fixTo('refresh');
      }
    }
    function fixTo() {
      if (config.scrollLock) {
        cache.$promos.fixTo(selectors.page, {
          zIndex: config.fixToZIndex,
        });
      }
    }

    /*
     * Popup
     */
    function initPopups() {
      if (cache.$popup.length) {
        // Loop through each
        cache.$popup.each(function() {
          var $popup = $(this);
          var popupEnable = true,
            showDelay = $popup.data('show-delay'),
            homepageLimit = $popup.data('homepage-limit'),
            visitorLimit = $popup.data('visitor-limit'),
            isVisitor = $popup.data('visitor'),
            showFor = $popup.data('show-for');

          // Disable popup if "only enable for visitor" and customer
          if (visitorLimit == true && isVisitor == false) {
            popupEnable = false;
          }

          var $errors = $popup.find('.errors');
          if ($errors.length) {
            showDelay = 0;
          }

          var popupTimeout = setTimeout(function() {
            var windowWidth = $(window).width();
            switch (showFor) {
              case 'mobile':
                if (windowWidth <= StyleHatch.largeMobile) {
                  $popup.showPopup();
                }
                break;
              case 'desktop':
                if (windowWidth > StyleHatch.largeMobile) {
                  $popup.showPopup();
                }
                break;
              case 'both':
                $popup.showPopup();
                break;
            }
          }, showDelay);
        });
      }
    }

    // Prototypes
    /*
     * Popups
     * - showPopup
     * - hidePopup
     */
    $.fn.extend({
      showPopup: function(force) {
        var $popup = $(this);
        var popupEnable = true,
          showDelay = $popup.data('show-delay'),
          showAgainDelay = $popup.data('show-again-delay'),
          homepageLimit = $popup.data('homepage-limit'),
          visitorLimit = $popup.data('visitor-limit'),
          isVisitor = $popup.data('visitor'),
          showFor = $popup.data('show-for'),
          type = $popup.data('type'),
          id = $popup.data('id');

        // Disable popup if "only enable for visitor" and customer
        if (visitorLimit == true && isVisitor == false) {
          popupEnable = false;
        }

        // Check to see if the cookie exists
        var cookieName = 'popup-' + id;
        if ($.cookie(cookieName)) {
          popupEnable = false;
        }

        // Check for homepage limit
        if (homepageLimit && !cache.$body.hasClass('template-index')) {
          popupEnable = false;
        }

        if (window.self !== window.top && type == 'popup') {
          popupEnable = false;
        }

        // Always show signup-bar popup if inside the editor
        if (force) {
          popupEnable = true;
        }

        // Check for errors to show the popup anyways
        var $errors = $popup.find('.errors');
        var formTags = getQueryString('contact%5Btags%5D');

        if ($errors.length && formTags.includes('popup')) {
          popupEnable = true;
          $popup.find('input#email').addClass('errors');
        }

        if ($errors.length && formTags.includes('signup-bar')) {
          popupEnable = true;
        }

        // Remove target=_blank on touch
        if (theme.Helpers.isTouch()) {
          $popup.find('form').removeAttr('target');
        }

        if (popupEnable) {
          if (type == 'popup') {
            $.magnificPopup.open({
              items: {
                src: $popup,
                type: 'inline',
                showCloseBtn: false,
              },
              mainClass: 'mfp-slideup',
              removalDelay: 300,
              callbacks: {
                close: function() {
                  $.cookie(cookieName, 'shown', {
                    expires: showAgainDelay,
                    path: StyleHatch.routes.root_url,
                  });
                },
              },
            });
          }

          if (type == 'signup-bar') {
            if (force) {
              $popup.addClass('visible force');
            } else {
              $popup.addClass('visible');
            }
          }

          var $close = $popup.find('.icon-text');
          $close.on('click', function(e) {
            $popup.hidePopup();
            e.preventDefault();
          });

          // On click subscribe button
          var $form = $popup.find('form');
          $form.on('submit', function(e) {
            if (e.target.checkValidity()) {
              $popup.hidePopup();
              $(this).submit();
            } else {
              return false;
            }
          });
        }
      },
      hidePopup: function() {
        var $promos = $('#shopify-section-promos');
        var $popup = $(this);
        var type = $popup.data('type'),
          id = $popup.data('id');

        if (type == 'popup') {
          $.magnificPopup.close();
        }

        if (type == 'signup-bar') {
          var cookieName = 'popup-' + id;

          $.cookie(cookieName, 'shown', {
            expires: 60,
            path: StyleHatch.routes.root_url,
          });

          // close all signup bars
          $('.promo-bar.signup-bar').each(function(i) {
            $(this).slideUp({
              duration: 400,
              progress: function() {
                StyleHatch.refreshFixTo();
              },
              complete: function() {
                // one final refresh call
                StyleHatch.refreshFixTo();
                $(this).removeClass('visible force');
              },
            });
          });
        }
      },
      promoSlideUp: function() {
        $(this).slideUp({
          duration: config.slideSpeed,
          progress: StyleHatch.refreshFixTo,
          complete: StyleHatch.refreshFixTo,
        });
      },
      promoSlideDown: function() {
        $(this).slideDown({
          duration: config.slideSpeed,
          progress: StyleHatch.refreshFixTo,
          complete: StyleHatch.refreshFixTo,
        });
      },
      // Simulated versions for the customize theme menu
      showMockPopup: function() {
        var $promos = $('#shopify-section-promos');
        if (!$('.mock-popup-container').length) {
          $promos
            .find('>*:first')
            .append('<div class="mock-popup-container"></div>');
        }
        var $mockPopupContainer = $('.mock-popup-container');
        var $popup = $(this);
        $popup.appendTo($mockPopupContainer);

        $mockPopupContainer.show();
        $popup.show();
      },
      hideMockPopup: function() {
        var $mockPopupContainer = $('.mock-popup-container');
        var $popup = $(this);
        $mockPopupContainer.hide();
        $popup.hide();
      },
    });

    function blockSelect(evt) {
      var $block = $('#block-' + evt.detail.blockId);
      var blockType = $block.data('type');

      // close any open popup
      $.magnificPopup.close();

      // make sure each block type opens
      switch (blockType) {
        case 'announcement-bar':
          // Promo bars
          // Always show the bar when the block is selected
          $block.promoSlideDown();
          $block.attr('data-pause-hide', true);

          break;
        case 'popup':
          $block.showMockPopup();
          break;
        case 'signup-bar':
          $block.showPopup(true);
          break;
      }
      StyleHatch.Header.rebuildFixTo();
      StyleHatch.refreshFixTo();
    }
    function blockDeselect(evt) {
      var $block = $('#block-' + evt.detail.blockId);
      var blockType = $block.data('type');
      var showFor = $block.data('show-for');
      var windowWidth = $(window).width();

      // make sure each block type closes (if it should)
      switch (blockType) {
        case 'announcement-bar':
          var $promoBar = $block;
          $promoBar.attr('data-pause-hide', false);

          var hideDelay = $promoBar.data('hide-delay');
          var barPlacement = $promoBar.data('bar-placement');
          var homepageLimit = $promoBar.data('homepage-limit');

          // Instantly hide any promo bar that was open for editing only (wrong size)
          if (showFor == 'desktop' && windowWidth <= StyleHatch.largeMobile) {
            $block.promoSlideUp();
          } else if (
            showFor == 'mobile' &&
            windowWidth > StyleHatch.largeMobile
          ) {
            $block.promoSlideUp();
          }

          // Hide the bar after ms delay (hideDelay)
          if (hideDelay !== 'no-delay') {
            config.hideTimers.push(
              setTimeout(function() {
                if (!$promoBar.data('pause-hide')) {
                  $promoBar.promoSlideUp();
                }
              }, hideDelay)
            );
          }
          break;
        case 'popup':
          $block.hideMockPopup();
          break;

        case 'signup-bar':
          if (showFor == 'desktop' && windowWidth <= StyleHatch.largeMobile) {
            $block.hidePopup();
            StyleHatch.refreshFixTo();
          }
          if (showFor == 'mobile' && windowWidth > StyleHatch.largeMobile) {
            $block.hidePopup();
            StyleHatch.refreshFixTo();
          }
          break;
      }
      StyleHatch.Header.rebuildFixTo();
    }
    function unload() {
      // Clear out timers
      if (
        typeof config.hideTimers == 'undefined' ||
        !(config.hideTimers instanceof Array)
      ) {
        config.hideTimers = [];
      } else {
        for (var i = 0; i < config.hideTimers.length; i++) {
          clearTimeout(config.hideTimers[i]);
        }
        config.hideTimers.length = 0;
      }

      // Clean up fixto
      destroyFixTo();
      StyleHatch.refreshFixTo();

      // Misc
      cache.$bottomContainer.remove();
      $.magnificPopup.close();
    }

    return {
      init: init,
      unload: unload,
      blockSelect: blockSelect,
      blockDeselect: blockDeselect,
      refreshFixTo: refreshFixTo,
    };
  })();

  /**
   * Header
   */
  StyleHatch.HeaderSection = (function() {
    function HeaderSection(container) {
      var $container = (this.$container = $(container));
      var id = $container.attr('data-section-id');
      StyleHatch.Header.init();
    }

    return HeaderSection;
  })();
  StyleHatch.HeaderSection.prototype = $.extend(
    {},
    StyleHatch.HeaderSection.prototype,
    {
      onUnload: function() {
        StyleHatch.Header.unload();
      },
    }
  );
  // Header Class
  StyleHatch.Header = (function() {
    var selectors = {
      htmlBody: 'html, body',
      body: 'body',
      page: '#page',
      section: '#shopify-section-header',
      promosSection: '#shopify-section-promos',
      util: 'header.util',
      header: 'header.site-header',
      siteNav: 'header.site-header ul.site-nav',
      menuLink: '.menu-link',
      menuPanel: '#menu.panel',
      menuOverlay: '.mobile-menu-overlay',
      disclosureLocale: '#localization_form--top-bar [data-disclosure-locale]',
      disclosureCurrency:
        '#localization_form--top-bar [data-disclosure-currency]',
    };

    var config = {};
    config = {
      blurTimer: {},
      blurTime: 2000,
      slideSpeed: 300,
      // Dropdowns
      dropdownActiveClass: 'dropdown-hover',
      subDropdownActiveClass: 'sub-dropdown-hover',
    };

    var cache = {};

    function init() {
      cacheSelectors();

      // Util
      initUtilHeader();
      bindUtilHeaderEvents();
      // Header
      initHeader();
      bindHeaderEvents();

      $('[data-currency-selector]').on('change', function() {
        $(this)
          .parents('form')
          .submit();
      });

      rebuildFixTo();
    }

    function cacheSelectors() {
      cache = {
        $htmlBody: $(selectors.htmlBody),
        $body: $(selectors.body),
        $page: $(selectors.page),
        $section: $(selectors.section),
        $promosSection: $(selectors.promosSection),
        $util: $(selectors.util),
        $header: $(selectors.header),
        $siteNav: $(selectors.siteNav),
        // Dropdowns
        $dropdownParent: $(selectors.siteNav).find('li.has-dropdown'),
        $defaultLink: $(selectors.siteNav).find('> li:not(.has-dropdown)'),
        $subMenuLinks: $(selectors.siteNav).find('li.has-dropdown a'),
        $subDropdownParent: $(selectors.siteNav).find('li.has-sub-dropdown'),
        // Util
        $search: $(selectors.util).find('.search-wrapper'),
        $searchLink: $(selectors.util).find('a.search'),
        $searchClose: $(selectors.util).find('form.search-bar button'),
        $searchInput: $(selectors.util).find('form.search-bar input'),
        $disclosureLocale: $(selectors.disclosureLocale),
        $disclosureCurrency: $(selectors.disclosureCurrency),
        // Panel menu
        $menuLink: $(selectors.menuLink),
        $menuPanel: $(selectors.menuPanel),
        $menuPanelDropdown: $(selectors.menuPanel).find('li.has-dropdown'),
        $menuPanelSubDropdown: $(selectors.menuPanel).find(
          'li.has-sub-dropdown'
        ),
      };
    }

    /*
     * Util header
     * ------------------------
     */
    function initUtilHeader() {
      // Add overlay
      if (!$(selectors.menuOverlay).length) {
        cache.$section.append('<div class="mobile-menu-overlay"></div>');
        cache.$menuOverlay = $(selectors.menuOverlay);
      }
      if (cache.$disclosureLocale.length) {
        StyleHatch.Header.disclosureLocale = new theme.Disclosure(
          cache.$disclosureLocale
        );
      }

      if (cache.$disclosureCurrency.length) {
        StyleHatch.Header.disclosureCurrency = new theme.Disclosure(
          cache.$disclosureCurrency
        );
      }
    }
    /*
     * Search open/close
     */
    function openSearch() {
      cache.$search.slideDown({
        duration: config.slideSpeed,
        progress: function() {
          StyleHatch.refreshFixTo();
        },
        complete: function() {
          StyleHatch.refreshFixTo();
        },
      });
      cache.$searchInput.focus();
    }
    function closeSearch() {
      cache.$searchInput.blur();
      clearTimeout(config.blurTimer);
      cache.$search.slideUp({
        duration: config.slideSpeed,
        progress: function() {
          StyleHatch.refreshFixTo();
        },
        complete: function() {
          StyleHatch.refreshFixTo();
        },
      });
    }
    /*
     * Mobile panel open/close
     */
    function togglePanelMenu() {
      if (cache.$body.hasClass('panel-open')) {
        closePanelMenu();
      } else {
        openPanelMenu();
      }
    }
    function openPanelMenu() {
      cache.$htmlBody.addClass('panel-open');
      window.scrollTo(0, 0);
      cache.$menuPanel.attr('tabindex', '0');
      cache.$menuPanel.focus();
    }
    function closePanelMenu() {
      cache.$htmlBody.addClass('panel-open-transition');
      cache.$htmlBody.removeClass('panel-open');
      cache.$menuPanel.removeAttr('tabindex');

      setTimeout(function() {
        cache.$htmlBody.removeClass('panel-open-transition');
      }, 400);
    }
    /*
     * Events
     */
    function bindUtilHeaderEvents() {
      // Search
      cache.$searchLink.on('click.search', function(e) {
        openSearch();
        e.preventDefault();
      });
      cache.$searchClose.on('click.search', function(e) {
        closeSearch();
        e.preventDefault();
      });
      cache.$searchInput.on('blur.search', function(e) {
        config.blurTimer = setTimeout(closeSearch, config.blurTime);
        e.preventDefault();
      });

      // Mobile panel menu
      cache.$menuLink.on('click.panel', function(e) {
        togglePanelMenu();
        e.preventDefault();
      });
      cache.$menuOverlay.on('click.panel', function(e) {
        togglePanelMenu();
        e.preventDefault();
      });

      // Collapsible panel navigation (subnav)
      cache.$menuPanelDropdown.on('click.panelDropdown', function(e) {
        // Slide up previous one(s)
        cache.$menuPanelDropdown.find('ul.dropdown').slideUp();
        cache.$menuPanelDropdown.find('> a').attr('aria-expanded', 'false');
        cache.$menuPanelDropdown.removeClass('expanded');

        cache.$menuPanelDropdown
          .find('ul.dropdown')
          .attr('aria-hidden', 'true');
        cache.$menuPanelDropdown.find('ul.dropdown a').attr('tabindex', '-1');

        // If it's not open slide down the menu
        // and don't allow the click
        if (
          !$(this)
            .find('ul.dropdown')
            .is(':visible')
        ) {
          $(this)
            .find('> a')
            .attr('aria-expanded', 'true');
          $(this)
            .find('ul.dropdown')
            .slideDown();
          $(this)
            .find('ul.dropdown')
            .attr('aria-hidden', 'false');
          $(this)
            .find('ul.dropdown > li > a')
            .attr('tabindex', '0');
          $(this).addClass('expanded');
        }
      });

      cache.$menuPanelDropdown
        .find('> a')
        .on('click.panelDropdown', function(e) {
          if (
            !$(this)
              .closest('li')
              .hasClass('expanded')
          ) {
            e.preventDefault();
          }
        });
      cache.$menuPanelDropdown
        .find('ul.dropdown li:not(.has-sub-dropdown) a')
        .on('click.panelDropdown', function(e) {
          e.stopPropagation();
        });

      // Collapsible panel navigation (sub-subnav)
      cache.$menuPanelSubDropdown.on('click.panelDropdown', function(e) {
        e.stopPropagation();
        cache.$menuPanelSubDropdown.find('ul.sub-dropdown').slideUp();
        cache.$menuPanelDropdown.find('> a').attr('aria-expanded', 'false');
        cache.$menuPanelSubDropdown.removeClass('expanded');

        cache.$menuPanelDropdown
          .find('ul.sub-dropdown')
          .attr('aria-hidden', 'true');
        cache.$menuPanelDropdown
          .find('ul.sub-dropdown a')
          .attr('tabindex', '-1');

        // If it's not open slide down the menu
        // and don't allow the click
        if (
          !$(this)
            .find('ul.sub-dropdown')
            .is(':visible')
        ) {
          $(this)
            .find('> a')
            .attr('aria-expanded', 'true');
          $(this)
            .find('ul.sub-dropdown')
            .slideDown();
          $(this)
            .find('ul.sub-dropdown')
            .attr('aria-hidden', 'false');
          $(this)
            .find('ul.sub-dropdown > li > a')
            .attr('tabindex', '0');
          $(this).addClass('expanded');
        }
      });

      cache.$menuPanelSubDropdown
        .find('> a')
        .on('click.panelDropdown', function(e) {
          if (
            !$(this)
              .closest('li')
              .hasClass('expanded')
          ) {
            e.preventDefault();
          }
        });
      cache.$menuPanelSubDropdown
        .find('ul.sub-dropdown a')
        .on('click.panelDropdown', function(e) {
          e.stopPropagation();
        });

      // Promo resize
      cache.$promosSection.resize(StyleHatch.refreshFixTo);
    }
    function unbindUtilHeaderEvents() {
      if (StyleHatch.Header.disclosureLocale) {
        StyleHatch.Header.disclosureLocale.unload();
      }

      if (StyleHatch.Header.disclosureCurrency) {
        StyleHatch.Header.disclosureCurrency.unload();
      }

      // Search
      clearTimeout(config.blurTimer);
      cache.$searchLink.off('click.search');
      cache.$searchClose.off('click.search');
      cache.$searchInput.off('blur.search');

      // Mobile panel menu
      cache.$menuLink.off('click.panel');
      //cache.$menuOverlay.off('click.panel');

      // Collapsible panel navigation
      cache.$menuPanelDropdown.off('click.panelDropdown');
      cache.$menuPanelDropdown.find('> a').off('click.panelDropdown');
      cache.$menuPanelDropdown
        .find('ul.dropdown li:not(.has-sub-dropdown) a')
        .off('click.panelDropdown');

      cache.$menuPanelSubDropdown.off('click.panelDropdown');
      cache.$menuPanelSubDropdown.find('> a').off('click.panelDropdown');
      cache.$menuPanelSubDropdown
        .find('ul.sub-dropdown a')
        .off('click.panelDropdown');

      // Promo resize
      cache.$promosSection.removeResize(StyleHatch.refreshFixTo);
    }

    /*
     * Header
     * ------------------------
     */
    function initHeader() {
      // Adds line breaks to really long subnav text links
      cache.$subMenuLinks.each(function() {
        var $link = $(this);
        var linkText = $link.text();
        var linkTextWrapped = wordWrapper(linkText, 24, '<br/>\n');

        // Apply wrapped text
        // $link.html(linkTextWrapped);
      });

      // Prevent Safari from reopening menu when browsing back
      hideDropdown(cache.$dropdownParent);
    }
    /*
     * Dropdown open / close
     */
    function showDropdown($el) {
      // Hide previous
      hideDropdown($('.' + config.dropdownActiveClass));

      $el.addClass(config.dropdownActiveClass);

      // Accessiblity
      $el.find('> a').attr('aria-expanded', 'true');
      $el.find('ul.dropdown').attr('aria-hidden', 'false');
      $el.find('ul.dropdown > li > a').attr('tabindex', '0');

      var $dropdown = $el.find('ul.dropdown');
      if (!$dropdown.hasClass('dropdown--mega-menu')) {
        $dropdown.css({
          left: 'auto',
        });
      }
      var dropdownEnd = $dropdown.offset().left + $dropdown.outerWidth();

      // Account for page edge padding
      var pageWidth = $(window).width() - 20;

      // Without border
      var siteWidth = cache.$header.width();
      var logoOffset = cache.$header.find('.logo-nav-contain').offset().left;

      if (siteWidth + 40 > $(window).width()) {
        siteWidth = $(window).width();
        logoOffset = -20;
      }

      pageWidth = siteWidth + logoOffset + 1;

      if (dropdownEnd > pageWidth) {
        if (!$dropdown.hasClass('dropdown--mega-menu')) {
          var rightEdge = '-' + (dropdownEnd - pageWidth) + 'px';
          $dropdown.css({
            left: rightEdge,
          });
        }
      }

      setTimeout(function() {
        cache.$body.on('touchstart', function() {
          hideDropdown($el);
        });
      }, 250);
    }
    function hideDropdown($el) {
      $el.removeClass(config.dropdownActiveClass);
      cache.$body.off('touchstart');

      // Accessiblity
      $el.find('> a').attr('aria-expanded', 'false');
      $el.find('ul.dropdown').attr('aria-hidden', 'true');
      $el.find('ul.dropdown > li > a').attr('tabindex', '-1');
    }
    // Sub dropdowns
    function showSubDropdown($el) {
      hideDropdown($('.' + config.subDropdownActiveClass));

      $el.addClass(config.subDropdownActiveClass);

      // Accessiblity
      $el.find('> a').attr('aria-expanded', 'true');
      $el.find('ul.sub-dropdown').attr('aria-hidden', 'false');
      $el.find('ul.sub-dropdown > li > a').attr('tabindex', '0');

      // Check if partially in view
      //console.log($el.find('.sub-dropdown').offset().left, $el.find('.sub-dropdown').width());

      // Show subdropdown to the left if there isn't enough room
      var dropdownOffsetEdge =
        $el.find('.sub-dropdown').offset().left +
        $el.find('.sub-dropdown').width();
      var windowWidth = $(window).width();
      if (dropdownOffsetEdge > windowWidth) {
        $el.addClass('alternate-align');
      } else {
        $el.removeClass('alternate-align');
      }
    }
    function hideSubDropdown($el) {
      $el.removeClass(config.subDropdownActiveClass);
      $el.removeClass('alternate-align');
      // Accessiblity
      $el.find('> a').attr('aria-expanded', 'false');
      $el.find('ul.sub-dropdown').attr('aria-hidden', 'true');
      $el.find('ul.sub-dropdown > li > a').attr('tabindex', '-1');
    }
    /*
     * Events
     */
    function bindHeaderEvents() {
      // Dropdown
      cache.$dropdownParent.on(
        'mouseenter.dropdown touchstart.dropdown focusin.dropdown',
        function(e) {
          var $el = $(this);

          if (!$el.hasClass(config.dropdownActiveClass)) {
            e.preventDefault();
            showDropdown($el);
          }
        }
      );
      cache.$dropdownParent.on('mouseleave.dropdown', function() {
        hideDropdown($(this));
      });
      cache.$subMenuLinks.on('touchstart.dropdown', function(e) {
        // Prevent touchstart on body from firing instead of link
        e.stopImmediatePropagation();
      });

      // Subdropdowns
      cache.$subDropdownParent.on(
        'mouseenter.subdropdown touchstart.subdropdown focusin.subdropdown',
        function(e) {
          var $el = $(this);

          if (!$el.hasClass(config.subDropdownActiveClass)) {
            e.preventDefault();
            showSubDropdown($el);
          }
        }
      );
      cache.$subDropdownParent.on('mouseleave.subdropdown', function() {
        hideSubDropdown($(this));
      });
      cache.$subDropdownParent.on('touchstart.subdropdown', function(e) {
        // Prevent touchstart on body from firing instead of link
        e.stopImmediatePropagation();
      });

      if ($('html').hasClass('touchevents')) {
        cache.$subDropdownParent.children('a').on('click', function(e) {
          var $el = $(this);

          if (!$el.hasClass(config.subDropdownActiveClass)) {
            e.preventDefault();
            showSubDropdown($el);
          }
        });
      }

      // Focus out detect tabbing outside of dropdown or subdropdown
      cache.$subMenuLinks.on('focusout.dropdown', function(e) {
        if (e.relatedTarget == null) {
          hideDropdown($('.' + config.dropdownActiveClass));
        } else {
          if (
            $(e.target).closest('li.has-dropdown')[0] !==
            $(e.relatedTarget).closest('li.has-dropdown')[0]
          ) {
            hideDropdown($('.' + config.dropdownActiveClass));
          }
          if (
            $(e.target).closest('li.has-sub-dropdown')[0] !==
            $(e.relatedTarget).closest('li.has-sub-dropdown')[0]
          ) {
            hideSubDropdown($('.' + config.subDropdownActiveClass));
          }
        }
      });
    }
    function unbindHeaderEvents() {
      // Dropdown
      cache.$dropdownParent.off(
        'mouseenter.dropdown touchstart.dropdown focusin.dropdown'
      );
      cache.$dropdownParent.off('mouseleave.dropdown');
      cache.$subMenuLinks.off('touchstart.dropdown');

      // Subdropdowns
      cache.$subDropdownParent.off(
        'mouseenter.subdropdown touchstart.subdropdown focusin.subdropdown'
      );
      cache.$subDropdownParent.off('mouseleave.subdropdown');
      cache.$subDropdownParent.off('touchstart.subdropdown');

      // Focus out detect tabbing outside of dropdown or subdropdown
      cache.$subMenuLinks.off('focusout.dropdown');
    }

    /*
     * fixTo - Complete header
     */
    function createFixTo() {
      var $headerSection = cache.$section;
      var $promosSection = cache.$promosSection;
      var $header = cache.$header;
      var $util = cache.$util;

      // Lock the util or header to the top on scroll
      var scrollLock = $header.data('scroll-lock');
      if (scrollLock == 'util' || scrollLock == 'header') {
        var mindElements = '';
        if ($promosSection.data('fixtoInstance')) {
          mindElements = '#shopify-section-promos';
        }
        $util.fixTo('#page', {
          zIndex: 991,
          mind: mindElements,
        });
      }
      if (scrollLock == 'header') {
        var mindElements = 'header.util';
        if ($promosSection.data('fixtoInstance')) {
          mindElements = 'header.util, #shopify-section-promos';
        }
        $headerSection.fixTo('#page', {
          zIndex: 990,
          mind: mindElements,
        });
        $headerSection.resize(function() {
          if ($(this).width() <= 700) {
            $headerSection.fixTo('stop');
          } else {
            $headerSection.fixTo('start');
          }
        });
      }
    }
    function destroyFixTo() {
      // Destroy header locks
      var $fixToElements = $('header.util, #shopify-section-header').filter(
        function() {
          return $(this).data('fixtoInstance');
        }
      );
      if ($fixToElements.length) {
        $fixToElements.fixTo('destroy');
      }
    }
    function rebuildFixTo() {
      cacheSelectors();
      destroyFixTo();
      createFixTo();
    }

    function unload() {
      // Util
      closePanelMenu();
      unbindUtilHeaderEvents();
      // Header
      unbindHeaderEvents();
      destroyFixTo();
    }

    return {
      init: init,
      unload: unload,
      openSearch: openSearch,
      closeSearch: closeSearch,
      togglePanelMenu: togglePanelMenu,
      openPanelMenu: openPanelMenu,
      closePanelMenu: closePanelMenu,
      rebuildFixTo: rebuildFixTo,
    };
  })();

  /**
   * Footer
   * Global section
   */
  StyleHatch.FooterSection = (function() {
    function FooterSection(container) {
      var $container = (this.$container = $(container));
      var id = $container.attr('data-section-id');
      StyleHatch.Footer.init($container);
    }

    return FooterSection;
  })();
  StyleHatch.FooterSection.prototype = $.extend(
    {},
    StyleHatch.FooterSection.prototype,
    {
      onUnload: function(evt) {
        StyleHatch.Footer.unload(evt);
      },
    }
  );
  // Footer class
  StyleHatch.Footer = (function() {
    function init($container) {
      var $nestedMenu = $container.find('ul.nested-menu');
      $nestedMenu.initNestedMenu();
      StyleHatch.Footer.$nestedMenu = $nestedMenu;

      if ($('#localization_form--footer [data-disclosure-locale]').length) {
        StyleHatch.Footer.disclosureLocale = new theme.Disclosure(
          $('#localization_form--footer [data-disclosure-locale]')
        );
      }

      if ($('#localization_form--footer [data-disclosure-currency]').length) {
        StyleHatch.Footer.disclosureCurrency = new theme.Disclosure(
          $('#localization_form--footer [data-disclosure-currency]')
        );
      }
    }
    function unload(evt) {
      StyleHatch.Footer.$nestedMenu.destroyNestedMenu();

      if (StyleHatch.Footer.disclosureLocale) {
        StyleHatch.Footer.disclosureLocale.unload();
      }

      if (StyleHatch.Footer.disclosureCurrency) {
        StyleHatch.Footer.disclosureCurrency.unload();
      }
    }

    return {
      init: init,
      unload: unload,
    };
  })();

  /**
   * Slideshow
   */
  StyleHatch.SlideshowSection = (function() {
    function SlideshowSection(container) {
      var $container = (this.$container = $(container));
      var id = $container.attr('data-section-id');
      StyleHatch.Slideshow.init($container);
    }

    return SlideshowSection;
  })();
  StyleHatch.SlideshowSection.prototype = $.extend(
    {},
    StyleHatch.SlideshowSection.prototype,
    {
      onUnload: function(evt) {
        StyleHatch.Slideshow.unload(evt);
      },
      onBlockSelect: function(evt) {
        StyleHatch.Slideshow.blockSelect(evt);
      },
      onBlockDeselect: function(evt) {
        StyleHatch.Slideshow.blockDeselect(evt);
      },
    }
  );
  // Slideshow Class
  StyleHatch.Slideshow = (function() {
    // Initialization
    function init($container) {
      var $carousel = $container.find('.slideshow-carousel');

      // Preload mobile or desktop slide images based on width
      var mobileWidth = 700;
      var $slideItem = $carousel.find('.slide__item');
      $(window).on('resize', function() {
        $slideItem.each(function(i) {
          var $responsiveImg;
          if ($(window).width() > mobileWidth) {
            $responsiveImg = $(this).find('img.slide__image-desktop');
          } else {
            $responsiveImg = $(this).find('img.slide__image-mobile');
            if ($responsiveImg.length < 1) {
              $responsiveImg = $(this).find('img.slide__image-desktop');
            }
          }

          if ($responsiveImg.hasClass('lazymanual')) {
            $responsiveImg
              .attr('src', $responsiveImg.attr('data-preload'))
              .removeAttr('data-preload');
            $responsiveImg.removeClass('lazymanual').addClass('lazyload');
          }
        });
      });

      var flickityOptions = $carousel.data('flickity-options');
      // Pass options from data attribute object
      $carousel.flickity(flickityOptions);
      $carousel
        .parent()
        .find('.flickity-page-dots.placeholder')
        .remove();

      // Load YouTube videos
      var $videoSlides = $container.find('.slide__item-video');
      $videoSlides.each(function() {
        var $slideVideo = $(this).find('.slide__item-image');
        var videoId = $(this).data('video-id');
        var autoplayMobile = $(this).data('mobile-autoplay');
        var playsinline = 0;
        if (autoplayMobile) {
          playsinline = 1;
        }
        if ($(window).width() > StyleHatch.largeMobile || autoplayMobile) {
          $slideVideo.YTPlayer({
            fitToBackground: false,
            videoId: videoId,
            repeat: true,
            mute: true,
            playerVars: {
              rel: 0,
              mute: 1,
              playsinline: playsinline,
              autoplay: 1,
            },
            callback: function() {
              $(window).trigger('resize');
            },
          });
        }
      });
    }

    function blockSelect(evt) {
      var $block = $('#block-' + evt.detail.blockId);
      var $carousel = $block.closest('.slideshow-carousel');
      var slideIndex = $block.data('slide-index');
      // Pause flickity and select the current block
      $carousel.flickity('pausePlayer');
      $carousel.flickity('select', slideIndex, true, true);
      // Lazyload all images
      $carousel
        .find('img')
        .removeClass('.lazymanual')
        .addClass('lazyload');
    }
    function blockDeselect(evt) {
      var $block = $('#block-' + evt.detail.blockId);
      var $carousel = $block.closest('.slideshow-carousel');
      // Unpause player
      $carousel.flickity('unpausePlayer');
    }
    // Unload
    function unload(evt) {
      var $section = $('.slideshow-' + evt.detail.sectionId);
      var $carousel = $section.find('.slideshow-carousel');
      // Destroy flickity to be rebuilt
      $carousel.flickity('destroy');

      // Destroy YouTube
      var $slideVideo = $section.find('.slide__item-video .slide__item-image');
      // Destroy
      $slideVideo
        .removeData('yt-init')
        .removeData('ytPlayer')
        .removeClass('loaded');

      $(window).off('resize.YTplayer' + $slideVideo.ID);
      $(window).off('scroll.YTplayer' + $slideVideo.ID);

      $slideVideo.$body = null;
      $slideVideo.$node = null;
      $slideVideo.$YTPlayerString = null;
      $slideVideo.player = null;
    }

    // Public methods
    return {
      init: init,
      unload: unload,
      blockSelect: blockSelect,
      blockDeselect: blockDeselect,
    };
  })();

  /**
   * Hero Video
   */
  StyleHatch.HeroVideoSection = (function() {
    function HeroVideoSection(container) {
      var $container = (this.$container = $(container));
      var id = $container.attr('data-section-id');

      StyleHatch.HeroVideo.init($container);
    }

    return HeroVideoSection;
  })();
  StyleHatch.HeroVideoSection.prototype = $.extend(
    {},
    StyleHatch.HeroVideoSection.prototype,
    {
      onUnload: function(evt) {
        StyleHatch.HeroVideo.unload(evt);
      },
    }
  );
  // Slideshow Class
  StyleHatch.HeroVideo = (function() {
    // Initialization
    function init($container) {
      var $heroVideo = $container.find('.wrapper');
      var videoId = $container.data('video-id');
      var autoplayMobile = $container.data('mobile-autoplay');
      var playsinline = 0;
      if (autoplayMobile) {
        playsinline = 1;
      }
      $heroVideo.removeData('ytPlayer');

      $heroVideo.YTPlayer({
        fitToBackground: false,
        videoId: videoId,
        repeat: true,
        mute: true,
        playerVars: {
          rel: 0,
          mute: 1,
          playsinline: playsinline,
          autoplay: 1,
        },
      });
    }

    // Unload
    function unload(evt) {
      var $section = $('.slideshow-' + evt.detail.sectionId);
      var $heroVideo = $section.find('.wrapper');
      // Destroy
      $heroVideo
        .removeData('yt-init')
        .removeData('ytPlayer')
        .removeClass('loaded');
      $heroVideo.find('.ytplayer-container .ytplayer-shield').remove();
    }

    // Public methods
    return {
      init: init,
      unload: unload,
    };
  })();

  /**
   * Maps
   */
  StyleHatch.Maps = (function() {
    var config = {
      zoom: 14,
    };
    var apiStatus = null;
    var apiKey = null;
    var apiKeyReset = false;
    var mapsToLoad = [];

    var mapStyles = {
      standard: [],
      silver: [
        {
          elementType: 'geometry',
          stylers: [
            {
              color: '#f5f5f5',
            },
          ],
        },
        {
          elementType: 'labels.icon',
          stylers: [
            {
              visibility: 'off',
            },
          ],
        },
        {
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#616161',
            },
          ],
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#f5f5f5',
            },
          ],
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#bdbdbd',
            },
          ],
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [
            {
              color: '#eeeeee',
            },
          ],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#757575',
            },
          ],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [
            {
              color: '#e5e5e5',
            },
          ],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#9e9e9e',
            },
          ],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [
            {
              color: '#ffffff',
            },
          ],
        },
        {
          featureType: 'road.arterial',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#757575',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [
            {
              color: '#dadada',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#616161',
            },
          ],
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#9e9e9e',
            },
          ],
        },
        {
          featureType: 'transit.line',
          elementType: 'geometry',
          stylers: [
            {
              color: '#e5e5e5',
            },
          ],
        },
        {
          featureType: 'transit.station',
          elementType: 'geometry',
          stylers: [
            {
              color: '#eeeeee',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [
            {
              color: '#c9c9c9',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#9e9e9e',
            },
          ],
        },
      ],
      retro: [
        {
          elementType: 'geometry',
          stylers: [
            {
              color: '#ebe3cd',
            },
          ],
        },
        {
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#523735',
            },
          ],
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#f5f1e6',
            },
          ],
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [
            {
              color: '#c9b2a6',
            },
          ],
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'geometry.stroke',
          stylers: [
            {
              color: '#dcd2be',
            },
          ],
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#ae9e90',
            },
          ],
        },
        {
          featureType: 'landscape.natural',
          elementType: 'geometry',
          stylers: [
            {
              color: '#dfd2ae',
            },
          ],
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [
            {
              color: '#dfd2ae',
            },
          ],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#93817c',
            },
          ],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry.fill',
          stylers: [
            {
              color: '#a5b076',
            },
          ],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#447530',
            },
          ],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [
            {
              color: '#f5f1e6',
            },
          ],
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [
            {
              color: '#fdfcf8',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [
            {
              color: '#f8c967',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [
            {
              color: '#e9bc62',
            },
          ],
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry',
          stylers: [
            {
              color: '#e98d58',
            },
          ],
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry.stroke',
          stylers: [
            {
              color: '#db8555',
            },
          ],
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#806b63',
            },
          ],
        },
        {
          featureType: 'transit.line',
          elementType: 'geometry',
          stylers: [
            {
              color: '#dfd2ae',
            },
          ],
        },
        {
          featureType: 'transit.line',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#8f7d77',
            },
          ],
        },
        {
          featureType: 'transit.line',
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#ebe3cd',
            },
          ],
        },
        {
          featureType: 'transit.station',
          elementType: 'geometry',
          stylers: [
            {
              color: '#dfd2ae',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'geometry.fill',
          stylers: [
            {
              color: '#b9d3c2',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#92998d',
            },
          ],
        },
      ],
      dark: [
        {
          elementType: 'geometry',
          stylers: [
            {
              color: '#212121',
            },
          ],
        },
        {
          elementType: 'labels.icon',
          stylers: [
            {
              visibility: 'off',
            },
          ],
        },
        {
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#757575',
            },
          ],
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#212121',
            },
          ],
        },
        {
          featureType: 'administrative',
          elementType: 'geometry',
          stylers: [
            {
              color: '#757575',
            },
          ],
        },
        {
          featureType: 'administrative.country',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#9e9e9e',
            },
          ],
        },
        {
          featureType: 'administrative.land_parcel',
          stylers: [
            {
              visibility: 'off',
            },
          ],
        },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#bdbdbd',
            },
          ],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#757575',
            },
          ],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [
            {
              color: '#181818',
            },
          ],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#616161',
            },
          ],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#1b1b1b',
            },
          ],
        },
        {
          featureType: 'road',
          elementType: 'geometry.fill',
          stylers: [
            {
              color: '#2c2c2c',
            },
          ],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#8a8a8a',
            },
          ],
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [
            {
              color: '#373737',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [
            {
              color: '#3c3c3c',
            },
          ],
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry',
          stylers: [
            {
              color: '#4e4e4e',
            },
          ],
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#616161',
            },
          ],
        },
        {
          featureType: 'transit',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#757575',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [
            {
              color: '#000000',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#3d3d3d',
            },
          ],
        },
      ],
      night: [
        {
          elementType: 'geometry',
          stylers: [
            {
              color: '#242f3e',
            },
          ],
        },
        {
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#746855',
            },
          ],
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#242f3e',
            },
          ],
        },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#d59563',
            },
          ],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#d59563',
            },
          ],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [
            {
              color: '#263c3f',
            },
          ],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#6b9a76',
            },
          ],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [
            {
              color: '#38414e',
            },
          ],
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [
            {
              color: '#212a37',
            },
          ],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#9ca5b3',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [
            {
              color: '#746855',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [
            {
              color: '#1f2835',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#f3d19c',
            },
          ],
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [
            {
              color: '#2f3948',
            },
          ],
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#d59563',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [
            {
              color: '#17263c',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#515c6d',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#17263c',
            },
          ],
        },
      ],
      aubergine: [
        {
          elementType: 'geometry',
          stylers: [
            {
              color: '#1d2c4d',
            },
          ],
        },
        {
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#8ec3b9',
            },
          ],
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#1a3646',
            },
          ],
        },
        {
          featureType: 'administrative.country',
          elementType: 'geometry.stroke',
          stylers: [
            {
              color: '#4b6878',
            },
          ],
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#64779e',
            },
          ],
        },
        {
          featureType: 'administrative.province',
          elementType: 'geometry.stroke',
          stylers: [
            {
              color: '#4b6878',
            },
          ],
        },
        {
          featureType: 'landscape.man_made',
          elementType: 'geometry.stroke',
          stylers: [
            {
              color: '#334e87',
            },
          ],
        },
        {
          featureType: 'landscape.natural',
          elementType: 'geometry',
          stylers: [
            {
              color: '#023e58',
            },
          ],
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [
            {
              color: '#283d6a',
            },
          ],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#6f9ba5',
            },
          ],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#1d2c4d',
            },
          ],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry.fill',
          stylers: [
            {
              color: '#023e58',
            },
          ],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#3C7680',
            },
          ],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [
            {
              color: '#304a7d',
            },
          ],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#98a5be',
            },
          ],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#1d2c4d',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [
            {
              color: '#2c6675',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [
            {
              color: '#255763',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#b0d5ce',
            },
          ],
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#023e58',
            },
          ],
        },
        {
          featureType: 'transit',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#98a5be',
            },
          ],
        },
        {
          featureType: 'transit',
          elementType: 'labels.text.stroke',
          stylers: [
            {
              color: '#1d2c4d',
            },
          ],
        },
        {
          featureType: 'transit.line',
          elementType: 'geometry.fill',
          stylers: [
            {
              color: '#283d6a',
            },
          ],
        },
        {
          featureType: 'transit.station',
          elementType: 'geometry',
          stylers: [
            {
              color: '#3a4762',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [
            {
              color: '#0e1626',
            },
          ],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [
            {
              color: '#4e6d70',
            },
          ],
        },
      ],
    };

    var errors = {
      addressNoResults: StyleHatch.Strings.addressNoResults,
      addressQueryLimit: StyleHatch.Strings.addressQueryLimit,
      addressError: StyleHatch.Strings.addressError,
      authError: StyleHatch.Strings.authError,
    };

    var selectors = {
      section: '[data-section-type="maps"]',
      map: '[data-map]',
      mapOverlay: '[data-map-overlay]',
    };

    var classes = {
      mapError: 'map-selection--load-error',
      errorMsg: 'map-section__errors errors text-center',
    };

    // Global Google function for auth errors
    window.gm_authFailure = function() {
      if (!Shopify.designMode) {
        console.log('Google Maps authentication error', window.google, apiStatus);
        return;
      }

      $(selectors.section).addClass(classes.mapError);
      $(selectors.map).remove();
      $(selectors.mapOverlay).after(
        '<div class="' +
          classes.errorMsg +
          '">' +
          StyleHatch.Strings.authError +
          '</div>'
      );
    };

    function Map(container) {
      this.$container = $(container);
      this.$map = this.$container.find(selectors.map);
      this.key = this.$map.data('api-key');

      if (this.key != apiKey) {
        apiKey = this.key;
        apiStatus = null;
        apiKeyReset = true;
      }

      if (typeof this.key === 'undefined') {
        return;
      }

      if (apiStatus === 'loaded') {
        this.createMap();
      } else {
        mapsToLoad.push(this);
        var mapElement = this;

        if (apiStatus !== 'loading') {
          apiStatus = 'loading';
          if (typeof window.google === 'undefined' || apiKeyReset) {
            $.getScript(
              'https://maps.googleapis.com/maps/api/js?key=' + this.key
            ).then(function() {
              apiStatus = 'loaded';
              apiKeyReset = false;
              initAllMaps(mapElement);
            });
          }
        }
      }
    }

    function initAllMaps(mapElement) {
      document.addEventListener('lazybeforeunveil', function(e) {
        if ($(e.target).attr('data-section-type')) {
          mapElement.createMap();
        }
      });

      $.each(mapsToLoad, function(index, instance) {
        if (instance.$container.hasClass('lazyloaded')) {
          mapElement.createMap();
        }
      });
    }

    function geolocate($map) {
      var deferred = $.Deferred();
      var geocoder = new google.maps.Geocoder();
      var address = $map.data('address-setting');

      geocoder.geocode({address: address}, function(results, status) {
        if (status !== google.maps.GeocoderStatus.OK) {
          deferred.reject(status);
        }

        deferred.resolve(results);
      });

      return deferred;
    }

    Map.prototype = $.extend({}, Map.prototype, {
      createMap: function() {
        var $map = this.$map;
        var mapStyle = $map.data('map-style');

        return geolocate($map)
          .then(
            function(results) {
              var mapOptions = {
                zoom: config.zoom,
                center: results[0].geometry.location,
                draggable: false,
                clickableIcons: false,
                scrollwheel: false,
                disableDoubleClickZoom: true,
                disableDefaultUI: true,
                styles: mapStyles[mapStyle],
              };

              var map = (this.map = new google.maps.Map($map[0], mapOptions));
              var center = (this.center = map.getCenter());

              //eslint-disable-next-line no-unused-vars
              var marker = new google.maps.Marker({
                map: map,
                position: map.getCenter(),
              });

              google.maps.event.addDomListener(
                window,
                'resize',
                slate.utils.debounce(function() {
                  google.maps.event.trigger(map, 'resize');
                  map.setCenter(center);
                  $map.removeAttr('style');
                }, 250)
              );
            }.bind(this)
          )
          .fail(function() {
            var errorMessage;

            switch (status) {
              case 'ZERO_RESULTS':
                errorMessage = errors.addressNoResults;
                break;
              case 'OVER_QUERY_LIMIT':
                errorMessage = errors.addresQueryLimit;
                break;
              case 'REQUEST_DENIED':
                errorMessage = errors.authError;
                break;
              default:
                errorMessage = errors.addressError;
                break;
            }

            // Show errors only to merchant in the editor.
            if (Shopify.designMode) {
              $map
                .parent()
                .addClass(classes.mapError)
                .append(
                  '<div class="' +
                    classes.errorMsg +
                    '">' +
                    errorMessage +
                    '</div>'
                );
            }
          });
      },

      onUnload: function() {
        if (this.$map.length === 0) {
          return;
        }
        google.maps.event.clearListeners(this.map, 'resize');
      },
    });

    return Map;
  })();

  /**
   * Page Section - any section that loads pages
   */
  StyleHatch.PageSection = (function() {
    function PageSection(container) {
      var $container = (this.$container = $(container));
      var id = $container.attr('data-section-id');
      StyleHatch.Page.init($container);
    }

    return PageSection;
  })();
  // Featured Text Class
  StyleHatch.Page = (function() {
    // Initialization
    function init($container) {
      // Apply fitVids
      $container.fitVids();
      // Possibly check for oembed data
    }

    // Unload
    function unload(evt) {
      //console.log('unload Page');
    }

    // Public methods
    return {
      init: init,
      unload: unload,
    };
  })();

  /**
   * Sections - Collection
   * ---------------------------------------------------------------------------
   * Feature collection
   */
  StyleHatch.FeaturedCollectionSection = (function() {
    function FeaturedCollectionSection(container) {
      var $container = (this.$container = $(container));
      var id = $container.attr('data-section-id');
      $container.productBox();
    }

    return FeaturedCollectionSection;
  })();
  StyleHatch.FeaturedCollectionSection.prototype = $.extend(
    {},
    StyleHatch.FeaturedCollectionSection.prototype,
    {
      onUnload: function(evt) {
        var $container = $('#section-' + evt.detail.sectionId);
        var id = $container.attr('data-section-id');
        $container.destroyProductBox();
      },
    }
  );

  StyleHatch.SimpleCollectionSection = (function() {
    function SimpleCollectionSection(container) {
      var $container = (this.$container = $(container));
      var id = $container.attr('data-section-id');
      $container.productBox();
    }

    return SimpleCollectionSection;
  })();
  StyleHatch.SimpleCollectionSection.prototype = $.extend(
    {},
    StyleHatch.SimpleCollectionSection.prototype,
    {
      onUnload: function(evt) {
        var $container = $('#section-' + evt.detail.sectionId);
        var id = $container.attr('data-section-id');

        $container.destroyProductBox();
      },
    }
  );

  /**
   * Instagram - instagram-section
   */

  StyleHatch.LooksSection = (function() {
    function LooksSection(container) {
      var $container = (this.$container = $(container));
      var id = $container.attr('data-section-id');
      StyleHatch.Looks.init($container);
    }

    return LooksSection;
  })();

  StyleHatch.LooksSection.prototype = $.extend(
    {},
    StyleHatch.LooksSection.prototype,
    {
      onUnload: function(evt) {
        StyleHatch.Looks.unload(evt);
      },
      onBlockSelect: function(evt) {
        StyleHatch.Looks.unload(evt);
      },
      onBlockDeselect: function(evt) {
        StyleHatch.Looks.unload(evt);
      },
    }
  );

  StyleHatch.Looks = (function() {
    function init($container) {
      var $overlayLink = $('.looks__item--overlay', $container);
      $overlayLink.on('click', function(e) {
        var $item = $(this).closest('.looks__item');
        var id = $item.data('id');
        var enabled = $(this).data('overlay');

        if (enabled) {
          var $overlay = createOverlay($item);

          $.magnificPopup.open({
            items: {
              src: $overlay,
              type: 'inline',
            },
            callbacks: {
              open: function() {
                $('.mfp-content .looks__overlay img.card__image')
                  .removeClass('lazyloaded')
                  .addClass('lazyload');
                slate.a11y.trapFocus({
                  $container: $('.mfp-content .looks__overlay'),
                  namespace: 'looksOverlayFocus',
                });
              },
              close: function() {
                slate.a11y.removeTrapFocus({
                  $container: $('.mfp-content .looks__overlay'),
                  namespace: 'looksOverlayFocus',
                });
              },
            },
          });
          e.preventDefault();
        }

      });
    }

    function createOverlay($item) {
      var $overlay = $('.looks__overlay', $item);
      if ($overlay.length === 0) {
        // Get elements
        var $products = $('.looks__products', $item);
        var $image = $('.card__image-wrapper', $item).clone();
        var $caption = $('.looks__caption', $item).clone();
        var $rte = $('.looks__caption--text', $caption);
        $rte.html($rte.attr('data-rte'));
        // Wrap products
        $products.wrap(
          '<div class="looks__overlay"><div class="looks__overlay-content"></div></div>'
        );
        $overlay = $('.looks__overlay', $item);
        var $overlayContent = $('.looks__overlay-content', $item);

        // Append cloned and noncloned items
        $overlayContent.prepend($caption);
        $overlay.prepend('<div class="looks__overlay-image"></div>');
        $('.looks__overlay-image', $item).append($image);
      }
      return $overlay;
    }

    function unload(evt) {
      $.magnificPopup.close();
    }

    return {
      init: init,
      unload: unload,
    };
  })();

  /**
   * GenericSection
   */
  StyleHatch.GenericSection = (function() {
    function GenericSection(container) {
      var $container = (this.$container = $(container));
      var id = $container.attr('data-section-id');

      StyleHatch.cacheSelectors();
    }

    return GenericSection;
  })();

  /**
   * Section - Templates
   * ---------------------------------------------------------------------------
   * Set up core functionality for template based sections
   */

  // Product Class
  StyleHatch.Product = (function() {
    function Product(container) {
      var $container = (this.$container = $(container));
      var sectionId = $container.attr('data-section-id');

      this.settings = {
        // Breakpoints from src/stylesheets/global/variables.scss.liquid
        enableHistoryState: $container.data('enable-history-state') || false,
        enableSwatch: $container.data('enable-swatch') || false,
        imageSize: '394x',
        imageZoomSize: null,
        namespace: '.product-' + sectionId,
        sectionId: sectionId,
        zoomEnabled: false,
        lightboxEnabled: false,
        productImageLightboxData: [],
      };

      this.selectors = {
        addToCartForm: '#AddToCartForm-' + sectionId,
        addToCart: '#AddToCart-' + sectionId,
        addToCartText: '#AddToCartText-' + sectionId,
        comparePrice: '#ComparePrice-' + sectionId,
        savings: '#Savings-' + sectionId,
        originalPrice: '#ProductPrice-' + sectionId,
        SKU: '.variant-sku',
        originalSelectorId: '#ProductSelect-' + sectionId,
        productFeaturedImage: '#FeaturedImage-' + sectionId,
        productImageWrap: '.featured-container-' + sectionId,
        productPrices: '.product-single__price-' + sectionId,
        productThumbImages: '.product-single__thumbnail--' + sectionId,
        productPhoto: '#ProductPhoto-' + sectionId,
        productImage: '#ProductImage-' + sectionId,
        productThumbs: '#ProductThumbs-' + sectionId,
        quantityWrap: '.quantity-' + sectionId,
        quantity: '.quantity-select-' + sectionId,
        cartError: '.cart-error-' + sectionId,
        singleOptionSelector: '.single-option-selector-' + sectionId,
        cartButtons: '#CartButtons-' + sectionId,
        paymentButtonContainer: '#PaymentButtonContainer-' + sectionId,
        productSizeGuideLink: 'a.product-size-guide-' + sectionId,
        productSizeGuideContent: '#product-size-guide-content-' + sectionId,
        productMediaWrapper: '[data-product-single-media-wrapper]',
        productMediaTypeVideo: '[data-product-media-type-video]',
        productMediaTypeModel: '[data-product-media-type-model]',
        productMediaGroup: '[data-product-single-media-group]',
        priceContainer: '[data-price]',
        unitPrice: '[data-unit-price]',
        unitPriceBaseUnit: '[data-unit-price-base-unit]',
        storeAvailabilityContainer: '[data-store-availability-container]',
      };

      this.classes = {
        activeMedia: 'active-media',
        productUnitAvailable: 'price--unit-available',
      };

      this._initSlider();

      // Stop parsing if we don't have the product json script tag when loading
      // section in the Theme Editor
      if (!$('#ProductJson-' + sectionId).html()) {
        return;
      }

      this.productSingleObject = JSON.parse(
        document.getElementById('ProductJson-' + sectionId).innerHTML
      );

      this.settings.zoomEnabled = $(this.selectors.productImageWrap).hasClass(
        'featured-zoom'
      );
      if ('objectFit' in document.documentElement.style === true) {
        this.settings.lightboxEnabled = $(this.selectors.productImageWrap).data(
          'lightbox'
        );
      }
      $container.productBox();

      this.storeAvailabilityContainer = container.querySelector(
        this.selectors.storeAvailabilityContainer
      );
      if (this.storeAvailabilityContainer) {
        this.storeAvailability = new theme.StoreAvailability(
          this.storeAvailabilityContainer
        );
      }

      this._initVariants();
      this._initQuanitySelect();
      this._initProductVideo();
      this._initModelViewerLibraries();
      this._initShopifyXrLaunch();

      if ($(this.selectors.productSizeGuideLink).length) {
        $(this.selectors.productSizeGuideLink).magnificPopup({
          items: {
            src: $(this.selectors.productSizeGuideContent),
            type: 'inline',
          },
        });
      }

      // Product tabs
      var $tabs = $container.find('.description__tabs');
      var $tab = $tabs.find('.tab');
      var $tabTitle = $tabs.find('.tab__title');

      $tabTitle.on('click keydown', function(evt) {
        var trigger = false;
        if (evt.type === 'click') {
          trigger = true;
        }
        if (evt.type === 'keydown' && evt.key == 'Enter') {
          trigger = true;
        }

        if (trigger) {
          var $tab = $(this).closest('.tab');
          var $activeTab = $tabs.find('.tab--active');

          // Close it if open
          // Otherwise close active and open new
          if ($tab.hasClass('tab--active')) {
            $tab.removeClass('tab--active');
            $tab.find('.tab__content').slideUp(400);
          } else {
            $activeTab.removeClass('tab--active');
            $activeTab.find('.tab__content').slideUp(400);
            $tab.addClass('tab--active');
            $tab.find('.tab__content').slideDown(400);
            setTimeout(function() {
              $tab.find('.tab__title').scrollIntoView({
                duration: 400,
                direction: 'vertical',
                viewPadding: { y: 0 }
              });
            }, 400)
            
          }
        }
      });
    }

    Product.prototype = $.extend({}, Product.prototype, {
      _initVariants: function() {
        var options = {
          $container: this.$container,
          enableHistoryState:
            this.$container.data('enable-history-state') || false,
          enableSwatch: this.$container.data('enable-swatch'),
          singleOptionSelector: this.selectors.singleOptionSelector,
          originalSelectorId: this.selectors.originalSelectorId,
          product: this.productSingleObject,
        };
        this.optionsMap = {};

        this.variants = new slate.Variants(options);

        if (this.storeAvailability) {
          this.storeAvailability.updateContent(
            this.variants.currentVariant.id,
            this.productSingleObject.title
          );
        }


        if (options.enableSwatch) {
          this._linkOptionSelectors(this.productSingleObject);
          this.$container.on(
            'variantSwatchChange' + this.settings.namespace,
            this._updateSwatches.bind(this)
          );
        }

        this.$container.on(
          'variantChange' + this.settings.namespace,
          this._updateAvailability.bind(this)
        );
        this.$container.on(
          'variantImageChange' + this.settings.namespace,
          this._updateImages.bind(this)
        );
        this.$container.on(
          'variantPriceChange' + this.settings.namespace,
          this._updatePrice.bind(this)
        );
        this.$container.on(
          'variantSKUChange' + this.settings.namespace,
          this._updateSKU.bind(this)
        );

        // Initial call to trigger variant change for initial load
        var currentVariant = this.variants.currentVariant;
        this.$container.trigger({
          type: 'variantChange' + this.settings.namespace,
          variant: currentVariant,
        });
      },

      _initQuanitySelect: function() {
        // Quantity Selector
        var $quantitySelect = $(this.selectors.quantity);
        $quantitySelect.each(function() {
          var $el = $(this);
          var $quantityDown = $el.find('.adjust-minus');
          var $quantityUp = $el.find('.adjust-plus');
          var $quantity = $el.find('input.quantity');

          var quantity = $quantity.val();

          $quantityDown.on('click', function(e) {
            quantity = $quantity.val();
            if (quantity > 1) {
              quantity--;
              $quantity.val(quantity);
            }
            e.preventDefault();
          });

          $quantityUp.on('click', function(e) {
            quantity = $quantity.val();
            quantity++;
            $quantity.val(quantity);

            e.preventDefault();
          });
        });
      },

      _switchInert: function(mediaId) {
        var $newMedia = $(
          this.selectors.productMediaWrapper +
            '[data-media-id="' +
            mediaId +
            '"]'
        );
        var $otherMedia = $(
          this.selectors.productMediaWrapper +
            ':not([data-media-id="' +
            mediaId +
            '"])'
        );

        $newMedia.removeAttr('inert');
        $otherMedia.attr('inert', 'true');
      },

      _switchMedia: function(mediaId) {
        var $newMedia = $(
          this.selectors.productMediaWrapper +
            '[data-media-id="' +
            mediaId +
            '"]'
        );
        var $otherMedia = $(
          this.selectors.productMediaWrapper +
            ':not([data-media-id="' +
            mediaId +
            '"])'
        );

        var dataType = $newMedia.attr('data-media-type');
        var $innerMedia;
        switch (dataType) {
          case 'model':
            $innerMedia = $newMedia.find('.product-single__media model-viewer');
            break;

          case 'external_video':
            $innerMedia = $newMedia.find('.product-single__media iframe');
            break;

          case 'video':
            $innerMedia = $newMedia.find('.product-single__media .plyr');
            break;
        }

        waitFor(
          function() {
            if (dataType !== 'image') {
              return isFocusable($innerMedia[0]);
            } else {
              return true;
            }
          },
          function() {
            // Callback when focus is triggered
          }
        );

        $otherMedia
          .trigger('mediaHidden')
          .removeClass(this.classes.activeMedia);
        $newMedia.trigger('mediaVisible').addClass(this.classes.activeMedia);

        // If new media is model kill flickity draggability
        if ($newMedia.attr('data-media-type') == 'model') {
          this.flkty.options.draggable = false;
        } else {
          this.flkty.options.draggable = true;
        }
        this.flkty.updateDraggable();
      },

      _initSlider: function() {
        var $imageSlider = this.$container.find('.product-image--slider');
        if ($imageSlider.length) {
          var sliderOptions = $imageSlider.data('flickity-options');
          var enabled = $imageSlider.data('slider-enabled');
          var zoomEnabled = $imageSlider.data('zoom');

          var lightboxEnabled = $imageSlider.data('lightbox');
          var $initial = $imageSlider.find('[data-initial-image]');
          var initialIndex = $initial
            .parent()
            .find('.product-image--cell')
            .index($initial);
          sliderOptions.initialIndex = initialIndex;
          if (!enabled) {
            sliderOptions.draggable = false;
            sliderOptions.selectedAttraction = 1;
            sliderOptions.friction = 1;
          }

          $initial.removeAttr('data-initial-image');
          $imageSlider.flickity(sliderOptions);
          this.flkty = $imageSlider.data('flickity');

          if ($initial.attr('data-media-type') == 'model') {
            this.flkty.options.draggable = false;
            this.flkty.updateDraggable();
          }

          $imageSlider
            .parent()
            .find('.flickity-page-dots.placeholder')
            .remove();

          var self = this;
          $imageSlider.on('change.flickity', function(event, index) {
            var $slider = $(this);
            var $cell = $slider.find('.product-image--cell').eq(index);
            var mediaId = $cell.attr('data-media-id');

            self._switchInert(mediaId);
          });

          var firstSettle = false;
          $imageSlider.on('settle.flickity', function(event, index) {
            if (firstSettle) {
              var $slider = $(this);
              var $cell = $slider.find('.product-image--cell').eq(index);
              var mediaId = $cell.attr('data-media-id');

              self._switchMedia(mediaId);
            }
            firstSettle = true;
          });

          if (!theme.Helpers.isTouch() && zoomEnabled) {
            var $easyzoom = $(
              '.product-image--cell[data-media-type="image"]'
            ).easyZoom();
            $imageSlider
              .on('dragStart.flickity', function (event) {
                var $zoom = $(event.currentTarget).find('.easyzoom-flyout');
                $zoom.addClass('hidden');
              })
              .on('dragEnd.flickity', function (event) {
                var $zoom = $(event.currentTarget).find('.easyzoom-flyout');
                $zoom.removeClass('hidden');
              });
          }

          $imageSlider.on('dragStart.flickity', function(event, pointer) {
            document.ontouchmove = function(e) {
              e.preventDefault();
            };
          });
          $imageSlider.on('dragEnd.flickity', function(event, pointer) {
            document.ontouchmove = function(e) {
              return true;
            };
          });
          $imageSlider.find('a').on('click', function(e) {
            e.preventDefault();
          });

          if (
            lightboxEnabled &&
            'objectFit' in document.documentElement.style === true
          ) {
            $imageSlider.on('staticClick.flickity', function () {
              if (
                $imageSlider.find('.is-selected').attr('data-media-type') ==
                'image'
              ) {
                $imageSlider.flickity('toggleFullscreen');
              }
            });
            $imageSlider.on('fullscreenChange.flickity', function (
              event,
              isFullscreen
            ) {
              if (isFullscreen) {
                $imageSlider.parent().addClass('is-fullscreen');
                lazySizes.autoSizer.checkElems();
              } else {
                $imageSlider.parent().removeClass('is-fullscreen');
              }
            });
          }
        }

        // Flickity thumb slider
        var $thumbSlider = this.$container.find('.product-thumb--slider');

        if ($thumbSlider.length) {
          var sliderOptions = $thumbSlider.data('flickity-options');
          var enabled = $thumbSlider.data('slider-enabled');

          // If the grouped thumbnails option is turned on
          if (enabled) {
            var $initial = $thumbSlider.find('[data-initial-image]');
            var initialIndex = $initial
              .parent()
              .find('.product-thumb--cell')
              .index($initial);
            sliderOptions.initialIndex = initialIndex;

            $initial.removeAttr('data-initial-image');
            $thumbSlider.flickity(sliderOptions);

            var thumbFlkty = $thumbSlider.data('flickity');
            window.thumbFlkty = thumbFlkty;

            $thumbSlider
              .find('.product-thumb--cell')
              .on('keypress', function(e) {
                var keycode = event.keyCode ? event.keyCode : event.which;
                if (keycode == '13') {
                  $imageSlider.flickity('select', $(this).index());
                }
              });

            // Focus events
            $thumbSlider.find('.product-thumb--cell').on('focus', function(e) {
              var index = $(this).index();
              var cell = thumbFlkty.queryCell(index);
              var slideIndex = thumbFlkty.getCellSlideIndex(cell);
              var target = thumbFlkty.slides[slideIndex].target;
              thumbFlkty.x = -target;
              thumbFlkty.positionSlider();
              $(thumbFlkty.viewport)[0].scrollTo(0, 0);
            });

            $thumbSlider.find('a').on('click', function(e) {
              e.preventDefault();
            });
            $thumbSlider.on('dragStart.flickity', function(event, pointer) {
              document.ontouchmove = function(e) {
                e.preventDefault();
              };
            });
            $thumbSlider.on('dragEnd.flickity', function(event, pointer) {
              document.ontouchmove = function(e) {
                return true;
              };
            });
            $thumbSlider.find('button.flickity-button').attr('tabindex', '-1');
          } else {
            var $initial = $thumbSlider.find('[data-initial-image]');

            $initial.addClass('is-nav-selected');
            $initial.removeAttr('data-initial-image');

            $thumbSlider.find('.product-thumb--cell').on('click', function(e) {
              var $thumb = $(this);
              var id = $thumb.data('media-id');
              var selector = '[data-media-id="' + id + '"]';

              $imageSlider.flickity('selectCell', selector);

              $thumbSlider
                .find('.is-nav-selected')
                .removeClass('is-nav-selected');

              $(this).addClass('is-nav-selected');

              e.preventDefault();
            });

            $thumbSlider.find('a').on('click', function(e) {
              e.preventDefault();
            });

            $thumbSlider
              .find('.product-thumb--cell')
              .on('keypress', function(e) {
                var keycode = event.keyCode ? event.keyCode : event.which;
                if (keycode == '13') {
                  $imageSlider.flickity('select', $(this).index());

                  $thumbSlider
                    .find('.is-nav-selected')
                    .removeClass('is-nav-selected');
                  $(this).addClass('is-nav-selected');
                }
              });
          }

          // IE fix for object-fit
          if ('objectFit' in document.documentElement.style === false) {
            $thumbSlider.find('.product-thumb--cell a').each(function () {
              var $container = $(this);
              var imgUrl = $container.find('img').prop('src');

              $container.css({
                'background-image': 'url(' + imgUrl + ')',
              });

              $container.addClass('fallback-object-fit');
            });
          }
        }

        // Basic non flickity thumbnails
        var $thumbs = this.$container.find('.thumbnails');
        if ($thumbs.length) {
          $thumbs.find('a').on('click', function(e) {
            var $thumb = $(this);
            var id = $thumb.data('media-id');
            var selector = '[data-media-id="' + id + '"]';

            $imageSlider.flickity('selectCell', selector);

            // $thumb
            //   .parent()
            //   .parent()
            //   .find('.' + 'active')
            //   .removeClass('active');
            // $thumb.addClass('active');

            $thumbs.find('.' + 'active').removeClass('active');
            var $activeThumb = $thumbs.find('[data-media-id="' + id + '"]');
            $activeThumb.addClass('active');

            var $thumbsList = $thumbs.find('[data-productthumbs]');
            if ($thumbsList.height() > $thumbs.height()) {
              if ($thumbs.data('enable-group') && $thumbs.is(':visible')) {
                setTimeout(function() {
                  $activeThumb.scrollIntoView();
                }, 200);
              }
            }

            e.preventDefault();
          });

          // Resize thumbnail container on slider height change
          if ($thumbs.data('enable-group')) {
            $thumbs.css({
              'overflow-y': 'scroll',
              position: 'relative',
            });

            $imageSlider.resize(function() {
              $thumbs.height(
                $(this)
                  .find('.flickity-viewport')
                  .height()
              );
            });

            var $thumbsList = $thumbs.find('[data-productthumbs]');

            setTimeout(function() {
              if ($thumbsList.height() > $thumbs.height()) {
                $thumbs.find('a.active').scrollIntoView();
              }
            }, 200);

            $thumbs.find('li').each(function(i) {
              $(this)
                .delay(i * 100)
                .fadeTo(200, 1);
            });
          }
        }
      },

      _initProductVideo: function() {
        var sectionId = this.settings.sectionId;

        $(this.selectors.productMediaTypeVideo, this.$container).each(
          function() {
            var $el = $(this);
            theme.ProductVideo.init($el, sectionId);
          }
        );
      },

      _initModelViewerLibraries: function() {
        var $modelViewerElements = $(
          this.selectors.productMediaTypeModel,
          this.$container
        );
        if ($modelViewerElements.length < 1) return;
        theme.ProductModel.init($modelViewerElements, this.settings.sectionId);
      },

      _initShopifyXrLaunch: function() {
        var self = this;
        $(document).on('shopify_xr_launch', function() {
          var $currentMedia = $(
            self.selectors.productMediaWrapper +
              ':not(.' +
              self.classes.hidden +
              ')',
            self.$container
          );
          $currentMedia.trigger('xrLaunch');
        });
      },

      _linkOptionSelectors: function(product) {
        // Building our mapping object
        for (var i = 0; i < product.variants.length; i++) {
          var variant = product.variants[i];
          if (variant.available) {
            // Gathering values for the 1st option group
            this.optionsMap['root'] = this.optionsMap['root'] || [];
            this.optionsMap['root'].push(variant.option1);
            this.optionsMap['root'] = $.unique(this.optionsMap['root']);
            // Gathering values for the 2nd option group
            if (product.options.length > 1) {
              var key = variant.option1;
              this.optionsMap[key] = this.optionsMap[key] || [];
              this.optionsMap[key].push(variant.option2);
              this.optionsMap[key] = $.unique(this.optionsMap[key]);
            }
            // Gathering values for the 3rd option group
            if (product.options.length === 3) {
              var key = variant.option1 + ' / ' + variant.option2;
              this.optionsMap[key] = this.optionsMap[key] || [];
              this.optionsMap[key].push(variant.option3);
              this.optionsMap[key] = $.unique(this.optionsMap[key]);
            }
          }
        }

        // Update options right away
        this._updateOptionsInSelector(0);
        if (product.options.length > 1) this._updateOptionsInSelector(1);
        if (product.options.length === 3) this._updateOptionsInSelector(2);
      },

      _updateOptionsInSelector: function(selectorIndex) {
        switch (selectorIndex) {
          case 0:
            var key = 'root';
            var selector = $(
              '.single-option-radio:eq(0)',
              this.selectors.addToCartForm
            );
            break;
          case 1:
            var key = $(
              'input:checked',
              this.selectors.addToCartForm + ' .single-option-radio:eq(0)'
            ).val();
            var selector = $(
              '.single-option-radio:eq(1)',
              this.selectors.addToCartForm
            );
            break;
          case 2:
            var key = $(
              'input:checked',
              this.selectors.addToCartForm + ' .single-option-radio:eq(0)'
            ).val();
            key +=
              ' / ' +
              $(
                'input:checked',
                this.selectors.addToCartForm + ' .single-option-radio:eq(1)'
              ).val();
            var selector = $(
              '.single-option-radio:eq(2)',
              this.selectors.addToCartForm
            );
            break;
        }

        var initialValue = $('input:checked', selector).val();
        var availableOptions = this.optionsMap[key];

        var optionIndex = selectorIndex + 1;
        $(
          '.radio-wrapper[data-option-index="' +
            optionIndex +
            '"] input.single-option-selector__radio',
          this.selectors.addToCartForm
        ).each(function() {
          if ($.inArray($(this).val(), availableOptions) !== -1) {
            $(this)
              .parent()
              .removeClass('soldout');
          } else {
            $(this)
              .parent()
              .addClass('soldout');
          }
        });

        var $optionGroup = $(
          '.radio-wrapper[data-option-index="' + optionIndex + '"]',
          this.selectors.addToCartForm
        );
        var $selectedSwatch = $optionGroup.find('input:checked').parent();

        if (
          $selectedSwatch.hasClass('soldout') &&
          $selectedSwatch.attr('data-variant-swatch-soldout') == 'true'
        ) {
          var $availableSwatch = $optionGroup
            .find('.swatch-container:not(.soldout)')
            .eq(0);
          if ($availableSwatch.length > 0) {
            $availableSwatch.find('input').trigger('click');
          }
        }
      },

      _updateAddToCart: function(evt) {
        var variant = evt.variant;
        var dynamicCheckout = $(this.selectors.addToCartForm).data(
          'dynamic-checkout'
        );

        if (variant) {
          $(this.selectors.cartError).hide();
          $(this.selectors.productPrices)
            .removeClass('visibility-hidden')
            .attr('aria-hidden', 'true');

          if (variant.available) {
            $(this.selectors.addToCart)
              .removeClass('disabled')
              .prop('disabled', false);
            var addToCartText = StyleHatch.Strings.addToCart;
            if ($(this.selectors.addToCart)[0].hasAttribute('data-preorder')) {
              addToCartText = StyleHatch.Strings.preOrder;
            }
            $(this.selectors.addToCartText).text(addToCartText);
            $(this.selectors.quantityWrap).show();
            if (dynamicCheckout) {
              $(this.selectors.cartButtons).addClass('cart-buttons__enabled');
            }
          } else {
            // The variant doesn't exist, disable submit button and change the text.
            // This may be an error or notice that a specific variant is not available.
            $(this.selectors.addToCart)
              .addClass('disabled')
              .prop('disabled', true);
            $(this.selectors.addToCartText).text(StyleHatch.Strings.soldOut);
            $(this.selectors.quantityWrap).hide();
            if (dynamicCheckout) {
              $(this.selectors.cartButtons).removeClass(
                'cart-buttons__enabled'
              );
            }
          }
        } else {
          $(this.selectors.addToCart)
            .addClass('disabled')
            .prop('disabled', true);
          $(this.selectors.addToCartText).text(StyleHatch.Strings.soldOut);
          $(this.selectors.productPrices)
            .addClass('visibility-hidden')
            .attr('aria-hidden', 'false');
          $(this.selectors.quantityWrap).hide();
          if (dynamicCheckout) {
            $(this.selectors.cartButtons).removeClass('cart-buttons__enabled');
          }
        }
      },

      _updateSwatches: function(evt) {
        var currentVariant = evt.variant;
        var $swatch = $(evt.currentTarget).find('[type=radio]');
        var $radioWrapper = $(evt.currentTarget).find('.radio-wrapper');
        var Product = this;

        // Update options right away
        this._updateOptionsInSelector(0);
        if (Product.productSingleObject.options.length > 1)
          this._updateOptionsInSelector(1);
        if (Product.productSingleObject.options.length === 3)
          this._updateOptionsInSelector(2);

        $radioWrapper.each(function() {
          var $radioWrapper = $(this);
          var currentOption = 'option' + $radioWrapper.data('option-index');
          var $labelValue = $radioWrapper.find(
            '.single-option-radio__label--value'
          );

          if ($labelValue.length && currentVariant) {
            var value = currentVariant[currentOption];
            $labelValue.text(value);
          }
        });
      },

      _updateImages: function(evt) {
        var variant = evt.variant;
        // console.log('updateImages', variant.featured_media);

        var sizedImgUrl = theme.Images.getSizedImageUrl(
          variant.featured_image.src,
          this.settings.imageSize
        );
        var zoomSizedImgUrl;

        if (this.settings.zoomEnabled) {
          zoomSizedImgUrl = theme.Images.getSizedImageUrl(
            variant.featured_image.src,
            this.settings.imageZoomSize
          );
        }

        var $thumbnail = $(
          this.selectors.productThumbImages +
            '[data-image-id="' +
            variant.featured_image.id +
            '"]'
        );

        // Slider
        var $imageSlider = this.$container.find('.product-image--slider');
        if ($imageSlider.length) {
          var selector = '[data-image-id="' + variant.featured_media.id + '"]';
          $imageSlider.flickity('selectCell', selector, false, true);
        }
      },

      _updateAvailability: function(evt) {
        if (evt.variant) {
          // update form submit
          this._updateStoreAvailabilityContent(evt);
          this._updateAddToCart(evt);
          this._updatePrice(evt);
        }
      },

      _updateStoreAvailabilityContent: function(evt) {
        if (this.storeAvailability) {
          
          this.storeAvailability.updateContent(
            evt.variant.id,
            this.productSingleObject.title
          );
        }
      },

      _updatePrice: function(evt) {
        var variant = evt.variant;

        var $priceContainer = $(this.selectors.priceContainer, this.$container);
        var $unitPrice = $(this.selectors.unitPrice, $priceContainer);
        var $unitPriceBaseUnit = $(
          this.selectors.unitPriceBaseUnit,
          $priceContainer
        );

        // Update the product price
        $(this.selectors.originalPrice).html(
          theme.Currency.formatMoney(variant.price, StyleHatch.currencyFormat)
        );

        // Update and show the product's compare price if necessary
        if (variant.compare_at_price > variant.price) {
          $(this.selectors.comparePrice)
            .find('span.money')
            .html(
              theme.Currency.formatMoney(
                variant.compare_at_price,
                StyleHatch.currencyFormat
              )
            );
          $(this.selectors.comparePrice).css('display', 'inline');

          var savingsPercentage = Math.round(
            ((variant.compare_at_price - variant.price) * 100) /
              variant.compare_at_price
          );
          var savingsAmount = variant.compare_at_price - variant.price;

          $(this.selectors.savings)
            .find('span.savings--percentage')
            .html(savingsPercentage + '%');
          $(this.selectors.savings)
            .find('span.savings--amount')
            .html(
              theme.Currency.formatMoney(
                savingsAmount,
                StyleHatch.currencyFormat
              )
            );
          $(this.selectors.savings).show();
        } else {
          $(this.selectors.comparePrice).hide();
          $(this.selectors.savings).hide();
        }

        // Unit price
        if (variant.unit_price) {
          $unitPrice.html(
            theme.Currency.formatMoney(
              variant.unit_price,
              StyleHatch.currencyFormat
            )
          );

          $unitPriceBaseUnit.html(slate.utils.getBaseUnit(variant));
          $priceContainer.addClass(this.classes.productUnitAvailable);
        }
      },

      _updateSKU: function(evt) {
        var variant = evt.variant;

        // Update the sku
        $(this.selectors.SKU).html(variant.sku);
      },

      onUnload: function() {
        this.$container.off(this.settings.namespace);
        theme.ProductVideo.removeSectionVideos(this.settings.sectionId);
        theme.ProductModel.removeSectionModels(this.settings.sectionId);
        // destroys on close
        $.magnificPopup.close();
        if (this.settings.zoomEnabled) {
          _destroyZoom($(this.selectors.productImageWrap));
        }
        if (StyleHatch.ajaxCartEnable) {
          StyleHatch.AjaxCart.unload();
        }
        this.$container.destroyProductBox();
      },
    });

    function _enableZoom($el) {
      var $easyzoom = $el.easyZoom();
    }

    function _destroyZoom($el) {
      var easyZoomApi = $el.easyZoom().data('easyZoom');
      easyZoomApi.teardown();
    }

    return Product;
  })();

  StyleHatch.ProductRecommendations = (function() {
    function ProductRecommendations(container) {
      var $container = (this.$container = $(container));
      var productId = $container.data('productId');
      var limit = $container.data('limit');

      var url =
        StyleHatch.routes.product_recommendations_url +
        '?&section_id=product-recommendations&limit=' +
        limit +
        '&product_id=' +
        productId;
      var pageFragmentClass = ' .product-recommendations';
      $container.parent().load(url + pageFragmentClass, function() {
        $(this).productBox();
      });
    }

    ProductRecommendations.prototype = $.extend(
      {},
      ProductRecommendations.prototype,
      {
        onUnload: function() {
          this.$container.destroyProductBox();
        },
      }
    );

    return ProductRecommendations;
  })();

  // Collection (template) Class
  StyleHatch.Collection = (function() {
    var constants = {
      SORT_BY: 'sort_by',
      DEFAULT_SORT: 'title-ascending',
      VIEW: 'view',
    };

    var selectors = {
      sortSelection: '#SortBy',
      defaultSort: '.sort-by__default-sort',
      viewChange: '.change-view',
      advancedFilter: '.advanced-filter a',
      filterCollection: '.mobile-aside-container > a.button.simple',
      mobileAside: '.mobile-aside-container aside',
      productBox: '.box.product .image-table',
      nestedMenu: 'ul.nested-menu',
    };

    function Collection(container) {
      var $container = (this.$container = $(container));
      var sectionId = $container.attr('data-section-id');

      this.$sortSelect = $(selectors.sortSelection, $container);
      this.defaultSort = this._getDefaultSortValue();

      this.$viewButton = $(selectors.viewChange);

      this.$sortSelect.on('change', this._onSortChange.bind(this));
      this.$viewButton.on('click', this._onViewChange);

      this.$productbox = $(selectors.productBox, $container);

      this._initSidebar();
      this._initAdvancedTags();

      $container.productBox();
    }

    Collection.prototype = $.extend({}, Collection.prototype, {
      _onSortChange: function(evt) {
        var query = '';

        this.sort = this._getSortValue();

        if (this.sort !== this.defaultSort) {
          query = {};
          query[constants.SORT_BY] = this.sort;
        }

        window.location.search = decodeURIComponent($.param(query));
      },
      _getSortValue: function() {
        return this.$sortSelect.val() || this.defaultSort;
      },
      _getDefaultSortValue: function() {
        return (
          $(selectors.defaultSort, this.$container).val() ||
          constants.DEFAULT_SORT
        );
      },
      _onViewChange: function(evt) {
        var query = '';

        var view = $(this).data('view');
        var url = document.URL;
        var hasParams = url.indexOf('?') > -1;

        if (hasParams) {
          window.location = replaceUrlParam(url, 'view', view);
        } else {
          window.location = url + '?view=' + view;
        }

        evt.preventDefault();
      },
      _initSidebar: function() {
        $(selectors.filterCollection).on('click', function(e) {
          $(selectors.mobileAside).slideToggle();
          e.preventDefault();
        });

        this.$container.find(selectors.nestedMenu).initNestedMenu();
      },
      _initAdvancedTags: function() {
        var $filters = $(selectors.advancedFilter),
          $tag,
          tagGroup,
          tagHandle,
          $activeTagInGroup;

        $filters.on('click', function(e) {
          $tag = $(this).parent();
          tagGroup = $tag.data('group');
          tagHandle = $tag.data('handle');
          $activeTagInGroup = $('.active[data-group="' + tagGroup + '"]');

          // If the tag clicked is not already active and its group contains an active tag
          // we will swap tag within the group
          if (!$tag.hasClass('active') && $activeTagInGroup.length > 0) {
            e.preventDefault();
            var newPath = window.location.pathname
              .replace($activeTagInGroup.data('handle'), tagHandle)
              .replace(/(&page=\d+)|(page=\d+&)|(\?page=\d+$)/, '');
            window.location.pathname = newPath;
          }
        });
      },
      onUnload: function() {
        this.$sortSelect.off('change');
        this.$viewButton.off('click');
        $(selectors.advancedFilter).off('click');
        this.$container.destroyProductBox();
        this.$container.find(selectors.nestedMenu).destroyNestedMenu();
      },
    });

    return Collection;
  })();

  // List collections (template) Class
  StyleHatch.ListCollections = (function() {
    var selectors = {
      productBox: '.box .image-table',
    };

    function ListCollections(container) {
      var $container = (this.$container = $(container));
      var sectionId = $container.attr('data-section-id');
      var layout = $container.data('layout');
      var $cardImage = $container.find('.card__image');

      this.$productbox = $(selectors.productBox, $container);

      if (layout == 'preview') {
        $container.productBox();
      }
    }

    ListCollections.prototype = $.extend({}, ListCollections.prototype, {
      onUnload: function() {
        $container.destroyProductBox();
      },
    });

    return ListCollections;
  })();

  // Blog and Article (template) Class
  StyleHatch.BlogArticle = (function() {
    var selectors = {
      filterCollection: '.mobile-aside-container > a.button.simple',
      mobileAside: '.mobile-aside-container aside',
      nestedMenu: 'ul.nested-menu',
    };

    function BlogArticle(container) {
      var $container = (this.$container = $(container));
      var sectionId = $container.attr('data-section-id');
      this._initSidebar();
      StyleHatch.videoLayout();
    }

    BlogArticle.prototype = $.extend({}, BlogArticle.prototype, {
      _initSidebar: function() {
        $(selectors.filterCollection).on('click', function(e) {
          $(selectors.mobileAside).slideToggle();
          e.preventDefault();
        });

        this.$container.find(selectors.nestedMenu).initNestedMenu();
      },
      onUnload: function() {
        $(selectors.filterCollection).off('click');
        this.$container.find(selectors.nestedMenu).destroyNestedMenu();
      },
    });

    return BlogArticle;
  })();

  // Password (template) Class
  StyleHatch.Password = (function() {
    function Password(container) {
      var $container = (this.$container = $(container));
      var sectionId = $container.attr('data-section-id');

      var $loginForm = $('#login_form');

      $('.login-popup').magnificPopup({
        type: 'inline',
        midClick: true,
        mainClass: 'mfp-fade',
        closeBtnInside: false,
        callbacks: {
          afterClose: function() {
            $('a').blur();
            $loginForm.find('.errors').remove();
          },
        },
      });

      // On MailChimp form submit
      $('#mc-embedded-subscribe-form').on('submit', function() {
        $('p.signup-message').hide();
        $('p.thanks-message').show();
        $(this)
          .find('.input-row')
          .hide();
      });

      // If error in password form
      if ($loginForm.find('.errors').length > 0) {
        $('.login-popup').magnificPopup('open');
      }
    }

    Password.prototype = $.extend({}, Password.prototype, {
      onUnload: function() {
        // destroys on close
        $.magnificPopup.close();
        $('#mc-embedded-subscribe-form').off('submit');
      },
    });

    return Password;
  })();

  // Cart (template) Class
  StyleHatch.Cart = (function() {
    function Cart(container) {
      var $container = (this.$container = $(container));
      var sectionId = $container.attr('data-section-id');
      var ajaxCart = $container.data('ajax-cart');
      StyleHatch.quantitySelect();

      if (ajaxCart) {
        // Cart.js
        CartJS.init(StyleHatch.cartData);

        // Button events for cart items
        var $cartItems = $('[data-cart-item]', $container);

        // Add events to inital cart items, new are added later
        $cartItems.each(function() {
          addCartItemEvents($(this));
        });

        function addCartItemEvents(item) {
          var $item = item;
          var id = $item.attr('data-cart-item');
          var $itemQuantity = $('[data-cart-item-quantity]', $item);
          var $itemMinus = $('[data-cart-item-quantity-minus]', $item);
          var $itemPlus = $('[data-cart-item-quantity-plus]', $item);
          var $itemRemove = $('[data-cart-item-remove]', $item);

          $itemQuantity.on('blur', function(evt) {
            evt.preventDefault();
            var quantity = $(this).val();
            var $cartItem = $(this).closest('.cart-item');
            var id = $cartItem.attr('data-cart-item');

            $cartItem.addClass('cart-item--pending');
            $('.cart-checkout').addClass('cart-checkout--pending');

            CartJS.updateItemById(id, quantity);
          });
          $itemQuantity.on('keypress', function(evt) {
            if (evt.which === 13) {
              evt.preventDefault();
              var quantity = $(this).val();
              var $cartItem = $(this).closest('.cart-item');
              var id = $cartItem.attr('data-cart-item');

              $cartItem.addClass('cart-item--pending');
              $('.cart-checkout').addClass('cart-checkout--pending');

              CartJS.updateItemById(id, quantity);
            }
          });
          $itemMinus.on('click', function(evt) {
            evt.preventDefault();
            var quantity = $itemQuantity.val();
            var $cartItem = $(this).closest('.cart-item');
            var id = $cartItem.attr('data-cart-item');

            $cartItem.addClass('cart-item--pending');
            $('.cart-checkout').addClass('cart-checkout--pending');

            CartJS.updateItemById(id, quantity);
            if (quantity == 0) {
              $cartItem.attr('data-cart-item', '').remove();
            }
          });
          $itemPlus.on('click', function(evt) {
            evt.preventDefault();
            var quantity = $itemQuantity.val();
            var $cartItem = $(this).closest('.cart-item');
            var id = $cartItem.attr('data-cart-item');

            $cartItem.addClass('cart-item--pending');
            $('.cart-checkout').addClass('cart-checkout--pending');

            CartJS.updateItemById(id, quantity);
          });
          $itemRemove.on('click', function(evt) {
            evt.preventDefault();
            var $cartItem = $(this).closest('.cart-item');
            var id = $cartItem.attr('data-cart-item');

            $('.cart-checkout').addClass('cart-checkout--pending');
            $cartItem.attr('data-cart-item', '').remove();
            CartJS.removeItemById(id);
          });
        }

        $(document).on('cart.requestComplete', function(event, cart) {
          StyleHatch.AjaxCart.updateCartButton(cart);

          if (window.Shopify && Shopify.StorefrontExpressButtons) {
            Shopify.StorefrontExpressButtons.initialize();
          }

          $('.cart-item--pending').removeClass('cart-item--pending');
          $('.cart-checkout--pending').removeClass('cart-checkout--pending');

          var cartItemKeys = [];
          var $previousItem = $('[data-cart-item]', $container).first();
          $.each(cart.items, function(index, cartItem) {
            var id = cartItem.key;
            var quantity = cartItem.quantity;
            var price = theme.Currency.formatMoney(
              cartItem.price,
              StyleHatch.currencyFormat
            );
            var linePrice = theme.Currency.formatMoney(
              cartItem.line_price,
              StyleHatch.currencyFormat
            );

            var $item = $('[data-cart-item="' + id + '"]');
            if ($item.length === 0) {
              var $itemTemplate = $('[data-cart-item]', $container)
                .first()
                .clone();

              // Update key
              if (index === 0) {
                var $newItem = $itemTemplate.insertAfter(
                  $('.label-row', $container)
                );
              } else {
                var $newItem = $itemTemplate.insertAfter($previousItem);
              }

              // Update image
              $newItem.attr('data-cart-item', cartItem.key);
              var sizedImgUrl = theme.Images.getSizedImageUrl(
                cartItem.image,
                '394x'
              );
              $('[data-cart-item-image]', $newItem)
                .attr('src', sizedImgUrl)
                .removeAttr('class')
                .removeAttr('data-widths')
                .removeAttr('data-aspectratio')
                .removeAttr('data-sizes')
                .removeAttr('data-srcset')
                .removeAttr('sizes')
                .removeAttr('srcset');
              $('[data-cart-item-image]', $newItem)
                .parent()
                .removeAttr('class')
                .removeAttr('style');

              // Update title
              $('[data-cart-item-title]', $newItem).html(
                cartItem.product_title
              );

              // Update links
              $('[data-cart-item-href]', $newItem).attr('href', cartItem.url);

              // Update vendor
              $('[data-cart-item-vendor]', $newItem).html(cartItem.vendor);

              // Update variant title
              $('[data-cart-item-variant-title]', $newItem).html(
                cartItem.variant_title
              );

              // Update quantity
              $('[data-cart-item-quantity]', $newItem)
                .val(cartItem.quantity)
                .attr('id', 'updates_' + cartItem.key);

              $newItem
                .find('.quantity-select')
                .removeAttr('data-quantity-select-enabled');
              StyleHatch.quantitySelect();
              addCartItemEvents($newItem);


              // Update price
              // var itemPrice =
              //   '<p><span class="money" data-cart-item-final-price>' +
              //   cartItem.finalPrice +
              //   '</span></p>';
              // $('.cart-item-price', $newItem).html(itemPrice);
              // updateCartItemPrice($newItem, cartItem);
              $item = $newItem;
            }

            var $itemQuantity = $('[data-cart-item-quantity]', $item);
            $itemQuantity.val(quantity);
            // $itemPrice.removeClass('money');
            // $itemPrice.html('<span class="money">' + price + '</span>');

            // $itemLinePrice.removeClass('money');
            // $itemLinePrice.html('<span class="money">' + linePrice + '</span>');
            updateCartItemPrice($item, cartItem);

            cartItemKeys.push(id);

            $previousItem = $item;
          });

          function updateCartItemPrice($item, cartItem) {
            
            // Update line item price
            var finalPrice = theme.Currency.formatMoney(
              cartItem.final_price,
              StyleHatch.currencyFormat
            );
            var originalPrice = theme.Currency.formatMoney(
              cartItem.original_price,
              StyleHatch.currencyFormat
            );

            var itemPriceHTML =
              '<p><span class="money final-price" data-cart-item-final-price>' +
              finalPrice +
              '</span></p>';
            var $cartItemPrice = $('.cart-item-price', $item).html(
              itemPriceHTML
            );

            var finalLinePrice = theme.Currency.formatMoney(
              cartItem.final_line_price,
              StyleHatch.currencyFormat
            );
            var mobileLabel = $('.cart-item-total', $item).attr(
              'data-mobile-label'
            );
            $('.cart-item-total', $item).html(
              '<div class="mobile-label">' +
                mobileLabel +
                '</div>' +
                '<p><span class="money" data-cart-item-line-price>' +
                finalLinePrice +
                '</span></p>'
            );

            if (cartItem.final_price < cartItem.original_price) {
              $('.final-price', $cartItemPrice).addClass(
                'final-price-discount'
              );

              $('.cart-item-price', $item).append(
                '<p><span class="money original-price" data-cart-item-original-price>' +
                  originalPrice +
                  '</p>'
              );

              if (cartItem.discounts.length > 0) {
                $('.cart-item-price', $item).append(
                  '<ul class="cart-item-discounts"></ul>'
                );
                var $discountsList = $('.cart-item-discounts', $item);
                $.each(cartItem.discounts, function(index, discounts) {
                  var title = discounts.title;
                  var amount = theme.Currency.formatMoney(
                    discounts.amount,
                    StyleHatch.currencyFormat
                  );
                  $discountsList.append(
                    '<li class="cart-item-discount"><span class="cart-item-discount-title">' +
                      title +
                      '</span><br><span class="cart-item-discount-amount">(-<span class="money">' +
                      amount +
                      '</span>)</span></li>'
                  );
                });
              }

              var originalLinePrice = theme.Currency.formatMoney(
                cartItem.original_line_price,
                StyleHatch.currencyFormat
              );
              $('.cart-item-total', $item).append(
                '<p><span class="money original-price" data-cart-item-original-price>' +
                  originalLinePrice +
                  '</span></p>'
              );
            }

            if (cartItem.unit_price) {
              var unitPrice = theme.Currency.formatMoney(
                cartItem.unit_price,
                StyleHatch.currencyFormat
              );
              var unitPriceBaseUnit = slate.utils.getBaseUnit(cartItem);

              var unitPriceHtml =
                '<div data-unit-price-group>' +
                  '<dt><span class="visually-hidden visually-hidden--inline">' +
                    StyleHatch.Strings.unitPrice +
                  '</span></dt>' +
                  '<dd><span class="price-unit-price">' +
                    '<span data-unit-price="">' +
                      unitPrice +
                    '</span>' +
                    '<span aria-hidden="true">/</span>' +
                    '<span class="visually-hidden">' +
                      StyleHatch.Strings.unitPriceSeparator +
                    '&nbsp;</span>' +
                    '<span data-unit-price-base-unit="">' +
                      unitPriceBaseUnit +
                    '</span>' +
                  '</span></dd>' +
                '</div>';

              // $productPrice.append('&nbsp;<span class="unit-price">' + unitPrice + '/' + unitPriceBaseUnit + '</span>');
              $('.cart-item-price', $item).append(unitPriceHtml);
            }
            
          }

          var $cartItems = $('[data-cart-item]', $container);

          // Remove items from display
          $cartItems.each(function(i) {
            var key = $(this).attr('data-cart-item');
            if ($.inArray(key, cartItemKeys) === -1) {
              $(this).remove();
            }
          });

          var totalPrice = theme.Currency.formatMoney(
            cart.total_price,
            StyleHatch.currencyFormat
          );
          var $subTotal = $('[data-cart-subtotal]');
          $subTotal.removeClass('money');
          $subTotal.html('<span class="money">' + totalPrice + '</span>');

          // Add in cart level discounts (cart_level_discount_applications)
          if (cart.cart_level_discount_applications.length > 0) {
            // Check if HTML structure exists
            if ($('.cart-discount').length === 0) {
              $('.cart-checkout').prepend('<ul class="cart-discount"></ul>');
            }
            var $discount = $('.cart-discount');
            $discount.show();
            $discount.empty();

            $.each(cart.cart_level_discount_applications, function(
              index,
              discount
            ) {
              var amount = theme.Currency.formatMoney(
                discount.total_allocated_amount,
                StyleHatch.currencyFormat
              );
              $discount.append(
                '<li class="cart-discount--applications"><span class="cart-discount--title">' +
                  discount.title +
                  '</span><span class="cart-discount--amount">-<span class="money">' +
                  amount +
                  '</span></span></li>'
              );
            });
          } else {
            $('.cart-discount').hide();
          }
          $('.cart-discount--title').html(
            cart.cart_level_discount_applications.title
          );
        });
      }

      var $termsAndConditions = $('.terms-and-conditions', $container);
      if ($termsAndConditions.length > 0) {
        $('body').on(
          'click',
          '[name="checkout"], [name="goto_pp"], [name="goto_gc"]',
          function() {
            if ($('#terms-and-conditions__agree').is(':checked')) {
              $(this).submit();
            } else {
              // check if notice exists...
              if ($('.terms-and-conditions__notice').length <= 0) {
                $termsAndConditions.append(
                  '<div class="terms-and-conditions__notice"><p><em>' +
                    StyleHatch.Strings.agreeNotice +
                    '</em></p></div>'
                );
              }
              return false;
            }
          }
        );

        var $checkbox = $termsAndConditions.find('input');
        $checkbox.on('click', function() {
          $termsAndConditions.find('.terms-and-conditions__notice').remove();
        });
      }
    }

    Cart.prototype = $.extend({}, Cart.prototype, {
      onUnload: function() {},
    });

    return Cart;
  })();

  /**
   * Classes - complex functionality
   * ---------------------------------------------------------------------------
   * AjaxCart
   * Currency
   */

  /*
   * Add product to cart without page refresh
   */
  StyleHatch.AjaxCart = (function() {
    var selectors = {
      body: 'body',
      util: 'header.util',
      cartPreview: 'header.util .cart-preview',
      addToCartForm: '[data-AddToCartForm] > form',
      addToCartButton: '[data-AddToCartForm]',
      cartButton: '[data-CartButton]',
      cartCount: '#CartCount',
      cartCost: '#CartCost',
    };
    var config = {
      addURL: StyleHatch.routes.cart_add_url + '.js',
      cartURL: StyleHatch.routes.cart_url + '.js',
      clearURL: StyleHatch.routes.cart_clear_url + '.js',
    };
    var cache = {};
    function cacheSelectors() {
      cache = {
        $body: $(selectors.body),
        $util: $(selectors.util),
        $cartPreview: $(selectors.cartPreview),
        $addToCartForm: $(selectors.addToCartForm),
        $addToCartButton: $(selectors.addToCartButton),
        $cartButton: $(selectors.cartButton),
        $cartCount: $(selectors.cartCount),
        $cartCost: $(selectors.cartCost),
      };
    }

    function init() {
      cacheSelectors();
      if (StyleHatch.ajaxCartEnable) {
        bindEvents();
      }
    }

    function submitCart($form) {
      var $form = $form;
      var $cartError = $form.find('.cart-error');
      // Change button to added to cart and disabled
      var cartButtonText = $form.find('[data-AddToCartText]').html();
      var cartButtonAddedText = $form
        .find('[data-AddToCartText]')
        .attr('data-added');
      var cartButtonAddingText = $form
        .find('[data-AddToCartText]')
        .attr('data-adding');

      $form
        .find('[data-AddToCart]')
        .addClass('added')
        .prop('disabled', true);
      $form.find('[data-AddToCartText]').html(cartButtonAddingText);

      $cartError.hide();

      $.post(
        config.addURL,
        $form.serialize(),
        function(data) {
          // Last product added data
          var productData = data;

          // Get the data from the cart for totals
          $.get(
            config.cartURL,
            function(data) {
              var cartData = data;

              // Update cart button count & price
              updateCartButton(cartData);

              // Show the recent item added to the cart
              showCartPreview(productData, cartData);

              // Change cart button text back
              // Auto hide after 6000ms
              var resetCartButton;
              resetCartButton = setTimeout(function() {
                $form
                  .find('[data-AddToCart]')
                  .removeClass('added')
                  .prop('disabled', false);
                $form.find('[data-AddToCartText]').html(cartButtonText);
              }, 500);
            },
            'json'
          );
        },
        'text'
      ).fail(function(data) {
        if (typeof data != 'undefined' && typeof data.status != 'undefined') {
          var responseText = JSON.parse(data.responseText);
          $cartError.html(
            '<strong>' +
              responseText.message +
              ':</strong> <em>' +
              responseText.description +
              '<em>'
          );
          $cartError.slideDown();
        }
        // manually submit the form
        // $form.addClass('noAJAX');
        // $form.submit();
        // Change cart button text back
        // Auto hide after 6000ms
        var resetCartButton;
        resetCartButton = setTimeout(function() {
          $form
            .find('[data-AddToCart]')
            .removeClass('added')
            .prop('disabled', false);
          $form.find('[data-AddToCartText]').html(cartButtonText);
        }, 500);
      });
      return false;
    }
    function clearCart() {
      $.post(config.clearURL);
    }
    function updateCartButton(cartData) {
      var $cartButton = cache.$cartButton;
      var $cartCount = cache.$cartCount;
      var $cartCost = cache.$cartCost;

      var itemCount = cartData.item_count;
      var totalPrice = theme.Currency.formatMoney(
        cartData.total_price,
        StyleHatch.currencyFormat
      );

      $cartCount.text(itemCount);
      $cartCost.removeClass('money');
      $cartCost.html('<span class="money">' + totalPrice + '</span>');
    }
    function showCartPreview(productData, cartData) {
      var $util = cache.$util;
      var $cartPreview = cache.$cartPreview;

      clearTimeout(cache.hideCartPreview);
      cache.$cartPreview.hide();

      // Cart Data
      var itemCount = cartData.item_count;
      var totalPrice = theme.Currency.formatMoney(
        cartData.total_price,
        StyleHatch.currencyFormat
      );

      // Recent Added Product Data
      var productData = JSON.parse(productData);
      var productTitle = productData.product_title;
      var productVariant = productData.variant_options;
      var productImage = productData.image;
      var productURL = productData.url;
      var productPrice = theme.Currency.formatMoney(
        productData.price,
        StyleHatch.currencyFormat
      );
      var productQuantity = productData.quantity;
      var productTotal = theme.Currency.formatMoney(
        productData.line_price,
        StyleHatch.currencyFormat
      );

      if (productData.unit_price) {
        var unitPrice = theme.Currency.formatMoney(
          productData.unit_price,
          StyleHatch.currencyFormat
        );
        var unitPriceBaseUnit = slate.utils.getBaseUnit(productData);
      }

      // Set Product Details
      var $productImage = $cartPreview.find('.product-image').empty();
      $productImage.append(
        '<img src="' + productImage + '" alt="' + productTitle + '">'
      );
      $productImage.attr('href', productURL);

      var $productTitle = $cartPreview.find('.product-title');
      $productTitle.html(productTitle);
      $productTitle.attr('href', productURL);

      var $productVarient = $cartPreview.find('.product-variant').empty();
      $.each(productVariant, function() {
        var variantStr = this;
        if (variantStr.toLowerCase().indexOf('default title') < 0) {
          $productVarient.show();
          $productVarient.append('<li>' + variantStr + '</li>');
        } else {
          $productVarient.hide();
        }
      });

      var $productPrice = $cartPreview.find('.product-price');
      $productPrice.removeClass('money');
      $productPrice.html('<strong><span class="money">' + productPrice + '</span></strong>');
      if (unitPrice) {
        $productPrice.append('&nbsp;<span class="unit-price">' + unitPrice + '/' + unitPriceBaseUnit + '</span>');
      }

      // Set Cart Totals
      var $itemCount = $cartPreview.find('.item-count');
      $itemCount.text(itemCount);

      if (itemCount > 1) {
        $cartPreview.find('.count.plural').show();
        $cartPreview.find('.count.singular').hide();
      } else {
        $cartPreview.find('.count.plural').hide();
        $cartPreview.find('.count.singular').show();
      }

      if (cartData.cart_level_discount_applications.length > 0) {
        var $discount = $('.cart-preview--discounts');
        $discount.show();
        $discount.empty();

        $.each(cartData.cart_level_discount_applications, function(
          index,
          discount
        ) {
          var amount = theme.Currency.formatMoney(
            discount.total_allocated_amount,
            StyleHatch.currencyFormat
          );
          $discount.append(
            '<li class="cart-discount--applications"><span class="cart-discount--title">' +
              discount.title +
              '</span><span class="cart-discount--amount">-<span class="money">' +
              amount +
              '</span></span></li>'
          );
        });
      } else {
        $('.cart-preview--discounts').hide();
      }

      var $totalPrice = $cartPreview.find('.total-price');
      $totalPrice.html('<span class="money">' + totalPrice + '</span>');

      var utilHeight = $util.height();
      $cartPreview.css({
        top: utilHeight,
      });

      // Fade in the preview
      $cartPreview.fadeIn(300);

      // Auto hide after 6000ms
      cache.hideCartPreview = setTimeout(function() {
        $cartPreview.fadeOut(300);
      }, 6000);

      $cartPreview.find('a.continue-shopping').on('click', function(e) {
        $cartPreview.fadeOut(300);
        e.preventDefault();
      });
    }

    

    /*
     * Events
     */
    function bindEvents() {
      cache.$addToCartForm.each(function() {
        $(this).on('submit', function(e) {
          var $form = $(this);
          submitCart($form);
          e.preventDefault();
        });
      });
    }
    function unbindEvents() {
      cache.$addToCartForm.off('submit');
    }

    function unload() {
      unbindEvents();
      clearTimeout(cache.hideCartPreview);
      cache.$cartPreview.hide();
    }

    return {
      init: init,
      clearCart: clearCart,
      updateCartButton: updateCartButton,
      unload: unload,
    };
  })();

  /**
   * Slate & Theme Functionality
   * ------------------------------------------------------------------------------
   */
  window.theme = window.theme || {};
  window.slate = window.slate || {};

  /**
   * A11y Helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions that help make your theme more accessible
   * to users with visual impairments.
   *
   *
   * @namespace a11y
   */

  slate.a11y = {
    /**
     * For use when focus shifts to a container rather than a link
     * eg for In-page links, after scroll, focus shifts to content area so that
     * next `tab` is where user expects if focusing a link, just $link.focus();
     *
     * @param {JQuery} $element - The element to be acted upon
     */
    pageLinkFocus: function($element) {
      var focusClass = 'js-focus-hidden';

      $element
        .first()
        .attr('tabIndex', '-1')
        .focus()
        .addClass(focusClass)
        .one('blur', callback);

      function callback() {
        $element
          .first()
          .removeClass(focusClass)
          .removeAttr('tabindex');
      }
    },

    /**
     * If there's a hash in the url, focus the appropriate element
     */
    focusHash: function() {
      var hash = window.location.hash;

      // is there a hash in the url? is it an element on the page?
      if (hash && document.getElementById(hash.slice(1))) {
        this.pageLinkFocus($(hash));
      }
    },

    /**
     * When an in-page (url w/hash) link is clicked, focus the appropriate element
     */
    bindInPageLinks: function() {
      $('a[href*=#]').on(
        'click',
        function(evt) {
          this.pageLinkFocus($(evt.currentTarget.hash));
        }.bind(this)
      );
    },

    /**
     * Traps the focus in a particular container
     *
     * @param {object} options - Options to be used
     * @param {jQuery} options.$container - Container to trap focus within
     * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
     * @param {string} options.namespace - Namespace used for new focus event handler
     */
    trapFocus: function(options) {
      var eventsName = {
        focusin: options.namespace ? 'focusin.' + options.namespace : 'focusin',
        focusout: options.namespace
          ? 'focusout.' + options.namespace
          : 'focusout',
        keydown: options.namespace
          ? 'keydown.' + options.namespace
          : 'keydown.handleFocus',
      };

      /**
       * Get every possible visible focusable element
       */
      var $focusableElements = options.$container.find(
        $(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex^="-"])'
        ).filter(':visible')
      );
      var firstFocusable = $focusableElements[0];
      var lastFocusable = $focusableElements[$focusableElements.length - 1];

      if (!options.$elementToFocus) {
        options.$elementToFocus = options.$container;
      }

      function _manageFocus(evt) {
        if (evt.keyCode !== 9) return;

        /**
         * On the last focusable element and tab forward,
         * focus the first element.
         */
        if (evt.target === lastFocusable && !evt.shiftKey) {
          evt.preventDefault();
          firstFocusable.focus();
        }
        /**
         * On the first focusable element and tab backward,
         * focus the last element.
         */
        if (evt.target === firstFocusable && evt.shiftKey) {
          evt.preventDefault();
          lastFocusable.focus();
        }
      }

      options.$container.attr('tabindex', '-1');
      options.$elementToFocus.focus();

      $(document).off('focusin');

      $(document).on(eventsName.focusout, function() {
        $(document).off(eventsName.keydown);
      });

      $(document).on(eventsName.focusin, function(evt) {
        if (evt.target !== lastFocusable && evt.target !== firstFocusable)
          return;

        $(document).on(eventsName.keydown, function(evt) {
          _manageFocus(evt);
        });
      });
    },

    /**
     * Removes the trap of focus in a particular container
     *
     * @param {object} options - Options to be used
     * @param {jQuery} options.$container - Container to trap focus within
     * @param {string} options.namespace - Namespace used for new focus event handler
     */
    removeTrapFocus: function(options) {
      var eventName = options.namespace
        ? 'focusin.' + options.namespace
        : 'focusin';

      if (options.$container && options.$container.length) {
        options.$container.removeAttr('tabindex');
      }

      $(document).off(eventName);
    },

    /**
     * Add aria-describedby attribute to external and new window links
     *
     * @param {object} options - Options to be used
     * @param {object} options.messages - Custom messages to be used
     * @param {jQuery} options.$links - Specific links to be targeted
     */
    accessibleLinks: function(options) {
      var body = document.querySelector('body');

      var idSelectors = {
        newWindow: 'a11y-new-window-message',
        external: 'a11y-external-message',
        newWindowExternal: 'a11y-new-window-external-message',
      };

      if (options.$links === undefined || !options.$links.jquery) {
        options.$links = $('a[href]:not([aria-describedby])');
      }

      function generateHTML(customMessages) {
        if (typeof customMessages !== 'object') {
          customMessages = {};
        }

        var messages = $.extend(
          {
            newWindow: 'Opens in a new window.',
            external: 'Opens external website.',
            newWindowExternal: 'Opens external website in a new window.',
          },
          customMessages
        );

        var container = document.createElement('ul');
        var htmlMessages = '';

        for (var message in messages) {
          htmlMessages +=
            '<li id=' +
            idSelectors[message] +
            '>' +
            messages[message] +
            '</li>';
        }

        container.setAttribute('hidden', true);
        container.innerHTML = htmlMessages;

        body.appendChild(container);
      }

      function _externalSite($link) {
        var hostname = window.location.hostname;

        return $link[0].hostname !== hostname;
      }

      $.each(options.$links, function() {
        var $link = $(this);
        var target = $link.attr('target');
        var rel = $link.attr('rel');
        var isExternal = _externalSite($link);
        var isTargetBlank = target === '_blank';

        if (isExternal) {
          $link.attr('aria-describedby', idSelectors.external);
        }
        if (isTargetBlank) {
          if (rel === undefined || rel.indexOf('noopener') === -1) {
            $link.attr('rel', function(i, val) {
              var relValue = val === undefined ? '' : val + ' ';
              return relValue + 'noopener';
            });
          }
          $link.attr('aria-describedby', idSelectors.newWindow);
        }
        if (isExternal && isTargetBlank) {
          $link.attr('aria-describedby', idSelectors.newWindowExternal);
        }
      });

      generateHTML(options.messages);
    },
  };

  theme.StoreAvailability = (function() {
    var selectors = {
      storeAvailabilityModalOpen: '[data-store-availability-modal-open]',
      storeAvailabilityModalProductTitle:
        '[data-store-availability-modal-product-title]'
    };

    function StoreAvailability(container) {
      this.container = container;
      this.eventHandlers = {};
      this.eventHandlers.debounceResize = theme.Helpers.debounce(
        function() {
          this._handleResize();
        }.bind(this),
        500
      );

      window.addEventListener('resize', this.eventHandlers.debounceResize);
    }

    StoreAvailability.prototype = Object.assign({}, StoreAvailability.prototype, {
      updateContent: function(variantId, productTitle) {
        var variantSectionUrl =
          '/variants/' + variantId + '/?section_id=store-availability';
        this.container.innerHTML = '';

        var self = this;

        fetch(variantSectionUrl)
          .then(function(response) {
            return response.text();
          })
          .then(function(storeAvailabilityHTML) {
            if (storeAvailabilityHTML.trim() === '') {
              return;
            }
            self.container.innerHTML = storeAvailabilityHTML;
            self.container.innerHTML =
              self.container.firstElementChild.innerHTML;

            var storeAvailabilityModalOpen = self.container.querySelector(
              selectors.storeAvailabilityModalOpen
            );
            // Only create modal if open modal element exists
            if (!storeAvailabilityModalOpen) {
              return;
            }

            self.modal = self._initModal();
            self._updateProductTitle(productTitle);
            self._handleResize();
          });
      },

      _initModal: function() {
        return new window.Modals(
          'StoreAvailabilityModal',
          'store-availability-modal',
          {
            close: '.js-modal-close-store-availability-modal',
            closeModalOnClick: true,
            openClass: 'store-availabilities-modal--active',
            scrollIntoView: true
          }
        );
      },

      _updateProductTitle: function(productTitle) {
        var storeAvailabilityModalProductTitle = this.container.querySelector(
          selectors.storeAvailabilityModalProductTitle
        );
        storeAvailabilityModalProductTitle.textContent = productTitle;
      },

      _handleResize: function() {
        if (this.modal && !this.modal.modalIsOpen) {
          return;
        }

        this.modal.scrollIntoView();
      }
    });

    return StoreAvailability;
  })();

  window.Modals = (function() {
    function Modal(id, name, options) {
      var defaults = {
        close: '.js-modal-close',
        open: '.js-modal-open-' + name,
        openClass: 'modal--is-active',
        closeModalOnClick: false,
        scrollIntoView: false
      };

      this.modal = document.getElementById(id);

      if (!this.modal) return false;

      this.nodes = {
        parents: [document.querySelector('html'), document.body]
      };

      this.config = Object.assign(defaults, options);

      this.modalIsOpen = false;

      this.focusOnOpen = this.config.focusOnOpen
        ? document.getElementById(this.config.focusOnOpen)
        : this.modal;

      this.init();
    }

    Modal.prototype.init = function() {
      document
        .querySelector(this.config.open)
        .addEventListener('click', this.open.bind(this));

      this.modal
        .querySelector(this.config.close)
        .addEventListener('click', this.closeModal.bind(this));
    };

    Modal.prototype.open = function(evt) {
      var self = this;
      // Keep track if modal was opened from a click, or called by another function
      var externalCall = false;

      if (this.modalIsOpen) return;

      this.$container = $(this.modal).parent();
      this.$container.append('<div class="mobile-menu-overlay"></div>');
      this.$overlay = this.$container.find('.mobile-menu-overlay');
      this.$overlay.show().css({
        'opacity': 0.6,
        'z-index': 999
      });

      // Prevent following href if link is clicked
      if (evt) {
        evt.preventDefault();
      } else {
        externalCall = true;
      }

      // Without this, the modal opens, the click event bubbles up
      // which closes the modal.
      if (evt && evt.stopPropagation) {
        evt.stopPropagation();
      }

      if (this.modalIsOpen && !externalCall) {
        this.closeModal();
      }

      this.modal.classList.add(this.config.openClass);

      this.nodes.parents.forEach(function(node) {
        node.classList.add(self.config.openClass);
      });

      this.modalIsOpen = true;

      slate.a11y.trapFocus({
        $container: $(this.modal),
        $elementToFocus: this.focusOnOpen
      });

      if (this.config.scrollIntoView) {
        this.scrollIntoView();
      }

      this.bindEvents();
    };

    Modal.prototype.closeModal = function() {
      if (!this.modalIsOpen) return;

      document.activeElement.blur();

      this.modal.classList.remove(this.config.openClass);

      var self = this;

      this.nodes.parents.forEach(function(node) {
        node.classList.remove(self.config.openClass);
      });

      this.$overlay.remove();

      this.modalIsOpen = false;

      slate.a11y.removeTrapFocus({
        $container: $(this.modal)
      });

      this.unbindEvents();
    };

    Modal.prototype.bindEvents = function() {
      this.keyupHandler = this.keyupHandler.bind(this);
      this.clickHandler = this.clickHandler.bind(this);
      document.body.addEventListener('keyup', this.keyupHandler);
      document.body.addEventListener('click', this.clickHandler);
    };

    Modal.prototype.unbindEvents = function() {
      document.body.removeEventListener('keyup', this.keyupHandler);
      document.body.removeEventListener('click', this.clickHandler);
    };

    Modal.prototype.keyupHandler = function(event) {
      if (event.keyCode === 27) {
        this.closeModal();
      }
    };

    Modal.prototype.clickHandler = function(event) {
      if (this.config.closeModalOnClick && !this.modal.contains(event.target)) {
        this.closeModal();
      }
    };

    Modal.prototype.scrollIntoView = function() {
      this.focusOnOpen.scrollIntoView({
        behavior: 'smooth'
      });
    };

    return Modal;
  })();

  /**
   * Image Helper Functions
   * -----------------------------------------------------------------------------
   * A collection of functions that help with basic image operations.
   *
   */
  theme.Images = (function() {
    /**
     * Preloads an image in memory and uses the browsers cache to store it until needed.
     *
     * @param {Array} images - A list of image urls
     * @param {String} size - A shopify image size attribute
     */

    function preload(images, size) {
      if (typeof images === 'string') {
        images = [images];
      }

      for (var i = 0; i < images.length; i++) {
        var image = images[i];
        this.loadImage(this.getSizedImageUrl(image, size));
      }
    }

    /**
     * Loads and caches an image in the browsers cache.
     * @param {string} path - An image url
     */
    function loadImage(path) {
      new Image().src = path;
    }

    /**
     * Swaps the src of an image for another OR returns the imageURL to the callback function
     * @param image
     * @param element
     * @param callback
     */
    function switchImage(image, element, callback) {
      var size = this.imageSize(element.src);
      var imageUrl = this.getSizedImageUrl(image.src, size);

      if (callback) {
        callback(imageUrl, image, element); // eslint-disable-line callback-return
      } else {
        element.src = imageUrl;
      }
    }

    /**
     * +++ Useful
     * Find the Shopify image attribute size
     *
     * @param {string} src
     * @returns {null}
     */
    function imageSize(src) {
      var match = src.match(
        /.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/
      );

      if (match !== null) {
        return match[1];
      } else {
        return null;
      }
    }

    /**
     * +++ Useful
     * Adds a Shopify size attribute to a URL
     *
     * @param src
     * @param size
     * @returns {*}
     */
    function getSizedImageUrl(src, size) {
      if (size == null) {
        return src;
      }

      if (size === 'master') {
        return this.removeProtocol(src);
      }

      var match = src.match(
        /\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i
      );

      if (match != null) {
        var prefix = src.split(match[0]);
        var suffix = match[0];

        return this.removeProtocol(prefix[0] + '_' + size + suffix);
      }

      return null;
    }

    function removeProtocol(path) {
      return path.replace(/http(s)?:/, '');
    }

    return {
      preload: preload,
      loadImage: loadImage,
      switchImage: switchImage,
      imageSize: imageSize,
      getSizedImageUrl: getSizedImageUrl,
      removeProtocol: removeProtocol,
    };
  })();

  // YouTube API Callback
  window.onYouTubeIframeAPIReady = function() {
    theme.ProductVideo.loadVideos(theme.ProductVideo.hosts.youtube);
  };

  theme.ProductVideo = (function() {
    var videos = {};

    var hosts = {
      html5: 'html5',
      youtube: 'youtube',
    };

    var selectors = {
      productMediaWrapper: '[data-product-single-media-wrapper]',
    };

    var attributes = {
      enableVideoLooping: 'enable-video-looping',
      videoId: 'video-id',
    };

    function init(videoContainer, sectionId) {
      if (!videoContainer.length) {
        return;
      }

      var videoElement = videoContainer.find('iframe, video')[0];
      var mediaId = videoContainer.data('mediaId');

      if (!videoElement) {
        return;
      }

      videos[mediaId] = {
        mediaId: mediaId,
        sectionId: sectionId,
        host: hostFromVideoElement(videoElement),
        container: videoContainer,
        element: videoElement,
        ready: function() {
          createPlayer(this);
        },
      };

      var video = videos[mediaId];

      switch (video.host) {
        case hosts.html5:
          window.Shopify.loadFeatures([
            {
              name: 'video-ui',
              version: '1.0',
              onLoad: setupPlyrVideos,
            },
          ]);
          theme.LibraryLoader.load('plyrShopifyStyles');
          break;
        case hosts.youtube:
          // console.log('load youtube');
          theme.LibraryLoader.load('youtubeSdk');
          break;
      }
    }

    function setupPlyrVideos(errors) {
      if (errors) {
        fallbackToNativeVideo();
        return;
      }

      loadVideos(hosts.html5);
    }

    function createPlayer(video) {
      if (video.player) {
        return;
      }

      var productMediaWrapper = video.container.closest(
        selectors.productMediaWrapper
      );
      // console.log('createPlayer', productMediaWrapper);
      var enableLooping = productMediaWrapper.data(
        attributes.enableVideoLooping
      );

      switch (video.host) {
        case hosts.html5:
          // eslint-disable-next-line no-undef
          video.player = new Shopify.Plyr(video.element, {
            loop: {active: enableLooping},
          });
          break;
        case hosts.youtube:
          var videoId = productMediaWrapper.data(attributes.videoId);

          video.player = new YT.Player(video.element, {
            videoId: videoId,
            events: {
              onStateChange: function(event) {
                if (event.data === 0 && enableLooping) event.target.seekTo(0);
              },
            },
          });
          break;
      }

      productMediaWrapper.on('mediaHidden xrLaunch', function() {
        // console.log('media hidden - video player');
        if (!video.player) return;

        if (video.host === hosts.html5) {
          video.player.pause();
        }

        if (video.host === hosts.youtube && video.player.pauseVideo) {
          video.player.pauseVideo();
        }
      });

      productMediaWrapper.on('mediaVisible', function() {
        // console.log('media visible - video player');
        if (theme.Helpers.isTouch()) return;
        if (!video.player) return;

        if (video.host === hosts.html5) {
          video.player.play();
        }

        if (video.host === hosts.youtube && video.player.playVideo) {
          video.player.playVideo();
        }
      });
    }

    function hostFromVideoElement(video) {
      if (video.tagName === 'VIDEO') {
        return hosts.html5;
      }

      if (video.tagName === 'IFRAME') {
        if (
          /^(https?:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.?be)\/.+$/.test(
            video.src
          )
        ) {
          return hosts.youtube;
        }
      }
      return null;
    }

    function loadVideos(host) {
      for (var key in videos) {
        if (videos.hasOwnProperty(key)) {
          var video = videos[key];
          if (video.host === host) {
            video.ready();
          }
        }
      }
    }

    function fallbackToNativeVideo() {
      for (var key in videos) {
        if (videos.hasOwnProperty(key)) {
          var video = videos[key];

          if (video.nativeVideo) continue;

          if (video.host === hosts.html5) {
            video.element.setAttribute('controls', 'controls');
            video.nativeVideo = true;
          }
        }
      }
    }

    function removeSectionVideos(sectionId) {
      for (var key in videos) {
        if (videos.hasOwnProperty(key)) {
          var video = videos[key];

          if (video.sectionId === sectionId) {
            if (video.player) video.player.destroy();
            delete videos[key];
          }
        }
      }
    }

    return {
      init: init,
      hosts: hosts,
      loadVideos: loadVideos,
      removeSectionVideos: removeSectionVideos,
    };
  })();

  theme.ProductModel = (function() {
    var modelJsonSections = {};
    var models = {};
    var xrButtons = {};

    var selectors = {
      mediaGroup: '[data-product-single-media-group]',
      xrButton: '[data-shopify-xr]',
    };

    function init(modelViewerContainers, sectionId) {
      modelJsonSections[sectionId] = {
        loaded: false,
      };

      modelViewerContainers.each(function(index) {
        var $modelViewerContainer = $(this);
        var mediaId = $modelViewerContainer.data('media-id');
        var $modelViewerElement = $(
          $modelViewerContainer.find('model-viewer')[0]
        );
        var modelId = $modelViewerElement.data('model-id');

        if (index === 0) {
          var $xrButton = $modelViewerContainer
            .closest(selectors.mediaGroup)
            .find(selectors.xrButton);
          xrButtons[sectionId] = {
            $element: $xrButton,
            defaultId: modelId,
          };
        }

        models[mediaId] = {
          modelId: modelId,
          sectionId: sectionId,
          $container: $modelViewerContainer,
          $element: $modelViewerElement,
        };
      });

      window.Shopify.loadFeatures([
        {
          name: 'shopify-xr',
          version: '1.0',
          onLoad: setupShopifyXr,
        },
        {
          name: 'model-viewer-ui',
          version: '1.0',
          onLoad: setupModelViewerUi,
        },
      ]);
      theme.LibraryLoader.load('modelViewerUiStyles');
    }

    function setupShopifyXr(errors) {
      if (errors) return;

      if (!window.ShopifyXR) {
        document.addEventListener('shopify_xr_initialized', function() {
          setupShopifyXr();
        });
        return;
      }

      for (var sectionId in modelJsonSections) {
        if (modelJsonSections.hasOwnProperty(sectionId)) {
          var modelSection = modelJsonSections[sectionId];

          if (modelSection.loaded) continue;
          var $modelJson = $('#ModelJson-' + sectionId);

          window.ShopifyXR.addModels(JSON.parse($modelJson.html()));
          modelSection.loaded = true;
        }
      }
      window.ShopifyXR.setupXRElements();
    }

    function setupModelViewerUi(errors) {
      if (errors) return;

      for (var key in models) {
        if (models.hasOwnProperty(key)) {
          var model = models[key];
          if (!model.modelViewerUi) {
            model.modelViewerUi = new Shopify.ModelViewerUI(model.$element);
          }
          setupModelViewerListeners(model);
        }
      }
    }

    function setupModelViewerListeners(model) {
      var xrButton = xrButtons[model.sectionId];
      // console.log('set up model viewer listener');
      model.$container.on('mediaVisible', function() {
        // console.log('media visible - model');
        xrButton.$element.attr('data-shopify-model3d-id', model.modelId);
        if (theme.Helpers.isTouch()) return;
        model.modelViewerUi.play();
      });

      model.$container
        .on('mediaHidden', function() {
          // console.log('media hidden - model');
          xrButton.$element.attr('data-shopify-model3d-id', xrButton.defaultId);
          model.modelViewerUi.pause();
        })
        .on('xrLaunch', function() {
          // console.log('xrlaunch - model');
          model.modelViewerUi.pause();
        });
    }

    function removeSectionModels(sectionId) {
      for (var key in models) {
        if (models.hasOwnProperty(key)) {
          var model = models[key];
          if (model.sectionId === sectionId) {
            models[key].modelViewerUi.destroy();
            delete models[key];
          }
        }
      }
      delete modelJsonSections[sectionId];
    }

    return {
      init: init,
      removeSectionModels: removeSectionModels,
    };
  })();

  /**
   * Currency Helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions that help with currency formatting
   *
   * Current contents
   * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
   *
   * Alternatives
   * - Accounting.js - http://openexchangerates.github.io/accounting.js/
   *
   */

  theme.Currency = (function() {
    var moneyFormat = '${{amount}}'; // eslint-disable-line camelcase

    function formatMoney(cents, format) {
      if (typeof cents === 'string') {
        cents = cents.replace('.', '');
      }
      var value = '';
      var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
      var formatString = format || moneyFormat;

      function formatWithDelimiters(number, precision, thousands, decimal) {
        precision = slate.utils.defaultTo(precision, 2);
        thousands = slate.utils.defaultTo(thousands, ',');
        decimal = slate.utils.defaultTo(decimal, '.');

        if (isNaN(number) || number == null) {
          return 0;
        }

        number = (number / 100.0).toFixed(precision);

        var parts = number.split('.');
        var dollarsAmount = parts[0].replace(
          /(\d)(?=(\d\d\d)+(?!\d))/g,
          '$1' + thousands
        );
        var centsAmount = parts[1] ? decimal + parts[1] : '';

        return dollarsAmount + centsAmount;
      }

      switch (formatString.match(placeholderRegex)[1]) {
        case 'amount':
          value = formatWithDelimiters(cents, 2);
          break;
        case 'amount_no_decimals':
          value = formatWithDelimiters(cents, 0);
          break;
        case 'amount_with_comma_separator':
          value = formatWithDelimiters(cents, 2, '.', ',');
          break;
        case 'amount_no_decimals_with_comma_separator':
          value = formatWithDelimiters(cents, 0, '.', ',');
          break;
        case 'amount_no_decimals_with_space_separator':
          value = formatWithDelimiters(cents, 0, ' ');
          break;
      }

      return formatString.replace(placeholderRegex, value);
    }

    return {
      formatMoney: formatMoney,
    };
  })();

  theme.Disclosure = (function() {
    var selectors = {
      disclosureList: '[data-disclosure-list]',
      disclosureToggle: '[data-disclosure-toggle]',
      disclosureInput: '[data-disclosure-input]',
      disclosureOptions: '[data-disclosure-option]',
    };

    var classes = {
      listVisible: 'disclosure-list--visible',
    };

    function Disclosure($disclosure) {
      this.$container = $disclosure;
      this.cache = {};
      this._cacheSelectors();
      this._connectOptions();
      this._connectToggle();
      this._onFocusOut();
    }

    Disclosure.prototype = $.extend({}, Disclosure.prototype, {
      _cacheSelectors: function() {
        this.cache = {
          $disclosureList: this.$container.find(selectors.disclosureList),
          $disclosureToggle: this.$container.find(selectors.disclosureToggle),
          $disclosureInput: this.$container.find(selectors.disclosureInput),
          $disclosureOptions: this.$container.find(selectors.disclosureOptions),
        };
      },

      _connectToggle: function() {
        this.cache.$disclosureToggle.on(
          'click',
          function(evt) {
            var ariaExpanded =
              $(evt.currentTarget).attr('aria-expanded') === 'true';
            $(evt.currentTarget).attr('aria-expanded', !ariaExpanded);

            this.cache.$disclosureList.toggleClass(classes.listVisible);
          }.bind(this)
        );
      },

      _connectOptions: function() {
        this.cache.$disclosureOptions.on(
          'click',
          function(evt) {
            this._submitForm($(evt.currentTarget).data('value'));
            evt.preventDefault();
          }.bind(this)
        );
      },

      _onFocusOut: function() {
        this.cache.$disclosureToggle.on(
          'focusout',
          function(evt) {
            var disclosureLostFocus =
              this.$container.has(evt.relatedTarget).length === 0;

            if (disclosureLostFocus) {
              this._hideList();
            }
          }.bind(this)
        );

        this.cache.$disclosureList.on(
          'focusout',
          function(evt) {
            var childInFocus =
              $(evt.currentTarget).has(evt.relatedTarget).length > 0;
            var isVisible = this.cache.$disclosureList.hasClass(
              classes.listVisible
            );

            if (isVisible && !childInFocus) {
              this._hideList();
            }
          }.bind(this)
        );

        this.$container.on(
          'keyup',
          function(evt) {
            if (evt.which !== slate.utils.keyboardKeys.ESCAPE) return;
            this._hideList();
            this.cache.$disclosureToggle.focus();
          }.bind(this)
        );

        this.bodyOnClick = function(evt) {
          var isOption = this.$container.has(evt.target).length > 0;
          var isVisible = this.cache.$disclosureList.hasClass(
            classes.listVisible
          );

          if (isVisible && !isOption) {
            this._hideList();
          }
        }.bind(this);

        $('body').on('click', this.bodyOnClick);
      },

      _submitForm: function(value) {
        this.cache.$disclosureInput.val(value);
        this.$container.parents('form').submit();
      },

      _hideList: function() {
        this.cache.$disclosureList.removeClass(classes.listVisible);
        this.cache.$disclosureToggle.attr('aria-expanded', false);
      },

      unload: function() {
        $('body').off('click', this.bodyOnClick);
        this.cache.$disclosureOptions.off();
        this.cache.$disclosureToggle.off();
        this.cache.$disclosureList.off();
        this.$container.off();
      },
    });

    return Disclosure;
  })();

  /**
   * Utility helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions for dealing with arrays and objects
   *
   * @namespace utils
   */

  slate.utils = {
    /**
     * Return an object from an array of objects that matches the provided key and value
     *
     * @param {array} array - Array of objects
     * @param {string} key - Key to match the value against
     * @param {string} value - Value to get match of
     */
    findInstance: function(array, key, value) {
      for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
          return array[i];
        }
      }
    },

    /**
     * Remove an object from an array of objects by matching the provided key and value
     *
     * @param {array} array - Array of objects
     * @param {string} key - Key to match the value against
     * @param {string} value - Value to get match of
     */
    removeInstance: function(array, key, value) {
      var i = array.length;
      while (i--) {
        if (array[i][key] === value) {
          array.splice(i, 1);
          break;
        }
      }

      return array;
    },

    getBaseUnit: function(variant) {
      return variant.unit_price_measurement.reference_value === 1
        ? variant.unit_price_measurement.reference_unit
        : variant.unit_price_measurement.reference_value +
            variant.unit_price_measurement.reference_unit;
    },

    /**
     * _.compact from lodash
     * Remove empty/false items from array
     * Source: https://github.com/lodash/lodash/blob/master/compact.js
     *
     * @param {array} array
     */
    compact: function(array) {
      var index = -1;
      var length = array == null ? 0 : array.length;
      var resIndex = 0;
      var result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result[resIndex++] = value;
        }
      }
      return result;
    },

    /**
     * _.defaultTo from lodash
     * Checks `value` to determine whether a default value should be returned in
     * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
     * or `undefined`.
     * Source: https://github.com/lodash/lodash/blob/master/defaultTo.js
     *
     * @param {*} value - Value to check
     * @param {*} defaultValue - Default value
     * @returns {*} - Returns the resolved value
     */
    defaultTo: function(value, defaultValue) {
      return value == null || value !== value ? defaultValue : value;
    },

    /**
     * _.debounce from underscore
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing.
     *
     * @param {*} func - Function to call
     * @param {*} wait - ms delay (250)
     * @param {*} immediate - bool
     */

    debounce: function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this,
          args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },
  };

  /**
   * Variant Selection scripts
   * ------------------------------------------------------------------------------
   *
   * Handles change events from the variant inputs in any `cart/add` forms that may
   * exist. Also updates the master select and triggers updates when the variants
   * price or image changes.
   *
   * @namespace variants
   */

  slate.Variants = (function() {
    /**
     * Variant constructor
     *
     * @param {object} options - Settings from `product.js`
     */
    function Variants(options) {
      this.$container = options.$container;
      this.product = options.product;
      this.singleOptionSelector = options.singleOptionSelector;
      this.originalSelectorId = options.originalSelectorId;
      this.enableHistoryState = options.enableHistoryState;
      this.enableSwatch = options.enableSwatch;
      this.currentVariant = this._getVariantFromOptions();

      $(this.singleOptionSelector, this.$container).on(
        'change',
        this._onSelectChange.bind(this)
      );
    }

    Variants.prototype = $.extend({}, Variants.prototype, {
      /**
       * Get the currently selected options from add-to-cart form. Works with all
       * form input elements.
       *
       * @return {array} options - Values of currently selected variants
       */
      _getCurrentOptions: function() {
        var currentOptions = $.map(
          $(this.singleOptionSelector, this.$container),
          function(element) {
            var $element = $(element);
            var type = $element.attr('type');
            var currentOption = {};

            if (type === 'radio' || type === 'checkbox') {
              if ($element[0].checked) {
                currentOption.value = $element.val();
                currentOption.index = $element.data('index');

                return currentOption;
              } else {
                return false;
              }
            } else {
              currentOption.value = $element.val();
              currentOption.index = $element.data('index');

              return currentOption;
            }
          }
        );

        // remove any unchecked input values if using radio buttons or checkboxes
        currentOptions = slate.utils.compact(currentOptions);

        return currentOptions;
      },

      /**
       * Find variant based on selected values.
       *
       * @param  {array} selectedValues - Values of variant inputs
       * @return {object || undefined} found - Variant object from product.variants
       */
      _getVariantFromOptions: function() {
        var selectedValues = this._getCurrentOptions();
        var variants = this.product.variants;
        var found = false;

        variants.forEach(function(variant) {
          var satisfied = true;
          var options = variant.options;

          selectedValues.forEach(function(option) {
            if (satisfied) {
              satisfied = option.value === variant[option.index];
            }
          });

          if (satisfied) {
            found = variant;
          }
        });

        return found || null;
      },

      /**
       * Event handler for when a variant input changes.
       */
      _onSelectChange: function() {
        var variant = this._getVariantFromOptions();

        this.$container.trigger({
          type: 'variantChange',
          variant: variant,
        });

        if (!variant) {
          this._updateSwatches(variant);
          return;
        }

        this._updateMasterSelect(variant);
        this._updateImages(variant);
        this._updatePrice(variant);
        this._updateSKU(variant);
        this._updateSwatches(variant);
        this.currentVariant = variant;

        if (this.enableHistoryState) {
          this._updateHistoryState(variant);
        }
      },

      /**
       * Trigger event when variant image changes
       *
       * @param  {object} variant - Currently selected variant
       * @return {event}  variantImageChange
       */
      _updateImages: function(variant) {
        var variantImage = variant.featured_image || {};
        var currentVariantImage = this.currentVariant.featured_image || {};

        if (
          !variant.featured_image ||
          variantImage.src === currentVariantImage.src
        ) {
          return;
        }

        this.$container.trigger({
          type: 'variantImageChange',
          variant: variant,
        });
      },

      /**
       * Trigger event when variant price changes.
       *
       * @param  {object} variant - Currently selected variant
       * @return {event} variantPriceChange
       */
      _updatePrice: function(variant) {
        if (
          variant.price === this.currentVariant.price &&
          variant.compare_at_price === this.currentVariant.compare_at_price
        ) {
          return;
        }

        this.$container.trigger({
          type: 'variantPriceChange',
          variant: variant,
        });
      },

      /**
       * Trigger event when variant sku changes.
       *
       * @param  {object} variant - Currently selected variant
       * @return {event} variantSKUChange
       */
      _updateSKU: function(variant) {
        if (variant.sku === this.currentVariant.sku) {
          return;
        }

        this.$container.trigger({
          type: 'variantSKUChange',
          variant: variant,
        });
      },

      _updateSwatches: function(variant) {
        this.$container.trigger({
          type: 'variantSwatchChange',
          variant: variant,
        });
      },

      /**
       * Update history state for product deeplinking
       *
       * @param  {variant} variant - Currently selected variant
       * @return {k}         [description]
       */
      _updateHistoryState: function(variant) {
        if (!history.replaceState || !variant) {
          return;
        }

        var newurl =
          window.location.protocol +
          '//' +
          window.location.host +
          window.location.pathname +
          '?variant=' +
          variant.id;
        window.history.replaceState({path: newurl}, '', newurl);
      },

      /**
       * Update hidden master select of variant change
       *
       * @param  {variant} variant - Currently selected variant
       */
      _updateMasterSelect: function(variant) {
        $(this.originalSelectorId, this.$container)[0].value = variant.id;
      },
    });

    return Variants;
  })();

  /**
   * Global functionality
   * ---------------------------------------------------------------------------
   */
  theme.Helpers = (function() {
    var touchDevice = false;

    function setTouch() {
      touchDevice = true;
    }

    function isTouch() {
      return touchDevice;
    }

    function debounce(func, wait, immediate) {
      var timeout;

      return function() {
        var context = this,
          args = arguments;

        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }

    return {
      setTouch: setTouch,
      isTouch: isTouch,
      debounce: debounce
    };
  })();

  theme.LibraryLoader = (function() {
    var types = {
      link: 'link',
      script: 'script',
    };

    var status = {
      requested: 'requested',
      loaded: 'loaded',
    };

    var cloudCdn = 'https://cdn.shopify.com/shopifycloud/';

    var libraries = {
      youtubeSdk: {
        tagId: 'youtube-sdk',
        src: 'https://www.youtube.com/iframe_api',
        type: types.script,
      },
      plyrShopifyStyles: {
        tagId: 'plyr-shopify-styles',
        src: cloudCdn + 'shopify-plyr/v1.0/shopify-plyr.css',
        type: types.link,
      },
      modelViewerUiStyles: {
        tagId: 'shopify-model-viewer-ui-styles',
        src: cloudCdn + 'model-viewer-ui/assets/v1.0/model-viewer-ui.css',
        type: types.link,
      },
    };

    function load(libraryName, callback) {
      var library = libraries[libraryName];

      if (!library) return;
      if (library.status === status.requested) return;

      callback = callback || function() {};
      if (library.status === status.loaded) {
        callback();
        return;
      }

      library.status = status.requested;

      var tag;

      switch (library.type) {
        case types.script:
          tag = createScriptTag(library, callback);
          break;
        case types.link:
          tag = createLinkTag(library, callback);
          break;
      }

      tag.id = library.tagId;
      library.element = tag;

      var firstScriptTag = document.getElementsByTagName(library.type)[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    function createScriptTag(library, callback) {
      var tag = document.createElement('script');
      tag.src = library.src;
      tag.addEventListener('load', function() {
        library.status = status.loaded;
        callback();
      });
      return tag;
    }

    function createLinkTag(library, callback) {
      var tag = document.createElement('link');
      tag.href = library.src;
      tag.rel = 'stylesheet';
      tag.type = 'text/css';
      tag.addEventListener('load', function() {
        library.status = status.loaded;
        callback();
      });
      return tag;
    }

    return {
      load: load,
    };
  })();

  function isMobile() {
    return $(window).width() < 750 || window.mobileCheck();
  }

  /*
   * Basic plugins to handle responsive product images
   */
  $.fn.extend({
    // product grid item click events
    productBox: function() {
      var $productBox = $(this).find('.box.product figure');
      $productBox.on('click', function(e) {
        // go to product URL unless clicking on vendor link
        if (
          $(e.target).is('.vendor') ||
          $(e.target)
            .parent()
            .is('.vendor')
        ) {
          // console.log('is vendor');
        } else if (
          $(e.target).is('.product-swatches__li') ||
          $(e.target).closest('.product-swatches__li').length != 0
        ) {
          var $swatchList = $(e.target).closest('.product-swatches');
          var $swatchListItem = $(e.target).closest('.product-swatches__li');
          var $swatchLink = $swatchListItem.find('a');
          var variantImage = $swatchLink.data('variant-image');
          var variantImagePattern = $swatchLink.data('variant-image-pattern');
          var variantUrl = $swatchLink.data('variant-url');

          var $productCard = $swatchListItem
            .closest('.box.product')
            .find('a.product_card');
          var $productImage = $productCard.find(
            '.product_card__image:not(.alt)'
          );

          if (variantUrl !== '') {
            $productCard.attr('href', variantUrl);
          }

          if (variantImage !== '') {
            $productImage
              .attr('src', variantImage)
              .attr('data-fallback', variantImage)
              .attr('srcset', '')
              .attr('data-srcset', '')
              .attr('data-src', variantImagePattern);
          }

          $('.product-swatches__link--selected', $swatchList).removeClass(
            'product-swatches__link--selected'
          );
          $swatchLink.addClass('product-swatches__link--selected');

          e.preventDefault();
        } else {
          e.preventDefault();
          var productURL = $(this)
            .find('a')
            .attr('href');
          // Open link in new window for tabs
          if (e.shiftKey || e.ctrlKey || e.metaKey) {
            window.open(productURL, '_blank');
          } else {
            window.location = productURL;
          }
        }
      });
      // IE fix for object-fit
      if ('objectFit' in document.documentElement.style === false) {
        $productBox.find('.product_card__image-wrapper').each(function () {
          var $container = $(this),
            $altImg = $container.find('.product_card__image.alt'),
            imgUrl = $container.find('img').prop('src');
          $altImg.hide();
          $container.addClass('ie-fallback lazyload');
        });
      }
      var $productSwatch = $(this).find(
        '.box.product a.product-swatches__link'
      );

      // Preload product images associated with swatch on hover for faster switching
      $productSwatch.on('mouseenter', function(e) {
        StyleHatch.productSwatchPreload = StyleHatch.productSwatchPreload || [];
        var $link = $(e.target).closest('a.product-swatches__link');
        var preloadImage = $link.data('variant-image');

        if (preloadImage !== '') {
          if (StyleHatch.productSwatchPreload.indexOf(preloadImage) < 0) {
            StyleHatch.productSwatchPreload.push(preloadImage);
            var image = new Image();
            image.src = preloadImage;
          }
        }
      });
    },
    // remove product box
    destroyProductBox: function() {
      var $productBox = $(this).find('.box.product figure');
      $productBox.off('click');
    },

    // Nested menu
    initNestedMenu: function() {
      var $nestedNav = $(this);
      var $nestedLink = $nestedNav.find('a[aria-haspopup="true"]');

      var _closeCurrentChild = function($menu) {
        var $expandedItem = $menu.find('li.has-dropdown.expanded');
        if ($expandedItem.length > 0) {
          $expandedItem.removeClass('expanded');

          var $expandedItemLink = $expandedItem.find('> a');
          $expandedItemLink.attr('aria-expanded', 'false');

          var $dropdown = $expandedItem.find('> ul.dropdown');
          $dropdown.attr('aria-hidden', 'true');
          $dropdown.slideUp();

          var $dropdownLinks = $dropdown.find('a');
          $dropdownLinks.attr('tabindex', '-1');
          _closeCurrentGrandchild($menu);
        }
      };
      var _closeCurrentGrandchild = function($menu) {
        var $expandedItem = $menu.find('li.has-sub-dropdown.expanded');
        if ($expandedItem.length > 0) {
          $expandedItem.removeClass('expanded');

          var $expandedItemLink = $expandedItem.find('> a');
          $expandedItemLink.attr('aria-expanded', 'false');

          var $dropdown = $expandedItem.find('> ul.sub-dropdown');
          $dropdown.attr('aria-hidden', 'true');
          $dropdown.slideUp();

          var $dropdownLinks = $dropdown.find('a');
          $dropdownLinks.attr('tabindex', '-1');
          _closeCurrentGrandchild($menu);
        }
      };

      $nestedLink.on('click', function(e) {
        var $el = $(this);
        var $parentItem = $el.parent();
        var $dropdown = $parentItem.find('> ul');
        var $dropdownLinks = $parentItem.find('> ul > li > a');
        var $menu = $el.closest('ul.nested-menu');

        if ($el.attr('aria-expanded') !== 'true') {
          e.preventDefault();

          if ($parentItem.hasClass('has-dropdown')) {
            // child level
            _closeCurrentChild($menu);
          } else {
            // grandchild level
            _closeCurrentGrandchild($menu);
          }

          // Element changes
          $el.attr('aria-expanded', 'true');

          // Parent changes
          $parentItem.addClass('expanded');

          // Dropdown changes
          $dropdown.attr('aria-hidden', 'false');
          $dropdownLinks.attr('tabindex', '0');
          $dropdown.slideDown();
        }
      });
    },
    destroyNestedMenu: function() {
      var $nestedNav = $(this);
      var $nestedLink = $nestedNav.find('a[aria-haspopup="true"]');
      $nestedLink.off('click');
    },
  });
  /*
   * Refresh all fixTo elements
   * - called when elements slide in/out
   */
  StyleHatch.refreshFixTo = function() {
    StyleHatch.Promos.refreshFixTo();
    var $fixToElements = $('*').filter(function() {
      return $(this).data('fixtoInstance');
    });
    // Only refresh the ones _running
    $fixToElements.each(function(i) {
      if ($(this).data('fixto-instance')._running) {
        $(this).fixTo('refresh');
      }
    });
  };
  // Apply fitvids
  StyleHatch.videoLayout = function() {
    $('.rte').fitVids();
    var $table = $('.rte').find('table');
    $table.wrap('<div class="table-wrapper"></div>');
  };
  // Customer account logins
  StyleHatch.loginForms = function() {
    function showRecoverPasswordForm() {
      StyleHatch.cache.$recoverPasswordForm.show();
      StyleHatch.cache.$customerLoginForm.hide();
    }

    function hideRecoverPasswordForm() {
      StyleHatch.cache.$recoverPasswordForm.hide();
      StyleHatch.cache.$customerLoginForm.show();
    }

    StyleHatch.cache.$recoverPasswordLink.on('click', function(evt) {
      evt.preventDefault();
      showRecoverPasswordForm();
      StyleHatch.updateHash('recover');
    });

    StyleHatch.cache.$hideRecoverPasswordLink.on('click', function(evt) {
      evt.preventDefault();
      hideRecoverPasswordForm();
      StyleHatch.updateHash();
    });

    // Allow deep linking to recover password form
    if (StyleHatch.getHash() == '#recover') {
      showRecoverPasswordForm();
    }
  };

  // Template specific initalization
  StyleHatch.initTemplates = function() {
    var $body = StyleHatch.cache.$body;

    // Grab the template name from the body
    var template = $body.data('template');

    // Execute specific functionality
    switch (template) {
      case 'addresses':
        StyleHatch.initCustomerAddressTemplate();
        break;

      default:
      //console.log('Template: Default');
    }
  };
  // Customer Address Page
  StyleHatch.initCustomerAddressTemplate = function() {
    if (StyleHatch.addressJSValidation) {
      var $submit = $('.customer-address input[type="submit"]');

      $submit.on('click', function(e) {
        var $form = $(this).closest('form');

        // Required fields
        var $lastName = $form.find('input[name="address[last_name]"]');
        var $address1 = $form.find('input[name="address[address1]"]');
        var $city = $form.find('input[name="address[city]"]');
        var $country = $form.find('select[name="address[country]"]');
        var $province = $form.find('select[name="address[province]"]');
        var $zip = $form.find('input[name="address[zip]"]');

        if (!$lastName.val()) {
          $lastName.addClass('required');
        }
        if (!$address1.val()) {
          $address1.addClass('required');
        }
        if (!$city.val()) {
          $city.addClass('required');
        }
        if ($country.val() == '---') {
          $country.addClass('required');
        }

        // Check to see if province is showing
        if ($province.closest('.input-row').is(':visible')) {
          if (
            !$province.val() ||
            $province.val() == '---' ||
            $province.val() == ''
          ) {
            $province.addClass('required');
          }
        }

        if (!$zip.val()) {
          $zip.addClass('required');
        }

        // Check for focus to clear required
        var $required = $form.find('input.required, select.required');
        $required.on('focus', function() {
          $(this).removeClass('required');
        });

        // If any required inputs are still here prevent submission
        if ($required.length > 0) {
          $form
            .find('div.errors')
            .parent()
            .show();
          e.preventDefault();
        } else {
          $form
            .find('div.errors')
            .parent()
            .hide();
        }
      });
    }
  };
  // Utilities
  StyleHatch.updateHash = function(hash) {
    if (hash) {
      window.location.hash = '#' + hash;
      $('#' + hash)
        .attr('tabindex', -1)
        .focus();
    } else {
      window.location.hash = '';
    }
  };
  StyleHatch.getHash = function() {
    return window.location.hash;
  };
  // Still used by cart page
  StyleHatch.quantitySelect = function() {
    // Quantity Selector
    var $quantitySelect = $(
      '.quantity-select:not([data-quantity-select-enabled])'
    );
    $quantitySelect.each(function(i) {
      var $el = $(this);
      var $quantityDown = $el.find('.adjust-minus');
      var $quantityUp = $el.find('.adjust-plus');
      var $quantity = $el.find('input.quantity');

      var quantity = $quantity.val();

      $quantity.on('click', function(e) {
        e.preventDefault();
      });

      $quantityDown.on('click', function(e) {
        quantity = $quantity.val();
        if (quantity > 0) {
          quantity--;
          $quantity.val(quantity);
        }
        e.preventDefault();
      });

      $quantityUp.on('click', function(e) {
        quantity = $quantity.val();
        quantity++;
        $quantity.val(quantity);

        e.preventDefault();
      });

      $el.attr('data-quantity-select-enabled', 'true');
    });
  };
  // Reset passwords (store accounts)
  StyleHatch.resetPasswordSuccess = function() {
    StyleHatch.cache.$passwordResetSuccess.show();
  };

  /**
   * Primary Initialization
   * ---------------------------------------------------------------------------
   */
  $(document).ready(function() {
    StyleHatch.init();
  });
})(jq223);

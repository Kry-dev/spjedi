$(document).ready(function(){

	$('.header-scroll').on('click', function(e) {
		var id = $(this).attr('href');

		if (id[0] == '#') {
			e.preventDefault();
			// close responsive menu if open
			var $navbarCollapse = $('#navbarCollapse');
			var navbarOpen = $navbarCollapse.hasClass('in') || $navbarCollapse.hasClass('collapsing');
			if (navbarOpen) {
				$navbarCollapse.collapse('hide');
			}

			// scroll to element
			$('html, body').animate({
				scrollTop: $(id).offset().top - 50
			}, 1000);
		}
	});

	$('.clients-slider').slick({
		infinite: true,
		dots: false,
		autoplaySpeed: 4000,
		autoplay: true,
		arrows: false,
		slidesToShow: 5,
		slidesToScroll: 1,
		responsive: [
			{
				breakpoint: 1024,
				settings: {
				slidesToShow: 4,
				slidesToScroll: 1,
				infinite: true,
				dots: false
				}
			},
			{
				breakpoint: 850,
				settings: {
				slidesToShow: 3,
				slidesToScroll: 1
				}
			},
			{
				breakpoint: 768,
				settings: {
				slidesToShow: 3,
				slidesToScroll: 1
				}
			},
			{
				breakpoint: 640,
				settings: {
				slidesToShow: 2,
				centerMode: true,
				slidesToScroll: 1
				}
			},
			{
				breakpoint: 535,
				settings: {
				slidesToShow: 1,
				centerMode: true,
				slidesToScroll: 1
				}
			}
		]
	});

	$('.testimonials').slick({
		infinite: true,
		dots: false,
		autoplay: true,
		arrows: false,
		verticalSwiping: true,
		vertical: true,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplaySpeed: 8500,
	});


	window.sr = new scrollReveal();
	// resize header on scroll
	$(window).on('scroll', headerResizeHandler);

	function headerResizeHandler() {
		var distanceY = window.pageYOffset || document.documentElement.scrollTop,
			shrinkOn = 0,
			$header = $('.navbar');

		if (distanceY > shrinkOn) {
			$header.addClass("smaller");
		} else {
			$header.removeClass("smaller");
		}
	}
	headerResizeHandler();

	// Fancy box
	$("a#single_image").fancybox();
	
	$("a.group").fancybox({
		'transitionIn'	:	'elastic',
		'transitionOut'	:	'elastic',
		'speedIn'		:	600, 
		'speedOut'		:	200, 
		'overlayShow'	:	false

	});

	$("a#single_image_2")
    .attr('rel', 'gallery')
    .fancybox({
        padding    : 0,
        margin     : 15,
        nextEffect : 'fade',
        prevEffect : 'none',
        autoCenter : false,
        afterLoad  : function () {
            $.extend(this, {
                aspectRatio : false,
        		scrollOutside : false,
        		autoResize : true,
        		fitToView : false,
        		scrollbars : 'auto',
                type    : 'html',
                maxWidth   : '80%',
                content : '<div class="fancybox-image" style="background-image:url(' + this.href + '); background-size: cover; background-position:50% 50%;background-repeat:no-repeat;height:100%;width:100%;" /></div>'
            });
        }
    });


	

	$("#contactForm").submit(function(e) {
		e.preventDefault();

		var $that = $(this);

		var $name = $that.find('[name=name]'),
			$email = $that.find('[name=email]'),
			$subject = $that.find('[name=subject]'),
			$message = $that.find('[name=message]');

		var $button = $that.find('#msg button');

		$button.addClass('loading').prop('disabled', true);


		$.ajax({
			type: "POST",
			url: "https://mandrillapp.com/api/1.0/messages/send.json",
			data: {
			    'key': 'qUnNKSqipOc7_rXIySQLFw',
				'message': {
					'from_email': $email.val(),
					'from_name': $name.val(),
					'headers': {
						'Reply-To': $email.val()
					},
					'subject': $subject.val(),
					'text': $message.val(),
					'to': [
						{
							'email': 'info@spjedi.com',
							'name': 'Jed Elliott',
							'type': 'to'
						}
					]
				}
			}
		})
		.done(function(response) {
			$button.removeClass('loading').prop('disabled', false);
			$name.val('');
			$email.val('');
			$subject.val('');
			$message.val('');

			$('.status-message').addClass('hidden');
			$('.status-message.text-success').removeClass('hidden');
		})
		.fail(function(response) {
			$('.status-message').addClass('hidden');
			$('.status-message.text-danger').removeClass('hidden');
		});
	});

	$('#myCarousel2').carousel({
        interval: 3000
    });
});

// payments
$(function() {
	var $paymentButton = $('.paymentButton');
	if (!$paymentButton.length) return;

	var handler = StripeCheckout.configure({
		key: paymentSettings.STRIPE_PUBLIC_KEY,
		image: paymentSettings.DEFAULT_IMAGE_URL,
		locale: 'auto'
	});

	$paymentButton.on('click', function(e) {
		var $button = $(this);
		var data = $button.data();

		data.token = function(token) {
			// Use the token to create the charge with a server-side script.
			// You can access the token ID with `token.id`
			tokenHandler(token, data, $button);
		};

		// Open Checkout with further options
		handler.open(data);
		e.preventDefault();
	});

	// Close Checkout on page navigation
	$(window).on('popstate', function() {
		handler.close();
	});

	function tokenHandler(token, data, $button) {
		waitingPayment($button);

		$.ajax({
			type: 'POST',
			url: paymentSettings.HEROKU_SERVER_URL,
			data: {				
				sku: data.sku,
				email: token.email,
				token: token.id
			},
			dataType: 'json'
		})
		.done(function(response) {
			if (response.code && response.code === 'ok') successfulPayment($button);
			else failedPayment($button);
		})
		.error(function(response) {
			failedPayment($button);
		});
	}

	var buttonClasses = 'btn-primary btn-success btn-danger btn-info';

	function waitingPayment($button) {
		$button
			.prop('disabled', true)
			.removeClass(buttonClasses)
			.addClass('btn-info')
			.text('Processing payment');
	}

	function successfulPayment($button) {
		$button
			.prop('disabled', false)
			.removeClass(buttonClasses)
			.addClass('btn-success')
			.text('Payment successful');
	}

	function failedPayment($button) {
		$button
			.prop('disabled', false)
			.removeClass(buttonClasses)
			.addClass('btn-danger')
			.text('Payment failed');
	}
});


// Trainings

if ($('.training-page').length) {
	
	$.getJSON('/training_data.json', function (json) {	
		var i, thisWeek = null, nextWeek = null, previous = [];
		var week = getWeekBounds();

		for (i in json) {
			var training = json[i];
			var date = training.date.split('.');
			var time = training.time.split(':');
			training.datetime = new Date(parseInt(date[2]), parseInt(date[0]) - 1, parseInt(date[1]), parseInt(time[0]), parseInt(time[1]));

			if (training.datetime >= week.this.start && training.datetime <= week.this.end) {
				thisWeek = training;
				thisWeek.heading = 'This Week Training';
			}

			if (training.datetime >= week.next.start && training.datetime <= week.next.end) {
				nextWeek = training;
				nextWeek.heading = 'Next Week Training';
			}

			if (training.datetime < week.this.start) {
				previous.push(training);
			}
		}

		var weekTemplate = $.templates("#week-training-template");
		var previousEventsTemplate = $.templates("#previous-events-template");

		$("#week-container").append(!thisWeek || weekTemplate.render(thisWeek), !nextWeek || weekTemplate.render(nextWeek));
		$("#previous-events-container").append(previousEventsTemplate.render(previous));
	});
}

function getWeekBounds() {
	var curr = new Date();
	var currDay = curr.getDay();
	var dayOfWeek = currDay == 0 ? 6 : currDay - 1;
	var first = curr.getDate() - dayOfWeek;

	return {
		this: {
			start: setDate(curr, first, 'start'),
			end: setDate(curr, first + 6, 'end')
		},
		next: {
			start: setDate(curr, first + 7, 'start'),
			end: setDate(curr, first + 13, 'end')
		}
	};
}

function setDate(curr, date, type) {
	curr = new Date(curr);
	var d = new Date(curr.setDate(date));
	if (type == 'start') d.setHours(0, 0, 0);
	if (type == 'end') d.setHours(23, 59, 59);
	return d;
}
$(function () {
    "use strict";

    //Activate tooltips
    $("[data-toggle='tooltip']").tooltip();

    $("[data-toggle='utility-menu']").click(function () {
        $(this).next().slideToggle(300);
        $(this).toggleClass('open');
        return false;
    });

    // Login Page Flipbox control
    $('#toFlip').click(function () {
        loginFlip();
        return false;
    });

    $('#noFlip').click(function () {
        loginFlip();
        return false;
    });

    // Navbar height : Using slimscroll for sidebar
    if ($('body').hasClass('fixed') || $('body').hasClass('only-sidebar')) {
        $('.sidebar').slimScroll({
            height: ($(window).height() - $(".main-header").height()) + "px",
            color: "rgba(0,0,0,0.8)",
            size: "3px"
        });
    }
    else {
        var docHeight = $(document).height();
        $('.main-sidebar').height(docHeight);
    }
});

// Sidenav prototypes
$.pushMenu = {
    activate: function (toggleBtn) {

        //Enable sidebar toggle
        $(toggleBtn).on('click', function (e) {
            e.preventDefault();

            //Enable sidebar push menu
            if ($(window).width() > (767)) {
                if ($("body").hasClass('sidebar-collapse')) {
                    $("body").removeClass('sidebar-collapse').trigger('expanded.pushMenu');
                } else {
                    $("body").addClass('sidebar-collapse').trigger('collapsed.pushMenu');
                }
            }
                //Handle sidebar push menu for small screens
            else {
                if ($("body").hasClass('sidebar-open')) {
                    $("body").removeClass('sidebar-open').removeClass('sidebar-collapse').trigger('collapsed.pushMenu');
                } else {
                    $("body").addClass('sidebar-open').trigger('expanded.pushMenu');
                }
            }
            if ($('body').hasClass('fixed') && $('body').hasClass('sidebar-mini') && $('body').hasClass('sidebar-collapse')) {
                $('.sidebar').css("overflow", "visible");
                $('.main-sidebar').find(".slimScrollDiv").css("overflow", "visible");
            }
            if ($('body').hasClass('only-sidebar')) {
                $('.sidebar').css("overflow", "visible");
                $('.main-sidebar').find(".slimScrollDiv").css("overflow", "visible");
            };
        });

        $(".content-wrapper").click(function () {
            //Enable hide menu when clicking on the content-wrapper on small screens
            if ($(window).width() <= (767) && $("body").hasClass("sidebar-open")) {
                $("body").removeClass('sidebar-open');
            }
        });
    }
};
$.tree = function (menu) {
    var _this = this;
    var animationSpeed = 200;
    $(document).on('click', menu + ' li a', function (e) {
        //Get the clicked link and the next element
        var $this = $(this);
        var checkElement = $this.next();

        //Check if the next element is a menu and is visible
        if ((checkElement.is('.treeview-menu')) && (checkElement.is(':visible'))) {
            //Close the menu
            checkElement.slideUp(animationSpeed, function () {
                checkElement.removeClass('menu-open');
                //Fix the layout in case the sidebar stretches over the height of the window
                //_this.layout.fix();
            });
            checkElement.parent("li").removeClass("active");
        }
            //If the menu is not visible
        else if ((checkElement.is('.treeview-menu')) && (!checkElement.is(':visible'))) {
            //Get the parent menu
            var parent = $this.parents('ul').first();
            //Close all open menus within the parent
            var ul = parent.find('ul:visible').slideUp(animationSpeed);
            //Remove the menu-open class from the parent
            ul.removeClass('menu-open');
            //Get the parent li
            var parent_li = $this.parent("li");

            //Open the target menu and add the menu-open class
            checkElement.slideDown(animationSpeed, function () {
                //Add the class active to the parent li
                checkElement.addClass('menu-open');
                parent.find('li.active').removeClass('active');
                parent_li.addClass('active');
            });
        }
        //if this isn't a link, prevent the page from being redirected
        if (checkElement.is('.treeview-menu')) {
            e.preventDefault();
        }
    });
};
// Activate sidenav treemenu 
$.tree('.sidebar');
$.pushMenu.activate("[data-toggle='offcanvas']");

function loginFlip() {
    $('.login-box').toggleClass('flipped');
}

// Button Loading Plugin

$.fn.loadingBtn = function (options) {

    var settings = $.extend({
        text: "Loading"
    }, options);
    this.html('<span class="btn-spinner"></span> ' + settings.text + '');
    this.addClass("disabled");
};

$.fn.loadingBtnComplete = function (options) {
    var settings = $.extend({
        html: "submit"
    }, options);
    this.html(settings.html);
    this.removeClass("disabled");
};


jQuery(document).ready(function($){
	$('.overlay').bind('click touchend', closeNav);
	$('.closebtn').bind('click touchend', closeNav);
	// $('#hiddenshowcase').bind('click touchend', onShowcaseClicked);
	$('.showcase').bind('click touchend', openNav);

	var slides = $('.swiper-container-banner .swiper-slide');
	console.log(slides);
	for(var i = 0; i < slides.length; i++){
		slides[i].childNodes[0].src = config.bannerImages[i];
	}
	bannerSwiper = new Swiper ('.swiper-container-banner', {
    	autoplay: 5000,
    	slidesPerView: 'auto',
    	loop: true
  	});

	var cartWrapper = $('.cd-cart-container');
	var productId = 0;
	if( cartWrapper.length > 0 ) {
		//store jQuery objects
		var cartBody = cartWrapper.find('.body')
		var cartList = cartBody.find('ul').eq(0);
		var cartTotal = cartWrapper.find('.checkout').find('span');
		var cartTrigger = cartWrapper.children('.cd-cart-trigger');
		var cartCount = cartTrigger.children('.count')
		var addToCartBtn = $('.cd-add-to-cart');
		var undo = cartWrapper.find('.undo');
		var undoTimeoutId;

		//add product to cart
		addToCartBtn.on('click', function(event){
			event.preventDefault();
			addToCart($(this));
		});

		//open/close cart
		cartTrigger.on('click', function(event){
			event.preventDefault();
			toggleCart();
		});

		//close cart when clicking on the .cd-cart-container::before (bg layer)
		cartWrapper.on('click', function(event){
			if( $(event.target).is($(this)) ) toggleCart(true);
		});

		//delete an item from the cart
		cartList.on('click', '.delete-item', function(event){
			event.preventDefault();
			removeProduct($(event.target).parents('.product'));
		});

		//update item quantity
		cartList.on('change', 'select', function(event){
			quickUpdateCart();
		});

		//reinsert item deleted from the cart
		undo.on('click', 'a', function(event){
			clearInterval(undoTimeoutId);
			event.preventDefault();
			cartList.find('.deleted').addClass('undo-deleted').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
				$(this).off('webkitAnimationEnd oanimationend msAnimationEnd animationend').removeClass('deleted undo-deleted').removeAttr('style');
				quickUpdateCart();
			});
			undo.removeClass('visible');
		});
	}

	function toggleCart(bool) {
		var cartIsOpen = ( typeof bool === 'undefined' ) ? cartWrapper.hasClass('cart-open') : bool;
		
		if( cartIsOpen ) {
			cartWrapper.removeClass('cart-open');
			//reset undo
			clearInterval(undoTimeoutId);
			undo.removeClass('visible');
			cartList.find('.deleted').remove();

			setTimeout(function(){
				cartBody.scrollTop(0);
				//check if cart empty to hide it
				if( Number(cartCount.find('li').eq(0).text()) == 0) cartWrapper.addClass('empty');
			}, 500);
		} else {
			cartWrapper.addClass('cart-open');
		}
	}

	function addToCart(trigger) {
		// console.log(trigger[0]);
		var cartIsEmpty = cartWrapper.hasClass('empty');
		//update cart product list
		addProduct(trigger);
		//update number of items 
		updateCartCount(cartIsEmpty);
		//update total price
		updateCartTotal(trigger.data('price'), true);
		//show cart
		cartWrapper.removeClass('empty');
	}

	function addProduct(trigger) {
		var idParam = trigger[0].value;
		console.log(trigger);
		var productSrc = config.fidgeters[idParam].images[0];
		// console.log(productSrc);
		productName = config.fidgeters[idParam].id;
		// console.log(productName);
		//this is just a product placeholder
		//you should insert an item with the selected product info
		//replace productId, productName, price and url with your real product info
		if(orderParams == 'null'){
			orderParams = productName;
		} else{
			orderParams += ', ' + productName;
		}
		productId = productId + 1;
		var productsAdded = $('.product');
		// console.log(productsAdded);
		for(var index = 0; index < productsAdded.length; index ++){
			var inc = index + 1;
			if(productsAdded[productsAdded.length - index - 1].id == 'product_' + inc){
				// console.log($('#cd-product-' + inc).val());
				$('#cd-product-' + index + 1).val(parseInt($('#cd-product-' + inc + ' option:selected').text()) + 1).prop('selected', true);
			}
		}
		var productAdded = $('<li class="product" id="product_' + productId + '"><div class="product-image"><a href="#0"><img src="' + productSrc +'"></a></div><div class="product-details"><h3><a href="#0">' + productName +'</a></h3><span class="price">$' + trigger.data('price') + '</span><div class="actions"><a href="#0" class="delete-item">Delete</a><div class="quantity"><label for="cd-product-'+ productId +'">Qty</label><span class="select"><select id="cd-product-'+ productId +'" name="quantity"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option></select></span></div></div></div></li>');
		cartList.prepend(productAdded);
	}

	function removeProduct(product) {
		clearInterval(undoTimeoutId);
		cartList.find('.deleted').remove();
		
		var topPosition = product.offset().top - cartBody.children('ul').offset().top ,
			productQuantity = Number(product.find('.quantity').find('select').val()),
			productTotPrice = Number(product.find('.price').text().replace('$', '')) * productQuantity;
		
		product.css('top', topPosition+'px').addClass('deleted');

		//update items count + total price
		updateCartTotal(productTotPrice, false);
		updateCartCount(true, -productQuantity);
		undo.addClass('visible');

		//wait 8sec before completely remove the item
		undoTimeoutId = setTimeout(function(){
			undo.removeClass('visible');
			cartList.find('.deleted').remove();
		}, 8000);
	}

	function quickUpdateCart() {
		var quantity = 0;
		var price = 0;
		
		cartList.children('li:not(.deleted)').each(function(){
			var singleQuantity = Number($(this).find('select').val());
			quantity = quantity + singleQuantity;
			price = price + singleQuantity*Number($(this).find('.price').text().replace('$', ''));
		});

		cartTotal.text(price.toFixed(2));
		cartCount.find('li').eq(0).text(quantity);
		cartCount.find('li').eq(1).text(quantity+1);
	}

	function updateCartCount(emptyCart, quantity) {
		if( typeof quantity === 'undefined' ) {
			var actual = Number(cartCount.find('li').eq(0).text()) + 1;
			var next = actual + 1;
			
			if( emptyCart ) {
				cartCount.find('li').eq(0).text(actual);
				cartCount.find('li').eq(1).text(next);
			} else {
				cartCount.addClass('update-count');

				setTimeout(function() {
					cartCount.find('li').eq(0).text(actual);
				}, 150);

				setTimeout(function() {
					cartCount.removeClass('update-count');
				}, 200);

				setTimeout(function() {
					cartCount.find('li').eq(1).text(next);
				}, 230);
			}
		} else {
			var actual = Number(cartCount.find('li').eq(0).text()) + quantity;
			var next = actual + 1;
			
			cartCount.find('li').eq(0).text(actual);
			cartCount.find('li').eq(1).text(next);
		}
	}

	function updateCartTotal(price, bool) {
		bool ? cartTotal.text( (Number(cartTotal.text()) + price).toFixed(2) )  : cartTotal.text( (Number(cartTotal.text()) - price).toFixed(2) );
	}
});

	var orderParams = 'null';

	function draftOrder(){
		var htmlStr = 	'<div id="page">' +
				'<div class="row">' +
					'<textarea rows="1" cols="80" name="form-name" id="form-name" class="email-drafter" placeholder="Please provide your name so we know what to call you"></textarea>' +
					'<textarea rows="1" cols="80" name="form-email" id="form-email" class="email-drafter" placeholder="Please provide your email so we know how to contact you"></textarea>' +
					'<textarea rows="15" cols="80" name="comment" id="comment" class="email-drafter" placeholder="This order will go through as an email. You can add any customisations or special requests here."></textarea>' +
					'<textarea rows="20" cols="10" name="order-details" id="order-details"  hidden>' + orderParams + '</textarea>' +
				'</div>' +
				'<div class="row">' +
					'<button id="mail-order-button" type="button" class="order-btn">Send Order</button>' +
				'</div>' +
				'</div>';
		$('#page').replaceWith(htmlStr);
		
		$('#mail-order-button').click(function() {
			if($("#form-name").val() == ""){
				alert( "You have to enter your name or we won't know what to call you");
			}  else if($("#form-email").val() == ""){
				alert( "You have to enter your email or we won't know how to contact you");
			}  else {
			// console.log($("#form-name").val());
			// console.log($("#form-email").val());
			// console.log($("#comment").val());
			// console.log($("#order-details").val());
			var data = {
    				name: $("#form-name").val(),
    				email: $("#form-email").val(),
    				message: $("#comment").val(),
    				order: $("#order-details").val()
			};
 			$.ajax({
  				type: "POST",
  				url: "order.php", 
  				data: data
			}).done(function( msg ) {
  				var htmlStr = '<p>THANK YOU<p>' +
				'<div class="row">' +
					'<button id="return-btn" type="button" class="order-btn">Return to main site</button>' +
				'</div>';
  				$('#page').replaceWith(htmlStr);
  				$('#return-btn').click(function() {
  					window.location = 'http://www.ericinbrackets.co/fidgeters';
  				});
			});   
			} 
    		});
		
		var cartWrapper = $('.cd-cart-container');
		var cartIsOpen = ( typeof bool === 'undefined' ) ? cartWrapper.hasClass('cart-open') : bool;
		cartWrapper.removeClass('cart-open');
		//reset undo
		//clearInterval(undoTimeoutId);
		undo.removeClass('visible');
		cartList.find('.deleted').remove();

		setTimeout(function(){
			cartBody.scrollTop(0);
			//check if cart empty to hide it
			cartWrapper.addClass('empty');
		}, 500);
	}

	function sendOrder(){
		
	}

	
	function openNav(e) {
		console.log('test');
		e.preventDefault();
		if(this.id != "hiddenshowcase" && this.id != "null"){
			// console.log(this);
			var fidg = config.fidgeters[parseInt(this.id)];
			// console.log(fidg);
			$('#hiddenshowcase').children('img').attr("src", fidg.images[0]);
			$('#hiddenshowcase').children('p').html(fidg.copy);
			$('#hiddenshowcase').children('h3').html(fidg.id);
			$('#hiddenshowcase').children('button').val(this.id);
			$('#hiddenshowcase').children('button').data('price', fidg.price);
			$('#hiddenshowcase').children('button').data('prod', fidg.id);
			$("#myNav").show();
			}
	}

	function closeNav(e) {
		e.preventDefault();
			document.getElementById("myNav").style.display = "none";
	}

	function onShowcaseClicked(e){
		e.preventDefault();
	}
/**  
 * jQuery Plugin: Custom Form Integration
 *   
 *  @package    JS Plugins
 *  @category   jquery plugin
 *  @name       jquery.custom-form.js
 *  @author     Rafael F. Silva <rafaelsilva@phocus.com.br>
 *  @link       /js/plugins/jquery.custom-form.js
 *  @since      14/01/2014
 *
 *  Este plugin necessita de outros plugins para certas funcionalidades funcionarem,
 *  como: select customizado (select2), máscara (maskedinput) e monetização (maskMoney).
 *
 */

(function($) {
	'use strict';

	// Plugin avaible methods
	var methods = {
		init: function( form, options ) {
			var settings = $.extend({}, $.fn.customForm.defaults, options);
			var $form = $(form);

			// Storage the settings for later use
			$form.data('settings', settings);

			// General masks
			// Required plugin: maskedinput
			if( $.fn.mask ) {
				$form.find('.field.date input').mask('99/99/9999');
				$form.find('.field.time input').mask('99:99:99');
				$form.find('.field.phone input').mask('99 99999999?9');
				$form.find('.field.cpf input').mask('999.999.999-99');
				$form.find('.field.cnpj input').mask('99.999.999/9999-99');
				$form.find('.field.cep input').mask('99999-999');
				$form.find('.field.carPlate input').mask('aaa-9999');
			}

			// Money and float masks
			// Required plugin: maskMoney
			if( $.fn.maskMoney ) {
				var defaults = {
					symbol: 'R$',
					showSymbol: true,
					symbolStay: true,
					thousands: '.',
					decimal: ',',
					precision: 2,
					defaultZero: true,
					allowZero: false,
					allowNegative: false
				};

				$form.find('.field.money input').each(function() {
					var options = $.extend( defaults, $(this).data('options') || {} );

					$(this).maskMoney( options );
				});

				$form.find('.field.float input').each(function() {
					var options = $.extend( defaults, {
						symbol: '',
						thousands: ''
					});

					$(this).maskMoney( options );
				});
			}

			// Custom select
			// Required plugin: select2
			if( $.fn.select2 ) {
				// Sem campo de busca
				$form.find('.field select.select2-no-search').each(function() {
					var options = $(this).data('options') || {};

					$.extend( options, { minimumResultsForSearch: -1 } );

					$(this).data('options', options);
				});

				// Procura por todos os selects com a classe começando em "select2"
				$form.find('.field select[class*="select2"]').each(function() {
					var thisOptions = $(this).data('options') || {};

					var options = $.extend({
						placeholder: true,
						containerCssClass: 'select2-custom',
						dropdownCssClass: 'select2-custom'
					}, thisOptions );

					$(this).select2( options );
				});
			}

			// State field updates the city field
			$form.find('.field.state select').change(function(){
				var target = $( $(this).data('target') );
				var url = $(this).data('request-url');

				if( target && url && $(this).val() != '' ) {
					$.ajax({
						url: url + $(this).val(),
						dataType: 'json',
						beforeSend: function() {
							target.html('<option value=""></option>').attr('placeholder', 'Carregando...');

							if( $.fn.select2 ) {
								target.select2('val', '');
							}
						},
						success: function(items){
							var cities = '<option value=""></option>';

							$.each(items, function (key_city, val_city) {
								cities += '<option value="' + key_city + '">' + val_city + '</option>';
							});

							target.html(cities).attr('placeholder', 'Cidade');

							if( $.fn.select2 ) {
								target.select2('val', '').select2('close');
							}
						}
					});
				}
			});

			$form.on('submit', function( event ) {
				$(this).customForm('validate', {
					success: function( errorContainer ) {
						var $form = $(this);
						var $errorContainer = $(errorContainer);

						$form.find('input[type="submit"]').attr('disabled', true);
						$errorContainer.find('.sending').show();

						if( $form.hasClass('ajaxForm') ) {
							event.preventDefault();

							$.ajax({
								url: this.action,
								type: this.method || 'POST',
								data: $(this).serialize(),
								dataType: 'json',
								beforeSend: function() {
									$errorContainer.find('.return').removeClass('success error');
								},
								success: function( response ) {
									$errorContainer.find('p').hide();
									if( response ) {
										$errorContainer.find('.return').show().addClass(response.error ? 'error' : 'success').html(response.message);

										if( response.error == false ) {
											$form.find('input[type="text"], input[type="password"], input[type="email"], input[type="date"], input[type="file"], select:not(.select2), textarea').val('');
											$form.find('input[type="checkbox"], input[type="radio"]').attr('checked', false).parent().removeClass('selected');
											if( $.fn.select2 ) {
												$form.find('select[class*="select2"]').select2('val', '', true);
											}

											$form.find('.field[data-initial-classes]').each(function() {
												$(this).removeClass().addClass( $(this).data('initial-classes') );
											});
										}
									}
									else {
										$errorContainer.find('.sendError').show().find('span').text('null');
									}

									// Se for definida alguma URL, redireciona
									if( response.url ) {
										window.location.href = response.url;
									}

									// Se tiver alguma callback logo após o AJAX, executa
									if( response.data ) {
										$form.trigger('ajax-callback', response.data);
									}
								},
								error: function( x, t, e ) {
									$errorContainer.find('p').hide();
									$errorContainer.find('.sendError').show().find('span').text(t);
								},
								complete: function() {
									$form.find('input[type="submit"]').removeAttr('disabled');
								}
							});
						}
					}
				});
			});
		},

		// Validate the entire form
		validate: function( form, options ) {
			var $errorContainer;
			var settings = $(form).data('settings');
			var stopSend = false;

			// Set the messages container
			if( typeof( settings.errorContainer ) == 'string' ) {
				$errorContainer = $(form).find( settings.errorContainer );
			}
			else {
				$errorContainer = settings.errorContainer;
			}

			// Validate each field
			var filterExpr = '.' + settings.requiredClass + ':not([disabled])' + ( settings.ignoreInvisible ? ':visible' : '' );

			$(form).find('input, select, textarea').filter(filterExpr).each(function() {
				if(
					// For texts
					(
						this.tagName == 'INPUT'
						&& (
							this.type == 'text'
							|| this.type == 'password'
						)
						&& this.value == ''
					)

					// For files
					|| (
						this.tagName == 'INPUT'
						&& this.type == 'file'
						&& (
							this.value == ''
							|| $(this).closest('.field').hasClass( settings.errorClass )
						)
					)

					// For dates
					|| (
						this.tagName == 'INPUT'
						&& this.type == 'text'
						&& $(this).closest('.field').hasClass('date')
						&& (
							this.value == ''
							|| !( /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/g.exec( this.value ) )
						)
					)

					// For emails
					|| (
						this.tagName == 'INPUT'
						&& (
							this.type == 'text'
							|| this.type == 'email'
						)
						&& $(this).closest('.field').hasClass('email')
						&& (
							this.value == ''
							|| !( /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2}/.exec( this.value ) )
						)
					)

					// For URLs
					|| (
						this.tagName == 'INPUT'
						&& (
							this.type == 'text'
							|| this.type == 'url'
						)
						&& $(this).closest('.field').hasClass('url')
						&& (
							this.value == ''
							|| !( /(http:\/\/)([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2,3}/.exec( this.value ) )
						)
					)

					// For equals to
					|| (
						$(this).closest('.field').hasClass('equalsTo')
						&& (
							$(this).val().length == 0
							|| $(this).val() != $( $(this).data('equals-to') ).val()
						)
					)

					// For checkboxes
					|| (
						this.tagName == 'INPUT'
						&& (
							this.type == 'checkbox'
						)
						&& this.checked == false
					)

					// For radios
					|| (
						this.tagName == 'INPUT'
						&& (
							this.type == 'radio'
						)
						&& $(this).closest('form').find('[name="' + this.name + '"]:checked').length == 0
					)

					// for textareas
					|| (
						this.tagName == 'TEXTAREA'
						&& $(this).val() == ''
					)

					// For selects
					|| (
						this.tagName == 'SELECT'
						&& (
							$(this).val() == ''
							|| (
								$(this).val().length
								&& $(this).val().length == 0
							)
						)
					)
				) {
					stopSend = true;
					$(this).closest('.field').addClass( settings.errorClass );
				}
				else {
					$(this).closest('.field').removeClass( settings.errorClass );
				}
			});

			$errorContainer.find('p').hide();
			if( stopSend ) {
				event.preventDefault();

				$(form).data('is-valid', false);
				$(form).find('.messages .invalid').show();
			}
			else {
				$(form).data('is-valid', true);

				if( options[0].success ) {
					options[0].success.apply( form, $errorContainer );
				}
			}
		}
	}

	// Plugin initialization or method call
	$.fn.customForm = function( methodOrOptions ) {
		if( methods[ methodOrOptions ] ) {
			var options = Array.prototype.slice.call( arguments, 1 );

			return this.each(function(){
				methods[ methodOrOptions ].call( methods, this, options);
			});
		}
		else if ( typeof methodOrOptions === 'object' || !methodOrOptions ) {
			return this.each(function(){
				methods.init.call( methods, this, arguments );
			});
		}
		else {
			$.error('Method ' +  methodOrOptions + ' does not exist on jQuery.customForm.');
		}
	};

	// Plugin defaults
	$.fn.customForm.defaults = {
		requiredClass: 'required',
		errorClass: 'error',
		errorContainer: '.messages',
		ignoreInvisible: true
	};
})(jQuery);
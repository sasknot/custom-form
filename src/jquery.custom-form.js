/*!*
 * jQuery Plugin: Custom Form Integration
 *
 *  @package    JS Plugins
 *  @category   jquery plugin
 *  @author     Rafael F. Silva <rafaelfsilva1@gmail.com>
 *  @link       /js/plugins/jquery.custom-form.js
 *  @since      14/01/2014
 *  @version    1.0.54
 *
 *  This plugin require other plugins to certain features work, like:
 *  custom select (select2), mask (maskedinput) and monetization (maskMoney).
 *
**/

(function($) {
	'use strict';

	// Plugin avaible methods
	var CustomForm = {
		_setSettings: function( form, options ) {
			var settings = $.extend({}, $.fn.customForm.defaults, options);

			// Set the messages container
			if( typeof( settings.errorContainer ) == 'string' ) {
				settings.errorContainer = $(form).find( settings.errorContainer );
			}

			// Define the regexp for date, based in the dateFormat setting
			settings.dateFormat = settings.dateFormat.toLowerCase();
			settings.dateRegExp = new RegExp(
				'('
					+ '(' + settings.dateFormat.replace('dd', '(0[1-9]|[12][0-9]|3[01])').replace('mm', '(0[13578]|1[02])').replace('yyyy', '((1[0-9]|[2-9][0-9])[0-9]{2})').replace('yy', '([0-9]{2})') + ')'
					+ '|(' + settings.dateFormat.replace('dd', '(0[1-9]|[12][0-9]|30)').replace('mm', '(0[13456789]|1[012])').replace('yyyy', '((1[0-9]|[2-9][0-9])[0-9]{2})').replace('yy', '([0-9]{2})') + ')'
					+ '|(' + settings.dateFormat.replace('dd', '(0[1-9]|1[0-9]|2[0-8])').replace('mm', '02').replace('yyyy', '((1[0-9]|[2-9][0-9])[0-9]{2})').replace('yy', '([0-9]{2})') + ')'
					+ '|(' + settings.dateFormat.replace('dd', '29').replace('mm', '02').replace('yyyy', '((1[6-9]|[2-9][0-9])(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))').replace('yy', '(0[048]|[2468][048]|[13579][26])') + ')'
				+ ')'
			, 'g');

			// Define the regexp for time, base in the timeFormat setting
			settings.timeFormat = settings.timeFormat.toLowerCase();
			settings.timeRegExp = new RegExp(settings.timeFormat.replace('hh', '([01][0-9]|2[0-3])').replace(/mm|ss/g, '[0-5][0-9]'), 'g');

			// Storage the settings for later use
			$(form).data('settings', settings);

			return settings;
		},

		init: function( form, options ) {
			var $form = $(form);

			var settings = this._setSettings( form, options );

			// Set initial value for valid
			$(form).data('is-valid', false);

			// General masks
			// Required plugin: maskedinput
			if( $.fn.mask ) {
				$form.find('.field.date input[type="text"]').mask( settings.dateFormat.replace(/[dmy]/g, '9') );
				$form.find('.field.time input[type="text"]').mask( settings.timeFormat.replace(/[hms]/g, '9') );
				$form.find('.field.phone input[type="text"]').mask('99 99999999?9');
				$form.find('.field.cpf input[type="text"]').mask('999.999.999-99');
				$form.find('.field.cnpj input[type="text"]').mask('99.999.999/9999-99');
				$form.find('.field.cep input[type="text"]').mask('99999-999');
				$form.find('.field.carPlate input[type="text"]').mask('aaa-9999');
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

				$form.find('.field.money input[type="text"]').each(function() {
					var options = $.extend( defaults, $(this).data('options') || {} );

					$(this).maskMoney( options );
				});

				$form.find('.field.float input[type="text"]').each(function() {
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
				// Procura por todos os selects com a classe começando em "select2"
				$form.find('.field select[class*="select2"]').each(function() {
					var thisOptions = $(this).data('options') || {};

					// Without search field
					if( $(this).hasClass('select2-no-search') ) {
						thisOptions.minimumResultsForSearch = -1;
					}

					// Tags format
					if( $(this).hasClass('select2-tags') ) {
						thisOptions.tags = [];
					}

					// Unique selection
					if( $(this).hasClass('select2-unique-selection') ) {
						thisOptions.multiple = true;
						thisOptions.allowClear = true;

						$(this)
							.on('select2-selecting', function( event ) {
								var uniqueKey = $(this).find('option[value="' + event.val + '"]').data('unique-key');

								$(this).find('option[data-unique="' + uniqueKey + '"]').not('option[value="' + event.val + '"]').attr('disabled', 'disabled');
							})
							.on('select2-removed', function( event ) {
								var uniqueKey = $(this).find('option[value="' + event.val + '"]').data('unique-key');

								$(this).find('option[data-unique="' + uniqueKey + '"]').removeAttr('disabled');
							});
					}

					var options = $.extend({
						placeholder: true,
						adaptContainerCssClass: function(){ return ''; },
						containerCssClass: 'select2-custom',
						dropdownCssClass: 'select2-custom'
					}, thisOptions );

					$(this).select2( options );
				});
			}

			// A field that updates another targeted field
			$form.find('.field.state select, .field.target select').change(function(){
				var $target = $( $(this).data('target') );
				var url = $(this).data('request-url');

				if( $target && url && $(this).val() !== '' ) {
					// Store the placeholder
					var oldPlaceholder = $target.attr('placeholder') || $target.data('placeholder');

					// Check if has been targetted, successively
					var values = [$(this).val()];
					var current = this;

					while( $('[data-target="#' + current.id + '"]').length > 0 ) {
						current = $('[data-target="#' + current.id + '"]').get(0);
						values.unshift( $(current).val() );
					}

					$.ajax({
						url: url + values.join('/'),
						dataType: 'json',
						beforeSend: function() {
							$target.html('<option value=""></option>').attr('placeholder', 'Carregando...');

							if( $.fn.select2 ) {
								$target.select2('val', '');
							}
						},
						success: function(items){
							var options = '<option value=""></option>';

							$.each(items, function (id, value) {
								options += '<option value="' + id + '">' + value + '</option>';
							});

							$target.html(options);

							// Get the stored placeholder
							if( $target.attr('placeholder') ) {
								$target.attr('placeholder', oldPlaceholder);
							}
							else {
								$target.data('placeholder', oldPlaceholder);
							}

							// If it has a initial value to select
							if( $target.data('initial-value') ) {
								$target.val($target.data('initial-value'));
							}

							if( $.fn.select2 ) {
								$target.select2('val', '').select2('close');

								// If it has a initial value to select
								if( $target.data('initial-value') ) {
									$target.select2('val', $target.data('initial-value'));
								}
							}

							// Check if has targets in the current targetted element, successively
							var $current = $target;
							while( $current.closest('.field').hasClass('target') ) {
								$current = $( $current.data('target') );

								$current.html('<option value=""></option>');

								if( $.fn.select2 ) {
									$current.select2('val', '').select2('close');
								}
							}
						}
					});
				}
			})
			.on('select2-clearing', function() {
				var $target = $( $(this).data('target') );

				$target.html('<option value=""></option>').select2('val', '').select2('close');

				// Check if has targets in the current targetted element, successively
				var $current = $target;
				while( $current.closest('.field').hasClass('target') ) {
					$current = $( $current.data('target') );

					$current.html('<option value=""></option>');

					if( $.fn.select2 ) {
						$current.select2('val', '').select2('close');
					}
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
							$.ajax({
								url: this.action,
								type: this.method || 'POST',
								data: $form.serialize(),
								dataType: 'json',
								beforeSend: function() {
									$errorContainer.find('.return').removeClass('success error').html('');
								},
								success: function( response ) {
									$errorContainer.find('p').hide();
									if( response ) {
										if( response.message ) {
											$errorContainer.find('.return').addClass((response.error ? 'error' : 'success')).html(response.message).show();
										}

										// Se for definida alguma URL, redireciona
										if ( response.url || response.redirect ) {
											window.location.href = response.url || response.redirect;
										}

										// Se tiver alguma callback logo após o AJAX, executa
										if( response.data ) {
											$form.trigger('ajax-callback', response.data);
										}

										if( response.error === false && response.clear ) {
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

				if( $(this).hasClass('ajaxForm') || !$(this).data('is-valid') ) {
					event.preventDefault();
				}
			});
		},

		// Validate the entire form
		validate: function( form, options ) {
			var settings = $(form).data('settings') || this._setSettings( form, options.options || {} );
			var $errorContainer = settings.errorContainer;
			var stopSend = false;

			// Validates each field
			var filterExpr = '.' + settings.requiredClass + ':not([disabled])';
			var $formFields = $(form).find('input, select, textarea').filter(filterExpr);

			// FIXME: define a regular container for form fields
			if( settings.ignoreInvisible ) {
				$formFields = $formFields.closest('.field').filter(':visible').find('input, select, textarea').filter(':visible').filter(filterExpr);
			}

			// Reset the date and time regexp for more uses
			settings.dateRegExp.lastIndex = 0;
			settings.timeRegExp.lastIndex = 0;

			$formFields.each(function() {
				if(
					// For texts
					(
						this.tagName == 'INPUT'
						&& (
							this.type == 'text'
							|| this.type == 'password'
						)
						&& this.value === ''
						&& (
							$(this).closest('.field').hasClass('depends') === false
							&& $(this).closest('.field').hasClass('dependsNot') === false
						)
					)

					// For files
					|| (
						this.tagName == 'INPUT'
						&& this.type == 'file'
						&& (
							this.value === ''
							|| $(this).closest('.field').hasClass( settings.errorClass )
						)
					)

					// For dates
					|| (
						this.tagName == 'INPUT'
						&& this.type == 'text'
						&& $(this).closest('.field').hasClass('date')
						&& (
							this.value === ''
							|| !settings.dateRegExp.test( this.value )
						)
					)

					// For times
					|| (
						this.tagName == 'INPUT'
						&& $(this).closest('.field').hasClass('time')
						&& (
							this.value === ''
							|| !settings.timeRegExp.test( this.value )
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
							this.value === ''
							|| !( /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2}/.test( this.value ) )
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
							this.value === ''
							|| !( /(http:\/\/)?(www)([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2,3}/.test( this.value ) )
						)
					)

					// For CPFs
					|| (
						this.tagName == 'INPUT'
						&& $(this).closest('.field').hasClass('cpf')
						&& (
							this.value === ''
							|| !(function(e){var t,n,r,i,s,o;e=e.replace(/[^0-9]/g,"");o=1;if(e.length<11){return false;}for(i=0;i<e.length-1;i++){if(e.charAt(i)!=e.charAt(i+1)){o=0;break;}}if(!o){t=e.substring(0,9);n=e.substring(9);r=0;for(i=10;i>1;i--){r+=t.charAt(10-i)*i;}s=r%11<2?0:11-r%11;if(s!=n.charAt(0)){return false;}t=e.substring(0,10);r=0;for(i=11;i>1;i--){r+=t.charAt(11-i)*i;}s=r%11<2?0:11-r%11;if(s!=n.charAt(1)){return false;}return true;}else{return false;}})(this.value)
						)
					)

					// For equals to
					|| (
						$(this).closest('.field').hasClass('equalsTo')
						&& (
							$(this).val().length === 0
							|| $(this).val() != $( $(this).data('equals-to') ).val()
						)
					)

					// For depends
					|| (
						$(this).closest('.field').hasClass('depends')
						&& $( $(this).data('depends') ).is(':checked')
						&& $(this).val().length === 0
					)

					// For depends not
					|| (
						$(this).closest('.field').hasClass('dependsNot')
						&& $( $(this).data('depends') ).is(':checked') === false
						&& $(this).val().length === 0
					)

					// For checkboxes
					|| (
						this.tagName == 'INPUT'
						&& (
							this.type == 'checkbox'
						)
						&& this.checked === false
					)

					// For radios
					|| (
						this.tagName == 'INPUT'
						&& (
							this.type == 'radio'
						)
						&& $(this).closest('form').find('[name="' + this.name + '"]:checked').length === 0
					)

					// For textareas
					|| (
						this.tagName == 'TEXTAREA'
						&& $(this).val() === ''
					)

					// For selects
					|| (
						this.tagName == 'SELECT'
						&& (
							$(this).val() === undefined
							|| $(this).val() === null
							|| $(this).val() === ''
							|| (
								$(this).val().length
								&& $(this).val().length === 0
							)
						)
						&& (
							$(this).closest('.field').hasClass('depends') === false
							&& $(this).closest('.field').hasClass('dependsNot') === false
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
				$(form).data('is-valid', false);
				$errorContainer.find('.invalid').show();
			}
			else {
				$(form).data('is-valid', true);

				if( options.success ) {
					options.success.apply( form, $errorContainer );
				}
			}
		},

		destroy: function( form ) {
			
			// Clear form settings
			$(form).data('settings', false);

			// Remove submit event
			$(form).off('submit');

			// TODO: Unmask
			// TODO: Unmask money
			// TODO: select2 destroy
		}
	};

	// Plugin initialization or method call
	$.fn.customForm = function( methodOrOptions ) {
		if( CustomForm[ methodOrOptions ] ) {
			var options = typeof(arguments[1]) === 'object' ? arguments[1] : {};

			return this.each(function(){
				CustomForm[ methodOrOptions ].call( CustomForm, this, options );
			});
		}
		else if ( typeof(methodOrOptions) === 'object' || !methodOrOptions ) {
			return this.each(function(){
				CustomForm.init.call( CustomForm, this, methodOrOptions );
			});
		}
		else {
			$.error('Method ' +  methodOrOptions + ' does not exist on jQuery customForm');
		}
	};

	// Plugin defaults
	$.fn.customForm.defaults = {
		requiredClass: 'required',
		errorClass: 'error',
		errorContainer: '.messages',
		ignoreInvisible: true,
		dateFormat: 'dd/mm/yyyy',
		timeFormat: 'hh:mm:ss'
	};
})(jQuery);